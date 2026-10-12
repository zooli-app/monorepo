import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;

/**
 * Service-role client — full DB access, bypasses RLS.
 * Use ONLY in server-side route handlers, never expose to the client.
 * Lazily constructed so `next build` doesn't require real env vars.
 */
export function supabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");
  }
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

/**
 * Request-scoped client that runs AS the calling user (their JWT), so
 * Postgres RLS policies apply normally. Use this for anything a customer
 * or vendor does to their own rows; reserve supabaseAdmin() for
 * privileged/cross-user operations.
 */
export function supabaseForUser(accessToken: string): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("SUPABASE_URL / SUPABASE_ANON_KEY are not set");
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
