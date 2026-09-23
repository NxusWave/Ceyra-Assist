import { createClient } from "@supabase/supabase-js";
import { generateReply, isRateLimitError } from "../lib/geminiChat.js";

// 7-day free trial window (kept in sync with src/lib/trial.ts).
const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// Give the serverless function room for cold starts + Gemini latency
// (Vercel supports up to 60s; default is far shorter and causes 500s).
export const maxDuration = 60;

let _supabaseAdmin = null;
function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabaseAdmin;
}

function extractHostname(origin) {
  if (!origin) return null;
  try {
    return new URL(origin).hostname;
  } catch {
    return null;
  }
}

// crypto.randomUUID isn't guaranteed on every serverless runtime — fall back.
function generateVisitorId() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch (_) {
    /* fall through to the manual generator */
  }
  return "v_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function buildSystemInstruction({ businessName, chatbotName, tone, replyLanguage }) {
  let langInstruction =
    "Always reply in the same language and script the customer used — Sinhala, Tamil, English, or a Singlish/Tanglish mix — matching their tone naturally.";
  if (replyLanguage && replyLanguage !== "Auto-detect") {
    langInstruction = `Always reply in ${replyLanguage}, regardless of what language the customer writes in.`;
  }
  return `You are "${chatbotName || "the assistant"}", the AI customer support assistant for "${businessName}". Speak in a ${(tone || "friendly").toLowerCase()} tone. ${langInstruction} Keep answers short and directly useful. If asked something specific you don't have details about, politely say you'd connect them with the team for that, without inventing details.`;
}

// True only when the owner's assist package exists, is still on 'trial' and
// started more than 7 days ago. Missing/unknown data never blocks chat
// (fail-open so paid users are never locked out by an infra hiccup).
async function isTrialExpired(ownerId) {
  if (!ownerId) return false;
  try {
    const { data: pkg } = await getSupabaseAdmin()
      .from("packages")
      .select("status, created_at")
      .eq("user_id", ownerId)
      .eq("product", "assist")
      .maybeSingle();

    if (!pkg || pkg.status !== "trial" || !pkg.created_at) return false;
    const startedAt = new Date(pkg.created_at).getTime();
    if (Number.isNaN(startedAt)) return false;
    return Date.now() - startedAt > TRIAL_DURATION_MS;
  } catch (err) {
    console.error("widget-chat trial check skipped:", err?.message || err);
    return false;
  }
}

