import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Stateless HMAC-signed tokens: "apply" sessions (captcha passed) and "otp" proofs (mobile verified).
function secret(): string {
  const s = process.env.APPLY_SESSION_SECRET;
  if (s && s.length >= 24) return s;
  if (process.env.NODE_ENV === "production") throw new Error("APPLY_SESSION_SECRET must be set (24+ random characters)");
  return "dev-only-insecure-secret-change-me";
}

export function signToken(payload: Record<string, unknown>, ttlSeconds: number): string {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken<T extends Record<string, unknown> = Record<string, unknown>>(
  token: string | null | undefined, kind: string,
): (T & { exp: number }) | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (p.kind !== kind || typeof p.exp !== "number" || p.exp < Date.now() / 1000) return null;
    return p;
  } catch { return null; }
}

export const SESSION_TTL = 60 * 60; // 1 hour
export const issueApplySession = () => signToken({ kind: "apply" }, SESSION_TTL);

/** Returns a 401 response if the request has no valid captcha-verified session, else null. */
export function requireApplySession(req: NextRequest): NextResponse | null {
  if (verifyToken(req.headers.get("x-apply-session"), "apply")) return null;
  return NextResponse.json(
    { error: "Please complete the human verification and try again.", code: "session_required" },
    { status: 401 },
  );
}
