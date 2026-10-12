import { createSupabaseClient } from "@zooli/api-client";

// Browser Supabase client — session persisted to localStorage automatically
// by the SDK. NEXT_PUBLIC_* vars are safe to expose; the anon key is
// designed to be public (RLS is what actually protects data).
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
