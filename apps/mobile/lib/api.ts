import { createApiClient, accessTokenGetter } from "@zooli/api-client";
import { supabase } from "./supabase";

export const api = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3002",
  getAccessToken: accessTokenGetter(supabase),
});
