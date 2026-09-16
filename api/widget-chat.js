import { createClient } from "@supabase/supabase-js";
import { generateReply, isRateLimitError } from "../lib/geminiChat.js";

// Give the serverless function room for cold starts + Gemini latency
// (Vercel supports up to 60s; default is far shorter and causes 500s).
export const maxDuration = 60;

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "placeholder-key"
);

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

export default async function handler(req, res) {
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
      const { data: allowedDomains } = await supabaseAdmin
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

    // --- 3 + 4. Fetch chatbot config (business name via FK join) and validate
    // the conversation in parallel — cuts ~1 round trip off every message ---
    const chatbotPromise = supabaseAdmin
      .from("chatbots")
      .select("chatbot_name, public_agent_name, tone, reply_language, welcome_message, business_id, businesses(name)")
      .eq("id", chatbotId)
      .single();

    const conversationPromise = conversationId
      ? supabaseAdmin
          .from("conversations")
          .select("id, chatbot_id, visitor_id")
          .eq("id", conversationId)
          .maybeSingle()
      : Promise.resolve({ data: null });

    const [{ data: chatbot, error: chatbotError }, { data: existingConvo }] =
      await Promise.all([chatbotPromise, conversationPromise]);

    if (chatbotError || !chatbot) {
      return res.status(404).json({ error: "Chatbot not found." });
    }

    const businessName = chatbot.businesses?.name || null;

    // Reuse the conversation only if it belongs to this chatbot + visitor —
    // prevents injecting messages into someone else's conversation.
    let convoId = null;
    let finalVisitorId = visitorId;

    const belongsToBot = existingConvo && existingConvo.chatbot_id === chatbotId;
    const belongsToVisitor =
      !existingConvo?.visitor_id ||
      !finalVisitorId ||
      existingConvo.visitor_id === finalVisitorId;

    if (belongsToBot && belongsToVisitor) {
      convoId = existingConvo.id;
    }
    // Otherwise: invalid or foreign conversationId — start a fresh
    // conversation. The widget self-heals from the new ID we return.

    if (!convoId) {
      finalVisitorId = finalVisitorId || generateVisitorId();
      const { data: newConvo } = await supabaseAdmin
        .from("conversations")
        .insert({
          chatbot_id: chatbotId,
          visitor_id: finalVisitorId,
          status: "open",
        })
        .select()
        .single();
      convoId = newConvo?.id;
    }

    // --- 5. Log the user's message ---
    if (convoId) {
      await supabaseAdmin.from("messages").insert({
        conversation_id: convoId,
        role: "user",
        content: message,
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
          // TEMPORARY DIAGNOSTIC: exact Gemini reason per attempt (quota vs
          // overloaded vs model missing). Remove once quota is resolved.
          errorDetail: geminiErr?.attempts?.length
            ? geminiErr.attempts
            : String(geminiErr?.message || geminiErr),
        });
      }
      throw geminiErr;
    }

    const reply = result.reply;

    // --- 7. Log the bot's reply + update conversation timestamp (parallel) ---
    if (convoId) {
      await Promise.all([
        supabaseAdmin.from("messages").insert({
          conversation_id: convoId,
          role: "assistant",
          content: reply,
        }),
        supabaseAdmin
          .from("conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", convoId),
      ]);
    }

    return res.status(200).json({
      reply,
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
      errorDetail: error?.message || String(error),
    });
  }
}
