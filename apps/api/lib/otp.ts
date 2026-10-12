import { createHash, randomInt, timingSafeEqual } from "crypto";
import { redis } from "./redis";
import { otpMode } from "./config";
import { isRateLimited } from "./ratelimit";
import { sendSms } from "./notify";
import { signToken } from "./tokens";

const TTL = 300;       // code valid 5 minutes
const MAX_TRIES = 5;
const mem = new Map<string, { v: string; exp: number }>();

// Redis in live mode (no silent fallback: a down store must not weaken verification).
// In mock mode we fall back to memory so local dev works without Redis.
async function kvGet(k: string): Promise<string | null> {
  try { const v = await redis().get<string>(k); return v == null ? null : String(v); }
  catch (e) { if (otpMode() === "mock") { const m = mem.get(k); return m && m.exp > Date.now() ? m.v : null; } throw e; }
}
async function kvSet(k: string, v: string, ttl: number) {
  try { await redis().set(k, v, { ex: ttl }); }
  catch (e) { if (otpMode() === "mock") { mem.set(k, { v, exp: Date.now() + ttl * 1000 }); return; } throw e; }
}
async function kvDel(k: string) { try { await redis().del(k); } catch { /* ignore */ } mem.delete(k); }

const hash = (mobile: string, code: string) => createHash("sha256").update(`${mobile}:${code}`).digest("hex");
const mockCode = () => (process.env.OTP_MOCK_CODE || "123456").slice(0, 8);

export type OtpResult = { ok: true; devHint?: string } | { ok: false; status: number; error: string };

export async function sendOtp(mobile: string, ip: string): Promise<OtpResult> {
  if (await isRateLimited(`otp-cool:${mobile}`, 1, 30)) return { ok: false, status: 429, error: "Please wait 30 seconds before requesting another code." };
  if (await isRateLimited(`otp-hour:${mobile}`, 5, 3600) || await isRateLimited(`otp-ip:${ip}`, 20, 3600)) {
    return { ok: false, status: 429, error: "Too many codes requested. Try again later." };
  }
  const live = otpMode() === "live";
  const code = live ? String(randomInt(100000, 1000000)) : mockCode();
  try {
    await kvSet(`otp:${mobile}`, hash(mobile, code), TTL);
    await kvDel(`otp-tries:${mobile}`);
  } catch { return { ok: false, status: 503, error: "Verification service unavailable. Please try again shortly." }; }

  if (!live) return { ok: true, devHint: `Mock mode — use code ${code}` };
  const d = await sendSms(mobile, "otp", `Your Zooli verification code is ${code}. It is valid for 5 minutes. Do not share it with anyone.`, [code]);
  return d === "sent" ? { ok: true } : { ok: false, status: 502, error: "Couldn't send the SMS. Please try again." };
}

export type VerifyResult = { ok: true; otpToken: string } | { ok: false; status: number; error: string };

export async function verifyOtp(mobile: string, code: string): Promise<VerifyResult> {
  try {
    const stored = await kvGet(`otp:${mobile}`);
    if (!stored) return { ok: false, status: 400, error: "Code expired. Please request a new one." };
    const tries = Number((await kvGet(`otp-tries:${mobile}`)) ?? 0);
    if (tries >= MAX_TRIES) { await kvDel(`otp:${mobile}`); return { ok: false, status: 429, error: "Too many wrong attempts. Request a new code." }; }
    const a = Buffer.from(stored), b = Buffer.from(hash(mobile, code));
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      await kvSet(`otp-tries:${mobile}`, String(tries + 1), TTL);
      return { ok: false, status: 400, error: "Incorrect code." };
    }
    await kvDel(`otp:${mobile}`); await kvDel(`otp-tries:${mobile}`);
    return { ok: true, otpToken: signToken({ kind: "otp", mobile }, 30 * 60) };
  } catch { return { ok: false, status: 503, error: "Verification service unavailable. Please try again shortly." }; }
}
