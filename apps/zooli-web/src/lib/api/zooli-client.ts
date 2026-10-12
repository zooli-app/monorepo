import { createApiClient, accessTokenGetter } from "@zooli/api-client";
import { supabase } from "../supabase";

/** The real Zooli backend client — used by every api/*.ts function once USE_MOCKS is false. */
export const zooli = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002",
  getAccessToken: accessTokenGetter(supabase),
});
