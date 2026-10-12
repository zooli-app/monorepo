import { NextRequest, NextResponse } from "next/server";
import { clientIp, isRateLimited } from "@/lib/ratelimit";
import { verifyCaptcha } from "@/lib/captcha";
import { issueApplySession, SESSION_TTL } from "@/lib/tokens";

// POST /api/vendor-applications/session { captchaToken } → { token, expiresIn }
// The token (x-apply-session header) is required for uploads, OTP and submit.
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (await isRateLimited(`apply-session:${ip}`, 20, 3600)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  if (!(await verifyCaptcha(typeof body.captchaToken === "string" ? body.captchaToken : undefined, ip))) {
    return NextResponse.json({ error: "Human verification failed. Please try again." }, { status: 400 });
  }
  return NextResponse.json({ token: issueApplySession(), expiresIn: SESSION_TTL });
}
