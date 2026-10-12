import type { UploadedFile } from "@zooli/vendor-forms";
import { api } from "@/lib/api";

// The captcha-verified session token (set by FormEngine) required to sign uploads.
let applySession = "";
export function setApplySession(token: string) { applySession = token; }

export const MAX_BYTES = 8 * 1024 * 1024; // 8 MB per file

const IMAGE_TYPES = ["image/jpeg", "image/png"];
const DOC_TYPES = [...IMAGE_TYPES, "application/pdf"];

export function checkFile(file: File, accept: "image" | "doc" | "any"): string | null {
  if (file.size > MAX_BYTES) return `${file.name} is larger than 8 MB`;
  const okTypes = accept === "image" ? IMAGE_TYPES : DOC_TYPES;
  if (!okTypes.includes(file.type)) {
    return accept === "image" ? "Only JPG or PNG images are allowed" : "Only JPG, PNG or PDF files are allowed";
  }
  return null;
}

/** Signed direct-to-Cloudinary upload (the file never passes through our servers). */
export async function uploadToCloudinary(file: File, onProgress?: (pct: number) => void): Promise<UploadedFile> {
  if (!applySession) throw new Error("Please complete the human verification at the top of the page first.");
  const sig = await api.applications.signUpload(applySession);
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", String(sig.apiKey));
  body.append("timestamp", String(sig.timestamp));
  body.append("folder", sig.folder);
  body.append("signature", sig.signature);
  // Extra signed params (private delivery + allowed formats) must be sent exactly as signed.
  for (const [k, v] of Object.entries(sig.params ?? {})) body.append(k, String(v));

  return new Promise<UploadedFile>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => reject(new Error("Network error while uploading. Please try again."));
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.secure_url) {
          resolve({
            url: res.secure_url, name: file.name, size: file.size, type: file.type,
            publicId: res.public_id, resourceType: res.resource_type, format: res.format,
          });
        } else {
          reject(new Error(res?.error?.message || "Upload failed. Please try again."));
        }
      } catch {
        reject(new Error("Upload failed. Please try again."));
      }
    };
    xhr.send(body);
  });
}
