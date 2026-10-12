import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getForm, sanitizeValues, validateForm } from "@zooli/vendor-forms";
import { supabaseAdmin } from "@/lib/supabase";
import { clientIp, isRateLimited } from "@/lib/ratelimit";
import { requireApplySession, verifyToken } from "@/lib/tokens";
import { otpRequired } from "@/lib/config";
import { protectSensitive } from "@/lib/crypto";
import { collectFiles, verifyUploadedFiles } from "@/lib/uploads";
import { sendSms } from "@/lib/notify";

// POST /api/vendor-applications — PUBLIC but needs a captcha-verified session (x-apply-session),
// and a verified-mobile proof (x-otp-token) when OTP_REQUIRED=true.
export async function POST(req: NextRequest) {
  const denied = requireApplySession(req);
  if (denied) return denied;
  if (await isRateLimited(`apply:${clientIp(req)}`, 8, 3600)) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const form = body && typeof body.service === "string" ? getForm(body.service) : null;
  if (!form) return NextResponse.json({ error: "Unknown service" }, { status: 400 });

  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const values = sanitizeValues(form, body.values, {
    requirePublicId: true,
    fileUrlPattern: cloud ? new RegExp(`^https://res\\.cloudinary\\.com/${cloud}/`) : undefined,
  });

  const errors = validateForm(form, values);
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: "Please fix the highlighted fields", fields: errors }, { status: 422 });
  }

  const s = form.summary;
  const str = (k?: string) => (k && typeof values[k] === "string" ? (values[k] as string) : null);
  const mobile = str(s.mobile)!;

  if (otpRequired()) {
    const proof = verifyToken<{ mobile?: string }>(req.headers.get("x-otp-token"), "otp");
    if (!proof || proof.mobile !== mobile) {
      return NextResponse.json({ error: "Please verify your mobile number with the OTP.", code: "otp_required" }, { status: 403 });
    }
  }
  if (await isRateLimited(`apply-mobile:${mobile}`, 3, 86400)) {
    return NextResponse.json({ error: "Too many applications from this mobile number today." }, { status: 429 });
  }

  const files = collectFiles(values);
  if (files.length > 40) return NextResponse.json({ error: "Too many files attached" }, { status: 400 });
  try {
    const bad = await verifyUploadedFiles(files);
    if (bad.length) {
      const fields: Record<string, string> = {};
      bad.forEach((b) => { fields[b.field] = `${b.reason}. Please upload it again (JPG, PNG or PDF, max 8 MB).`; });
      return NextResponse.json({ error: "Some uploaded files didn't pass our checks", fields }, { status: 422 });
    }
  } catch {
    return NextResponse.json({ error: "Couldn't verify your uploads right now. Please try again." }, { status: 503 });
  }

  const db = supabaseAdmin();
  const { data: dup } = await db
    .from("vendor_applications").select("reference").eq("service", form.service).eq("mobile", mobile)
    .in("status", ["pending", "under_review", "needs_info"]).limit(1);
  if (dup && dup.length) {
    return NextResponse.json({ error: `An application for this mobile number is already in review (ref ${dup[0].reference}).`, reference: dup[0].reference }, { status: 409 });
  }

  let protectedData: Record<string, unknown>;
  try { protectedData = protectSensitive(values); }
  catch { return NextResponse.json({ error: "Server is not configured to store applications securely." }, { status: 500 }); }

  const now = new Date();
  const reference = `ZV-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}-${randomBytes(4).toString("hex").toUpperCase().slice(0, 6)}`;
  const { error } = await db.from("vendor_applications").insert({
    reference, service: form.service, applicant_name: str(s.name) ?? "", business_name: str(s.business),
    mobile, email: str(s.email) || null, city: str(s.city), district: str(s.district), data: protectedData,
  });
  if (error) return NextResponse.json({ error: "Could not save your application. Please try again." }, { status: 500 });

  await sendSms(mobile, "status", `Zooli: we received your registration (ref ${reference}). We will contact you after verification.`, [reference]).catch(() => undefined);
  return NextResponse.json({ reference }, { status: 201 });
}
