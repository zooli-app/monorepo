import { createClient, SupabaseClient, SupabaseClientOptions } from "@supabase/supabase-js";

// Thin wrapper so every app creates its Supabase client the same way —
// only the `auth.storage` adapter differs (localStorage on web, AsyncStorage
// on Expo), which each app passes in itself rather than this package
// depending on a specific platform's storage API.
export function createSupabaseClient(
  url: string,
  anonKey: string,
  options?: SupabaseClientOptions<"public">
): SupabaseClient {
  return createClient(url, anonKey, options);
}

export type Role = "customer" | "vendor" | "admin" | "driver";

export interface Profile {
  id: string;
  role: Role;
  full_name: string | null;
  phone: string | null;
  store_id: string | null;
}

/** Fetch the caller's own profile row — used right after login to route by role. */
export async function fetchOwnProfile(supabase: SupabaseClient): Promise<Profile | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, store_id")
    .eq("id", userData.user.id)
    .single();
  if (error) return null;
  return data as Profile;
}

/** Sign up + create the matching `profiles` row in one call (role is fixed at signup). */
export async function signUp(supabase: SupabaseClient, email: string, password: string, role: Role, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data.user) {
    await supabase.from("profiles").insert({ id: data.user.id, role, full_name: fullName ?? null });
  }
  return data;
}

export async function signIn(supabase: SupabaseClient, email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut(supabase: SupabaseClient) {
  await supabase.auth.signOut();
}

/** Ready-made getAccessToken() for createApiClient — reads the current Supabase session. */
export function accessTokenGetter(supabase: SupabaseClient) {
  return async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  };
}
