import { createClient } from "@supabase/supabase-js";

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

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  const hostname = extractHostname(origin);

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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

    res.setHeader("Access-Control-Allow-Origin", origin);

    const { data: chatbot, error } = await supabaseAdmin
      .from("chatbots")
      .select("public_agent_name, avatar_url, primary_color, welcome_message")
      .eq("id", chatbotId)
      .single();

    if (error || !chatbot) {
      return res.status(404).json({ error: "Chatbot not found." });
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
