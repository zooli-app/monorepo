import { randomBytes } from "crypto";
import { supabaseAdmin } from "./supabase";
import { decrypt, isEncrypted } from "./crypto";

// What an approved application becomes in the platform.
//  - business-type services get a vendor login + a store row (category below)
//  - individual earners (rides / parcel) get a driver login (no store)
const ACCOUNT: Record<string, { role: "vendor" | "driver"; storeCategory?: string }> = {
  food: { role: "vendor", storeCategory: "restaurant" },
  home: { role: "vendor", storeCategory: "home_services" },
  shifting: { role: "vendor", storeCategory: "house_shifting" },
  hotel: { role: "vendor", storeCategory: "hotel" },
  resort: { role: "vendor", storeCategory: "resort" },
  tuition: { role: "vendor", storeCategory: "tuition" },
  rides: { role: "driver" },
  parcel: { role: "driver" },
};

export interface ApprovalResult {
  userId: string; storeId: string | null; role: "vendor" | "driver"; email: string; tempPassword: string;
}

export class ApprovalError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

interface AppRow {
  id: string; service: string; applicant_name: string; business_name: string | null;
  mobile: string; data: Record<string, unknown>;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Creates the Supabase auth user + profile (+ store). Rolls everything back if any step fails. */
export async function createAccountForApplication(app: AppRow, loginEmail: string): Promise<ApprovalResult> {
  const map = ACCOUNT[app.service];
  if (!map) throw new ApprovalError(400, `No account type is configured for service "${app.service}"`);
  const db = supabaseAdmin();
  const tempPassword = randomBytes(9).toString("base64url"); // 12 chars

  const { data: created, error: userErr } = await db.auth.admin.createUser({
    email: loginEmail, password: tempPassword, email_confirm: true,
    user_metadata: { full_name: app.applicant_name, source: "vendor_application" },
  });
  if (userErr || !created.user) {
    const dup = /already|registered|exists/i.test(userErr?.message ?? "");
    throw new ApprovalError(dup ? 409 : 500, dup ? "A user with this email already exists. Use a different login email." : (userErr?.message ?? "Could not create the login"));
  }
  const userId = created.user.id;
  let storeId: string | null = null;
  try {
    const { error: pErr } = await db.from("profiles").insert({ id: userId, role: map.role, full_name: app.applicant_name, phone: app.mobile });
    if (pErr) throw new ApprovalError(/phone|unique|duplicate/i.test(pErr.message) ? 409 : 500,
      /phone|unique|duplicate/i.test(pErr.message) ? "An account with this mobile number already exists." : pErr.message);

    if (app.service === "rides") {
      // The ride flow reads vehicle + licence from `drivers`; fill it from the application.
      const d = app.data;
      const wheeler = str(d.wheelerType), vtype = str(d.vehicleType);
      const vehicle_type = wheeler.startsWith("2") ? "bike" : wheeler.startsWith("3") ? "auto" : /SUV|Van/i.test(vtype) ? "suv" : "sedan";
      const lic = typeof d.licenseNumber === "string" && isEncrypted(d.licenseNumber) ? decrypt(d.licenseNumber) : str(d.licenseNumber);
      const { error: dErr } = await db.from("drivers").insert({
        id: userId, vehicle_type, vehicle_number: str(d.vehicleRegNumber) || "NA", license_number: lic || "NA",
      });
      if (dErr) throw new ApprovalError(500, dErr.message);
    }

    if (map.storeCategory) {
      const d = app.data;
      const lat = Number(d.latitude), lng = Number(d.longitude);
      const address = [d.fullAddress, d.area, d.city, d.district, d.pincode].map(str).filter(Boolean).join(", ");
      const gst = str(d.gstNumber);
      const { data: store, error: sErr } = await db.from("stores").insert({
        owner_id: userId,
        name: app.business_name || app.applicant_name,
        category: map.storeCategory,
        address: address || null,
        lat: Number.isFinite(lat) && d.latitude ? lat : null,
        lng: Number.isFinite(lng) && d.longitude ? lng : null,
        is_open: false, // stays closed until the vendor finishes setup
        gstin: gst || null,
      }).select("id").single();
      if (sErr || !store) throw new ApprovalError(500, sErr?.message ?? "Could not create the store");
      storeId = store.id;
      const { error: uErr } = await db.from("profiles").update({ store_id: storeId }).eq("id", userId);
      if (uErr) throw new ApprovalError(500, uErr.message);
    }
  } catch (e) {
    if (storeId) await db.from("stores").delete().eq("id", storeId);
    await db.auth.admin.deleteUser(userId); // cascades the profile row
    throw e;
  }
  return { userId, storeId, role: map.role, email: loginEmail, tempPassword };
}
