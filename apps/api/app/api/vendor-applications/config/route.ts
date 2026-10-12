import { NextResponse } from "next/server";
import { captchaMode, otpMode, otpRequired } from "@/lib/config";

// GET /api/vendor-applications/config — tells the registration form which protections are on.
export async function GET() {
  return NextResponse.json({
    captcha: captchaMode(),
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY ?? null,
    otpRequired: otpRequired(),
    otpMode: otpMode(),
  });
}
