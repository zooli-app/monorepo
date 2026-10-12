import { NextRequest, NextResponse } from "next/server";
import { requireApplySession } from "@/lib/tokens";
import { verifyOtp } from "@/lib/otp";

// POST /api/vendor-applications/otp/verify { mobile, code } → { otpToken } (valid 30 min, bound to that mobile)
export async function POST(req: NextRequest) {
  const denied = requireApplySession(req);
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const mobile = typeof body.mobile === "string" ? body.mobile.replace(/\D/g, "") : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!/^[6-9]\d{9}$/.test(mobile) || !/^\d{4,8}$/.test(code)) return NextResponse.json({ error: "Enter the code you received" }, { status: 400 });
  const r = await verifyOtp(mobile, code);
  return r.ok ? NextResponse.json({ otpToken: r.otpToken }) : NextResponse.json({ error: r.error }, { status: r.status });
}
