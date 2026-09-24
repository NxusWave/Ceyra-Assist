import { createClient } from "@supabase/supabase-js";

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
  try { return new URL(origin).hostname; } catch { return null; }
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

  const { chatbotId, conversationId, since } = req.query;
  if (!chatbotId || !conversationId) {
    return res.status(400).json({ error: "chatbotId and conversationId are required" });
  }

  try {
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    if (!isLocalhost) {
      const { data: allowedDomains } = await getSupabaseAdmin()
        .from("chatbot_domains")
        .select("domain")
        .eq("chatbot_id", chatbotId);
      const domainList = (allowedDomains || []).map((d) => d.domain);
      if (!hostname || !domainList.includes(hostname)) {
        return res.status(403).json({ error: "This domain is not authorized for this chatbot." });
      }
    }

    res.setHeader("Access-Control-Allow-Origin", origin);

    const { data: convo } = await getSupabaseAdmin()
      .from("conversations")
      .select("mode, chatbot_id")
      .eq("id", conversationId)
      .single();

    if (!convo || convo.chatbot_id !== chatbotId) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    let query = getSupabaseAdmin()
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (since) {
      query = query.gt("created_at", since);
    }

    const { data: messages } = await query;

    return res.status(200).json({ messages: messages || [], mode: convo.mode });
  } catch (error) {
    console.error("widget-poll error:", error);
    return res.status(500).json({ error: "An error occurred. Please try again later." });
  }
}
