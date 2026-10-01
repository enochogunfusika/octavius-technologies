import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client. Never import this from a "use client" file —
// the service role key must stay on the server.
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.");
    }
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}
