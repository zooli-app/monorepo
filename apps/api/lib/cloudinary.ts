import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function ensureConfigured() {
  if (configured) return;
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("CLOUDINARY_* env vars are not set");
  }
  cloudinary.config({ cloud_name, api_key, api_secret });
  configured = true;
}

/**
 * Returns signed params the CLIENT uses to upload directly to Cloudinary
 * (product photos, store logos) without the file ever passing through our
 * server. `folder` scopes uploads, e.g. `zooli/stores/{storeId}/products`.
 */
export function signUpload(folder: string, extra: Record<string, string | number> = {}) {
  ensureConfigured();
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder, ...extra },
    process.env.CLOUDINARY_API_SECRET!
  );
  return {
    timestamp,
    folder,
    params: extra, // extra signed params the client MUST send unchanged (e.g. type=authenticated)
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}
