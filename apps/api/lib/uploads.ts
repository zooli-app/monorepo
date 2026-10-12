import { v2 as cloudinary } from "cloudinary";
import { isUploadedFile } from "@zooli/vendor-forms";
import type { UploadedFile } from "@zooli/vendor-forms";
import { ensureConfigured } from "./cloudinary";

export const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "pdf"];
export const MAX_BYTES = 8 * 1024 * 1024;

/** Every uploaded-file object in an answers blob, with the field it belongs to. */
export function collectFiles(values: Record<string, unknown>): { field: string; file: UploadedFile }[] {
  const out: { field: string; file: UploadedFile }[] = [];
  for (const [field, v] of Object.entries(values)) {
    if (Array.isArray(v)) v.forEach((x) => isUploadedFile(x) && out.push({ field, file: x }));
    else if (isUploadedFile(v)) out.push({ field, file: v });
  }
  return out;
}

/**
 * Server-side check of every file the applicant claims to have uploaded: it must exist in
 * Cloudinary as a PRIVATE (authenticated) asset, be ≤ 8 MB and be jpg/png/pdf. Offenders are
 * deleted (best effort). Returns the offending fields; empty array = all good.
 */
export async function verifyUploadedFiles(files: { field: string; file: UploadedFile }[]): Promise<{ field: string; reason: string }[]> {
  ensureConfigured();
  const bad: { field: string; reason: string }[] = [];
  await Promise.all(files.map(async ({ field, file }) => {
    const opts = { resource_type: file.resourceType ?? "image", type: "authenticated" as const };
    try {
      const r = await cloudinary.api.resource(file.publicId!, opts);
      const fmt = String(r.format ?? "").toLowerCase();
      if (r.type !== "authenticated") throw new Error("not private");
      if (!ALLOWED_FORMATS.includes(fmt)) throw new Error("File type not allowed");
      if (Number(r.bytes) > MAX_BYTES) throw new Error("File is larger than 8 MB");
    } catch (e) {
      bad.push({ field, reason: (e as Error).message === "File is larger than 8 MB" || (e as Error).message === "File type not allowed" ? (e as Error).message : "File could not be verified" });
      cloudinary.uploader.destroy(file.publicId!, opts).catch(() => undefined);
    }
  }));
  return bad;
}

/** Short-lived (default 15 min) signed link for an admin to open a private document. */
export function signedViewUrl(f: UploadedFile, ttlSeconds = 900): string | null {
  if (!f.publicId) return null;
  ensureConfigured();
  return cloudinary.utils.private_download_url(f.publicId, f.format ?? "", {
    resource_type: f.resourceType ?? "image",
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + ttlSeconds,
  });
}
