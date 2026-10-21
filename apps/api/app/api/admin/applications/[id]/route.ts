// import { NextRequest, NextResponse } from "next/server";
// import { supabaseAdmin } from "@/lib/supabase";
// import { getAuthedUser, requireRole } from "@/lib/auth";
// import { toAdminView } from "@/lib/applicationView";
// import { createAccountForApplication, ApprovalError } from "@/lib/approve";
// import { sendEmail, sendSms, type Delivery } from "@/lib/notify";
// import { smsMode, vendorPortalUrl } from "@/lib/config";

// const STATUSES = ["pending", "under_review", "needs_info", "approved", "rejected"];

// async function audit(applicationId: string, adminId: string, action: string, detail?: string) {
//   await supabaseAdmin().from("application_audit_log").insert({ application_id: applicationId, admin_id: adminId, action, detail: detail ?? null });
// }

// // GET /api/admin/applications/:id — masked sensitive fields + 15-minute signed document links.
// export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
//   const user = await getAuthedUser(req);
//   const denied = requireRole(user, "admin");
//   if (denied) return denied;
//   const { id } = await ctx.params;

//   const { data, error } = await supabaseAdmin().from("vendor_applications").select("*").eq("id", id).single();
//   if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
//   await audit(id, user!.id, "view");
//   return NextResponse.json({ application: toAdminView(data) });
// }

// // PATCH /api/admin/applications/:id
// // { status?, admin_notes?, message?, notify? (default true), login_email? (approve) }
// export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
//   const user = await getAuthedUser(req);
//   const denied = requireRole(user, "admin");
//   if (denied) return denied;
//   const { id } = await ctx.params;

//   const body = await req.json().catch(() => ({}));
//   const db = supabaseAdmin();
//   const { data: app } = await db.from("vendor_applications").select("*").eq("id", id).single();
//   if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

//   const patch: Record<string, unknown> = {};
//   if (body.admin_notes !== undefined) patch.admin_notes = String(body.admin_notes).slice(0, 2000);
//   const message = typeof body.message === "string" ? body.message.trim().slice(0, 300) : "";
//   const notify = body.notify !== false;
//   const delivery: { sms: Delivery; email: Delivery } = { sms: "skipped", email: "skipped" };
//   let credentials: { email: string; tempPassword: string; portalUrl: string } | undefined;

//   if (body.status !== undefined) {
//     if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
//     patch.status = body.status;
//     patch.reviewed_by = user!.id;
//     patch.reviewed_at = new Date().toISOString();
//     if (message) patch.last_message = message;

//     if (body.status === "approved") {
//       if (app.vendor_user_id || app.status === "approved") return NextResponse.json({ error: "This application is already approved." }, { status: 409 });
//       const loginEmail = String(body.login_email || app.email || "").trim().toLowerCase();
//       if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(loginEmail)) {
//         return NextResponse.json({ error: "Enter the email the vendor will use to log in." }, { status: 400 });
//       }
//       try {
//         const acct = await createAccountForApplication(app, loginEmail);
//         patch.vendor_user_id = acct.userId;
//         patch.store_id = acct.storeId;
//         const portal = vendorPortalUrl();
//         credentials = { email: acct.email, tempPassword: acct.tempPassword, portalUrl: `${portal}/login` };
//         if (notify) {
//           const text = `Welcome to Zooli! Your application ${app.reference} is approved. Login at ${portal}/login with email ${acct.email} and temporary password ${acct.tempPassword}. Please change it after you log in.`;
//           delivery.sms = await sendSms(app.mobile, "credentials", text, [app.reference, acct.email, acct.tempPassword]);
//           delivery.email = await sendEmail(app.email || acct.email, "Your Zooli vendor account is ready", text);
//         }
//       } catch (e) {
//         if (e instanceof ApprovalError) return NextResponse.json({ error: e.message }, { status: e.status });
//         return NextResponse.json({ error: "Could not create the vendor account." }, { status: 500 });
//       }
//     } else if (notify && body.status !== "pending") {
//       const lines: Record<string, string> = {
//         under_review: `Zooli: your application ${app.reference} is now under review.`,
//         needs_info: `Zooli: we need more information for application ${app.reference}. ${message || "Please contact support@zooli.in."}`,
//         rejected: `Zooli: your application ${app.reference} could not be approved. ${message || "Contact support@zooli.in for details."}`,
//       };
//       const text = lines[body.status];
//       delivery.sms = await sendSms(app.mobile, "status", text, [app.reference, message]);
//       delivery.email = await sendEmail(app.email, `Zooli application ${app.reference}`, text);
//     }
//     if (delivery.sms === "sent" || delivery.sms === "mock" || delivery.email === "sent" || delivery.email === "mock") patch.notified_at = new Date().toISOString();
//   }
//   if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

//   const { data, error } = await db.from("vendor_applications").update(patch).eq("id", id).select("*").single();
//   if (error || !data) return NextResponse.json({ error: error?.message ?? "Update failed" }, { status: 500 });
//   if (body.status) await audit(id, user!.id, `status:${body.status}`, message || undefined);

