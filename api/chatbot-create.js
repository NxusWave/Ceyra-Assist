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

export const maxDuration = 60;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Missing authorization" });
  }

  const { businessId } = req.body || {};
  if (!businessId) {
    return res.status(400).json({ error: "businessId is required" });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("id, owner_id")
      .eq("id", businessId)
      .single();

    if (!business || business.owner_id !== userData.user.id) {
      return res.status(403).json({ error: "Not authorized for this business" });
    }

    const { data: packages } = await supabaseAdmin
      .from("packages")
      .select("plan, status, user_id, business_id")
      .or(`business_id.eq.${businessId},user_id.eq.${userData.user.id}`)
      .in("status", ["trial", "active"]);

    const BOT_LIMITS = { starter: 1, growth: 5, business: 10, enterprise: 10 };
    // Sum capacity across every subscription the business holds; floor at 1 so
    // an unrecognized plan value can never lock a brand-new owner out.
    const botLimit = Math.max(
      1,
      (packages || []).reduce((sum, pkg) => sum + (BOT_LIMITS[pkg.plan] || 0), 0)
    );

    const { count: currentBotCount } = await supabaseAdmin
      .from("chatbots")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId);

    if ((currentBotCount || 0) >= botLimit) {
      return res.status(403).json({ error: "Bot limit reached for your current plan." });
    }

    const { data: newBot, error: insertError } = await supabaseAdmin
      .from("chatbots")
      .insert({
        business_id: businessId,
        chatbot_name: "New Chatbot",
        public_agent_name: "Ceyra Assistant",
      })
      .select()
      .single();

    if (insertError || !newBot) {
      return res.status(500).json({ error: "Failed to create chatbot." });
    }

    return res.status(200).json({ chatbot: newBot });
  } catch (error) {
    console.error("chatbot-create error:", error);
    return res.status(500).json({ error: "An error occurred. Please try again later." });
  }
}
