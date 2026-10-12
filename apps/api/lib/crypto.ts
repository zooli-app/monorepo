import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { SENSITIVE_FIELDS } from "@zooli/vendor-forms";
import { aadhaarMaskedOnly } from "./config";

// AES-256-GCM field encryption for Aadhaar / PAN / bank account / licence numbers.
// Generate a key:  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
// LOSING THIS KEY MAKES THE ENCRYPTED VALUES UNRECOVERABLE — back it up in your secret manager.
function key(): Buffer {
  const k = process.env.DATA_ENCRYPTION_KEY;
  if (k) {
    const b = Buffer.from(k, "base64");
    if (b.length === 32) return b;
    throw new Error("DATA_ENCRYPTION_KEY must be 32 bytes, base64-encoded");
  }
  if (process.env.NODE_ENV === "production") throw new Error("DATA_ENCRYPTION_KEY is not set");
  return createHash("sha256").update("zooli-dev-only-key").digest();
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return `enc:v1:${iv.toString("base64")}:${c.getAuthTag().toString("base64")}:${ct.toString("base64")}`;
}

export function decrypt(blob: string): string {
  const [, , iv, tag, ct] = blob.split(":");
  const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  d.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([d.update(Buffer.from(ct, "base64")), d.final()]).toString("utf8");
}

export const isEncrypted = (v: unknown): v is string => typeof v === "string" && v.startsWith("enc:v1:");

export function maskTail(v: string, keep = 4): string {
  const s = v.replace(/\s/g, "");
  return "X".repeat(Math.max(0, s.length - keep)) + s.slice(-keep);
}

/**
 * Returns a copy of the validated answers where each sensitive field is replaced by
 * ciphertext (or, with AADHAAR_STORAGE=masked_only, Aadhaar is kept masked only), and
 * a `_masked` map holds the display values admins see by default.
 */
export function protectSensitive(values: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...values };
  const masked: Record<string, string> = {};
  for (const f of SENSITIVE_FIELDS) {
    const v = out[f];
    if (typeof v !== "string" || !v) continue;
    masked[f] = maskTail(v);
    out[f] = f === "aadhaarNumber" && aadhaarMaskedOnly() ? `masked:${masked[f]}` : encrypt(v);
  }
  out._masked = masked;
  return out;
}
