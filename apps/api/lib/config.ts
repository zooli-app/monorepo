// One place that decides "mock" vs "live" for every external dependency.
// Flip a value in .env (no code change) to go live.
export type Mode = "mock" | "live";

function pick(v: string | undefined, fallback: Mode): Mode {
  const s = (v ?? "").trim().toLowerCase();
  return s === "live" ? "live" : s === "mock" ? "mock" : fallback;
}

/** OTP_MODE: mock = fixed code (OTP_MOCK_CODE, default 123456), nothing is sent. live = real SMS. */
export const otpMode = (): Mode => pick(process.env.OTP_MODE, "mock");
/** SMS_MODE: mock = SMS text is only logged to the server console. live = sent via SMS_PROVIDER. */
export const smsMode = (): Mode => pick(process.env.SMS_MODE, "mock");
/** EMAIL_MODE: mock = logged only. live = sent via EMAIL_PROVIDER. */
export const emailMode = (): Mode => pick(process.env.EMAIL_MODE, "mock");
/** CAPTCHA_MODE: mock = accepts the dev token. live = Cloudflare Turnstile. Defaults to live when a secret is set. */
export const captchaMode = (): Mode => pick(process.env.CAPTCHA_MODE, process.env.TURNSTILE_SECRET_KEY ? "live" : "mock");
/** OTP_REQUIRED=true makes applicants verify their mobile before they can submit. */
export const otpRequired = (): boolean => (process.env.OTP_REQUIRED ?? "false").trim().toLowerCase() === "true";
export const aadhaarMaskedOnly = (): boolean => (process.env.AADHAAR_STORAGE ?? "encrypted").trim().toLowerCase() === "masked_only";
export const vendorPortalUrl = (): string => (process.env.VENDOR_PORTAL_URL || "http://localhost:3001").replace(/\/$/, "");
