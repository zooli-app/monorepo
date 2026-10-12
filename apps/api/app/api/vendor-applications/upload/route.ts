import { NextRequest, NextResponse } from "next/server";
import { signUpload } from "@/lib/cloudinary";
import { clientIp, isRateLimited } from "@/lib/ratelimit";
import { requireApplySession } from "@/lib/tokens";
import { ALLOWED_FORMATS } from "@/lib/uploads";

// POST /api/vendor-applications/upload — needs a captcha-verified session, rate-limited.
// Signed params force every file to be PRIVATE (type=authenticated: not openable by URL) and
// restrict formats at Cloudinary itself; the submit route re-verifies size + format + privacy.
export async function POST(req: NextRequest) {
  const denied = requireApplySession(req);
  if (denied) return denied;
  if (await isRateLimited(`apply-upload:${clientIp(req)}`, 80, 600)) {
    return NextResponse.json({ error: "Too many uploads. Please wait a few minutes." }, { status: 429 });
  }
  try {
    return NextResponse.json(signUpload("zooli/applications", { type: "authenticated", allowed_formats: ALLOWED_FORMATS.join(",") }));
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
