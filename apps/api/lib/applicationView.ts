import { SENSITIVE_FIELDS, isUploadedFile } from "@zooli/vendor-forms";
import { isEncrypted } from "./crypto";
import { signedViewUrl } from "./uploads";

/**
 * What an admin gets back for an application: sensitive numbers masked (never ciphertext),
 * a `_revealable` list of fields that can be revealed on request, and a fresh 15-minute
 * signed `signedUrl` on every uploaded document.
 */
export function toAdminView<T extends { data: Record<string, unknown> }>(row: T): T {
  const data: Record<string, unknown> = { ...row.data };
  const masked = (data._masked ?? {}) as Record<string, string>;
  const revealable: string[] = [];
  for (const f of SENSITIVE_FIELDS) {
    const v = data[f];
    if (typeof v !== "string") continue;
    if (isEncrypted(v)) revealable.push(f);
    data[f] = masked[f] ?? "XXXX";
  }
  delete data._masked;
  data._revealable = revealable;

  const sign = (x: unknown) => (isUploadedFile(x) ? { ...x, signedUrl: signedViewUrl(x) } : x);
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v) && v.some(isUploadedFile)) data[k] = v.map(sign);
    else if (isUploadedFile(v)) data[k] = sign(v);
  }
  return { ...row, data };
}
