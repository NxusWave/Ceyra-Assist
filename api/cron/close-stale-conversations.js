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

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { error, count } = await getSupabaseAdmin()
    .from("conversations")
    .update({ status: "closed" })
    .eq("status", "open")
    .lt("last_message_at", threshold);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ closed: count ?? 0 });
}