//   // Show the temp password to the admin only when it may not have reached the vendor
//   // (mock mode, or no channel confirmed delivery) so they can pass it on manually.
//   const delivered = delivery.sms === "sent" || delivery.email === "sent";
//   return NextResponse.json({
//     application: toAdminView(data),
//     delivery,
//     credentials: credentials && (smsMode() === "mock" || !delivered) ? credentials : undefined,
//   });
// }


import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";
import { toAdminView } from "@/lib/applicationView";
import { createAccountForApplication, ApprovalError } from "@/lib/approve";
import { sendEmail, sendSms, type Delivery } from "@/lib/notify";
import { smsMode, vendorPortalUrl } from "@/lib/config";

const STATUSES = ["pending", "under_review", "needs_info", "approved", "rejected"];

async function audit(applicationId: string, adminId: string, action: string, detail?: string) {
  await supabaseAdmin().from("application_audit_log").insert({ application_id: applicationId, admin_id: adminId, action, detail: detail ?? null });
}

// GET /api/admin/applications/:id — masked sensitive fields + 15-minute signed document links.
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "admin");
  if (denied) return denied;
  const { id } = await ctx.params;

  const { data, error } = await supabaseAdmin().from("vendor_applications").select("*").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await audit(id, user!.id, "view");
  return NextResponse.json({ application: toAdminView(data) });
}

// PATCH /api/admin/applications/:id
// { status?, admin_notes?, message?, notify? (default true), login_email? (approve) }
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "admin");
  if (denied) return denied;
  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const db = supabaseAdmin();
  const { data: app } = await db.from("vendor_applications").select("*").eq("id", id).single();
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patch: Record<string, unknown> = {};
  if (body.admin_notes !== undefined) patch.admin_notes = String(body.admin_notes).slice(0, 2000);
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 300) : "";
  const notify = body.notify !== false;
  const delivery: { sms: Delivery; email: Delivery } = { sms: "skipped", email: "skipped" };
  const sErr: { error?: string } = {}, eErr: { error?: string } = {};
  let credentials: { email: string; tempPassword: string; portalUrl: string } | undefined;

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    patch.status = body.status;
    patch.reviewed_by = user!.id;
    patch.reviewed_at = new Date().toISOString();
    if (message) patch.last_message = message;

    if (body.status === "approved") {
      if (app.vendor_user_id || app.status === "approved") return NextResponse.json({ error: "This application is already approved." }, { status: 409 });
      const loginEmail = String(body.login_email || app.email || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(loginEmail)) {
        return NextResponse.json({ error: "Enter the email the vendor will use to log in." }, { status: 400 });
      }
      try {
        const acct = await createAccountForApplication(app, loginEmail);
        patch.vendor_user_id = acct.userId;
        patch.store_id = acct.storeId;
        const portal = vendorPortalUrl();
        credentials = { email: acct.email, tempPassword: acct.tempPassword, portalUrl: `${portal}/login` };
        if (notify) {
          const text = `Welcome to Zooli! Your application ${app.reference} is approved. Login at ${portal}/login with email ${acct.email} and temporary password ${acct.tempPassword}. Please change it after you log in.`;
          delivery.sms = await sendSms(app.mobile, "credentials", text, [app.reference, acct.email, acct.tempPassword], sErr);
          delivery.email = await sendEmail(app.email || acct.email, "Your Zooli vendor account is ready", text, eErr);
        }
      } catch (e) {
        if (e instanceof ApprovalError) return NextResponse.json({ error: e.message }, { status: e.status });
        return NextResponse.json({ error: "Could not create the vendor account." }, { status: 500 });
      }
    } else if (notify && body.status !== "pending") {
      const lines: Record<string, string> = {
        under_review: `Zooli: your application ${app.reference} is now under review.`,
        needs_info: `Zooli: we need more information for application ${app.reference}. ${message || "Please contact support@zooli.in."}`,
        rejected: `Zooli: your application ${app.reference} could not be approved. ${message || "Contact support@zooli.in for details."}`,
      };
      const text = lines[body.status];
      delivery.sms = await sendSms(app.mobile, "status", text, [app.reference, message], sErr);
      delivery.email = await sendEmail(app.email, `Zooli application ${app.reference}`, text, eErr);
    }
    if (delivery.sms === "sent" || delivery.sms === "mock" || delivery.email === "sent" || delivery.email === "mock") patch.notified_at = new Date().toISOString();
  }
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const { data, error } = await db.from("vendor_applications").update(patch).eq("id", id).select("*").single();
  if (error || !data) return NextResponse.json({ error: error?.message ?? "Update failed" }, { status: 500 });
  if (body.status) await audit(id, user!.id, `status:${body.status}`, message || undefined);

  // Show the temp password to the admin only when it may not have reached the vendor
  // (mock mode, or no channel confirmed delivery) so they can pass it on manually.
  const delivered = delivery.sms === "sent" || delivery.email === "sent";
  return NextResponse.json({
    application: toAdminView(data),
    delivery,
    errors: { sms: sErr.error, email: eErr.error },
    credentials: credentials && (smsMode() === "mock" || !delivered) ? credentials : undefined,
  });
}