import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSupabaseClient } from "@zooli/api-client";

// Mobile's session storage is AsyncStorage instead of web's localStorage —
// this is the one platform-specific piece the shared package deliberately
// left for each app to provide (see packages/zooli-api-client/src/auth.ts).
export const supabase = createSupabaseClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
