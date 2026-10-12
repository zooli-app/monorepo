import { createApiClient, accessTokenGetter } from "@zooli/api-client";
import { supabase } from "./supabase";

export const api = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  getAccessToken: accessTokenGetter(supabase),
});
