import { createClient } from "@supabase/supabase-js";

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

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  const hostname = extractHostname(origin);

  // Set CORS headers unconditionally, before any logic that could
  // fail or return early — every response (success or error) must
  // carry this, or the browser hides the real error behind a
  // generic "blocked by CORS policy" message.
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET", "OPTIONS"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { chatbotId } = req.query || {};
  if (!chatbotId) {
    return res.status(400).json({ error: "chatbotId is required" });
  }

  try {
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


    const { data: chatbot, error } = await getSupabaseAdmin()
      .from("chatbots")
      .select("status, public_agent_name, avatar_url, primary_color, welcome_message, businesses(owner_id)")
      .eq("id", chatbotId)
      .single();

    if (error || !chatbot) {
      return res.status(404).json({ error: "Chatbot not found." });
    }

    // A paused bot's widget must not come alive at all — the visitor sees the
    // widget's "unavailable" state instead of a fully-rendered chat.
    if (chatbot.status === "paused") {
      return res.status(403).json({ error: "This assistant is currently paused.", code: "BOT_PAUSED" });
    }

    // Same policy as widget-chat: an expired trial stops serving config.
    const ownerId = chatbot.businesses?.owner_id;
    if (ownerId) {
      try {
        const { data: pkg } = await getSupabaseAdmin()
          .from("packages")
          .select("status, created_at")
          .eq("user_id", ownerId)
          .eq("product", "assist")
          .maybeSingle();

        if (
          pkg &&
          pkg.status === "trial" &&
          pkg.created_at &&
          Date.now() - new Date(pkg.created_at).getTime() > 7 * 24 * 60 * 60 * 1000
        ) {
          return res.status(403).json({
            error: "This assistant is currently unavailable — its free trial has ended.",
            code: "TRIAL_EXPIRED",
          });
        }
      } catch (trialErr) {
        // Fail-open: never block a chatbot because of an infra hiccup.
        console.error("widget-config trial check skipped:", trialErr?.message || trialErr);
      }
    }

    return res.status(200).json({
      name: chatbot.public_agent_name || "Assistant",
      avatarUrl: chatbot.avatar_url || null,
      primaryColor: chatbot.primary_color || "#8B5CF6",
      welcomeMessage: chatbot.welcome_message || "Hi! How can I help you today?",
    });
  } catch (error) {
    console.error("widget-config error:", error);
    return res.status(500).json({ error: "An error occurred. Please try again later." });
  }
}
