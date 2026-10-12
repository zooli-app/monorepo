import { NextRequest, NextResponse } from "next/server";
import { clientIp } from "@/lib/ratelimit";
import { requireApplySession } from "@/lib/tokens";
import { sendOtp } from "@/lib/otp";

// POST /api/vendor-applications/otp/send { mobile }  — OTP_MODE=mock|live (see .env.example)
export async function POST(req: NextRequest) {
  const denied = requireApplySession(req);
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const mobile = typeof body.mobile === "string" ? body.mobile.replace(/\D/g, "") : "";
  if (!/^[6-9]\d{9}$/.test(mobile)) return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });
  const r = await sendOtp(mobile, clientIp(req));
  return r.ok ? NextResponse.json({ sent: true, devHint: r.devHint }) : NextResponse.json({ error: r.error }, { status: r.status });
}