export default async function handler(req, res) {
  console.log("DEBUG env check (widget-chat):", {
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
  const origin = req.headers.origin || "";
  const hostname = extractHostname(origin);

  // --- CORS: handle preflight ---
  if (req.method === "OPTIONS") {
    // Preflight has no body context yet — allow the origin tentatively;
    // the actual POST below still does the real domain check.
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { chatbotId, message, conversationId, visitorId } = req.body || {};

  if (!chatbotId || !message || typeof message !== "string") {
    return res.status(400).json({ error: "chatbotId and message are required" });
  }

  try {
    // --- 1. Domain/origin check ---
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

    if (!isLocalhost) {
      const { data: allowedDomains } = await getSupabaseAdmin()
        .from("chatbot_domains")
        .select("domain")
        .eq("chatbot_id", chatbotId);

      const domainList = (allowedDomains || []).map((d) => d.domain);
      const isAllowed = hostname && domainList.includes(hostname);

      if (!isAllowed) {
        return res.status(403).json({ error: "This domain is not authorized for this chatbot." });
      }
    }

    // From here on, this origin is authorized — echo it back for CORS
    res.setHeader("Access-Control-Allow-Origin", origin);

    // --- 2. Rate limiting (best-effort; skip gracefully if Upstash env vars aren't set) ---
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { Ratelimit } = await import("@upstash/ratelimit");
        const { Redis } = await import("@upstash/redis");
        const redis = new Redis({
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN,
        });

        const visitorKey = visitorId || "anonymous";
        const perVisitorLimit = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(15, "60 s"),
          prefix: "widget-visitor",
        });
        const perChatbotLimit = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(300, "60 s"),
          prefix: "widget-chatbot",
        });

        const [visitorResult, chatbotResult] = await Promise.all([
          perVisitorLimit.limit(`${chatbotId}:${visitorKey}`),
          perChatbotLimit.limit(chatbotId),
        ]);

        if (!visitorResult.success || !chatbotResult.success) {
          return res.status(429).json({ error: "Too many messages. Please slow down." });
        }
      } catch (rateErr) {
        // Rate limiting must never break the chat — degrade gracefully.
        console.error("widget-chat rate limit skipped:", rateErr?.message || rateErr);
      }
    }

    // --- 3. Fetch chatbot config (business name via FK join) ---
    const { data: chatbot, error: chatbotError } = await getSupabaseAdmin()
      .from("chatbots")
      .select("chatbot_name, public_agent_name, tone, reply_language, welcome_message, business_id, status, businesses(owner_id, name)")
      .eq("id", chatbotId)
      .single();

    if (chatbotError || !chatbot) {
      return res.status(404).json({ error: "Chatbot not found." });
    }

    if (chatbot.status === "paused") {
      return res.status(403).json({
        error: "This assistant is currently unavailable — its free trial has ended.",
        code: "TRIAL_EXPIRED",
      });
    }

    const businessName = chatbot.businesses?.name || null;

    // --- 3b. Trial enforcement: visitors get no AI replies once the owner's
    // 7-day trial has expired (paid plans pass through untouched).
    const trialExpired = await isTrialExpired(chatbot.businesses?.owner_id);
    if (trialExpired) {
      return res.status(403).json({
        error: "This assistant is currently unavailable — its free trial has ended.",
        code: "TRIAL_EXPIRED",
      });
    }

    // --- 4. Resolve conversation & check mode ---
    let convoId = conversationId;
    let finalVisitorId = visitorId;
    let conversationMode = 'ai';

    if (convoId) {
      // Check the existing conversation's status + mode in one query
      const { data: existingConvo } = await getSupabaseAdmin()
        .from("conversations")
        .select("id, status, mode")
        .eq("id", convoId)
        .single();

      if (!existingConvo || existingConvo.status === "closed") {
        // Referenced conversation is closed (or missing) — start a
        // fresh one instead of reopening it
        convoId = null;
      } else {
        conversationMode = existingConvo.mode || "ai";
      }
    }

    if (!convoId) {
      finalVisitorId = finalVisitorId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : generateVisitorId());
      const { data: newConvo } = await getSupabaseAdmin()
        .from("conversations")
        .insert({
          chatbot_id: chatbotId,
          visitor_id: finalVisitorId,
          status: "open",
        })
        .select()
        .single();
      convoId = newConvo?.id;
      conversationMode = "ai"; // brand-new conversations always start in AI mode
    }

    // --- 5. Log the user's message ---
    if (convoId) {
      await getSupabaseAdmin().from("messages").insert({
        conversation_id: convoId,
        role: "user",
        content: message,
      });
    }

    // If a human has taken over, skip Gemini entirely and return early
    if (conversationMode === "human") {
      return res.status(200).json({
        reply: null,
        mode: "human",
        conversationId: convoId,
        visitorId: finalVisitorId,
      });
    }

    // --- 6. Call Gemini (per-model retries + model fallback) ---
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "An internal error occurred. Please try again later." });
    }

    const systemInstruction = buildSystemInstruction({
      businessName: businessName,
      chatbotName: chatbot.public_agent_name,
      tone: chatbot.tone,
      replyLanguage: chatbot.reply_language,
    });

    let result;
    try {
      result = await generateReply({ apiKey, message, systemInstruction });
    } catch (geminiErr) {
      if (isRateLimitError(geminiErr)) {
        // Google-side quota/overload — friendly, retryable response.
        return res.status(429).json({
          error: "The assistant is busy right now — please send your message again in a moment.",
        });
      }
      throw geminiErr;
    }

    const reply = result.reply;

    // --- 7. Log the bot's reply + update conversation timestamp (parallel) ---
    if (convoId) {
      await Promise.all([
        getSupabaseAdmin().from("messages").insert({
          conversation_id: convoId,
          role: "assistant",
          content: reply,
        }),
        getSupabaseAdmin()
          .from("conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", convoId),
      ]);
    }

    return res.status(200).json({
      reply,
      mode: "ai",
      conversationId: convoId,
      visitorId: finalVisitorId,
    });
  } catch (error) {
    console.error("widget-chat error:", {
      message: error?.message || String(error),
      stack: error?.stack,
      chatbotId,
      origin,
    });
    return res.status(500).json({
      error: "An error occurred while processing your request. Please try again later.",
    });
  }
}
