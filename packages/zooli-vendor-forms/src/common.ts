import type { Field, FileField, Section, TextField, SelectField } from "./types";
import {
  BANKS, DISTRICTS, STATES, WORKING_SLOTS, DAYS, TIMES, ALSO_INTERESTED_SERVICES,
  SERVICE_CITIES, RADIUS_KM, QUALIFICATIONS, EXPERIENCE_YEARS, WHEELER_OPTIONS, YEARS_BACK,
} from "./options";

// Reusable field / section builders so the 8 forms stay consistent and short.

const text = (name: string, label: string, o: Partial<TextField> = {}): TextField =>
  ({ type: "text", name, label, ...o });
const select = (name: string, label: string, options: string[], o: Partial<SelectField> = {}): SelectField =>
  ({ type: "select", name, label, options, ...o });
const file = (name: string, label: string, o: Partial<FileField> = {}): FileField =>
  ({ type: "file", name, label, accept: "doc", ...o });

export { text, select, file };

// ---- sections ---------------------------------------------------------

export interface PersonalOpts {
  id?: string; title?: string; step: number;
  /** Label for the parent-name field. */
  fatherLabel?: string;
  panRequired?: boolean; panAttach?: boolean;
  registrationDateRequired?: boolean;
  emailLabel?: string;
  alternateMobile?: boolean;
  /** Place the registration date + extras on the last row. */
  mobileSpan?: 3 | 4;
}

/** Aadhaar/PAN/contact block repeated on every form ("Personal" or "Owner / Contact Person"). */
export function personalSection(o: PersonalOpts): Section {
  const fields: Field[] = [
    text("fullName", "Full Name (as per Aadhar)", { required: true, placeholder: "Enter full name", span: 4, maxLength: 80 }),
    text("aadhaarNumber", "Aadhar Number", {
      required: true, placeholder: "Enter 12 digit aadhar number", span: 4, rule: "aadhaar", maxLength: 14,
      attach: { name: "aadhaarDoc", label: "Upload Aadhar", required: true },
    }),
  ];
  if (o.panAttach !== false) {
    fields.push(text("panNumber", "PAN Number", {
      required: o.panRequired ?? true, placeholder: "Enter PAN number", span: 4, rule: "pan", uppercase: true, maxLength: 10,
      attach: { name: "panDoc", label: "Upload PAN", required: o.panRequired ?? true },
    }));
  }
  fields.push(
    text("mobile", "Mobile Number", { type: "tel", required: true, placeholder: "Enter mobile number", span: 3, rule: "mobile", maxLength: 10 }),
    text("email", o.emailLabel ?? "Email ID (Optional)", { type: "email", placeholder: "Enter email address", span: 3 }),
    text("dob", "Date of Birth", { type: "date", required: true, span: 3, rule: "adult" }),
    { type: "radio", name: "gender", label: "Gender", required: true, options: ["Male", "Female", "Other"], span: 3, defaultValue: "Male" },
    text("fatherName", o.fatherLabel ?? "Father Name", { required: true, placeholder: `Enter ${(o.fatherLabel ?? "father name").toLowerCase()}`, span: 4, maxLength: 80 }),
    text("emergencyContact", "Emergency Contact Number", { type: "tel", required: true, placeholder: "Enter emergency contact number", span: 4, rule: "mobile", maxLength: 10 }),
  );
  if (o.alternateMobile) {
    fields.push(text("alternateMobile", "Alternate Mobile Number", { type: "tel", placeholder: "Enter alternate mobile number", span: 4, rule: "mobile", maxLength: 10 }));
  }
  fields.push(text("registrationDate", "Date of Registration", {
    type: "date", required: o.registrationDateRequired ?? true, span: 4, defaultToday: true, rule: "pastOrToday",
  }));
  return { id: o.id ?? "personal", title: o.title ?? "Personal Information", step: o.step, fields };
}

export interface AddressOpts {
  id?: string; title: string; step: number; withState?: boolean; areaLabel?: string; landmark?: boolean;
}

export function addressSection(o: AddressOpts): Section {
  const fields: Field[] = [
    text("fullAddress", "Full Address", { type: "textarea", required: true, placeholder: "Enter complete address", span: 6, rows: 3, maxLength: 300 }),
    text("area", o.areaLabel ?? "Area / Street", { required: true, placeholder: `Enter ${(o.areaLabel ?? "area / street").toLowerCase()}`, span: 6, maxLength: 120 }),
    text("city", "City", { required: true, placeholder: "Enter city", span: o.withState ? 3 : 4, maxLength: 60 }),
    select("district", "District", DISTRICTS, { required: true, placeholder: "Select district", span: o.withState ? 3 : 4 }),
  ];
  if (o.withState) fields.push(select("state", "State", STATES, { required: true, placeholder: "Select state", span: 3, defaultValue: "Andhra Pradesh" }));
  fields.push(text("pincode", "PIN Code", { required: true, placeholder: "Enter pin code", span: o.withState ? 3 : 4, rule: "pincode", maxLength: 6 }));
  return { id: "address", title: o.title, step: o.step, fields };
}

export function bankSection(step: number, id = "bank"): Section {
  return {
    id, title: "Bank Details", step,
    fields: [
      text("accountHolder", "Account Holder Name", { required: true, placeholder: "Enter name as in bank", span: 3, maxLength: 80 }),
      text("accountNumber", "Account Number", { required: true, placeholder: "Enter account number", span: 3, rule: "accountNumber", maxLength: 18 }),
      text("ifsc", "IFSC Code", { required: true, placeholder: "Enter IFSC code", span: 3, rule: "ifsc", uppercase: true, maxLength: 11 }),
      select("bankName", "Bank Name", BANKS, { required: true, placeholder: "Select bank", span: 3 }),
      file("passbook", "Upload Passbook / Cancelled Cheque", { required: true, variant: "button", actionLabel: "Upload Document", span: 6 }),
    ],
  };
}

export const workingSlotsField = (required = true): Field => ({
  type: "checkboxes", name: "workingSlots", label: "Working Slots", required,
  options: WORKING_SLOTS, variant: "plain", span: 12, defaultValue: [...WORKING_SLOTS],
});

export function daysAndHoursSection(step: number, opts: { to?: string; from?: string; allDayLabel: string }): Section {
  return {
    id: "hours", title: "Working Days & Hours", step, half: true,
    fields: [
      { type: "checkboxes", name: "workingDays", label: "Working Days", required: true, options: DAYS, variant: "plain", span: 12, defaultValue: [...DAYS.slice(0, 6)] },
      select("openFrom", "From", TIMES, { required: true, span: 6, defaultValue: opts.from ?? "09:00 AM" }),
      select("openTo", "To", TIMES, { required: true, span: 6, defaultValue: opts.to ?? "10:00 PM" }),
      { type: "checkbox", name: "open24h", label: "24 Hours", text: opts.allDayLabel, span: 12 },
    ],
  };
}

/** "Select cities you want to work in" + radius (rides / parcel / shifting). */
export function serviceAreaFields(span: 6 | 4 = 6): Field[] {
  return [
    { type: "multiselect", name: "serviceCities", label: "Select Cities You Want to Work In", required: true, options: SERVICE_CITIES, placeholder: "Select cities", span },
    select("serviceRadius", "Preferred Service Radius (KM)", RADIUS_KM, { required: true, placeholder: "Select radius", span }),
  ];
}

export function alsoInterestedField(exclude: string[] = []): Field {
  return {
    type: "checkboxes", name: "alsoInterested", label: "Are you interested along with below services?",
    options: ALSO_INTERESTED_SERVICES.filter((s) => !exclude.includes(s.value)), variant: "cards", span: 12,
  };
}

/** Vehicle block used by rides / parcel / shifting. */
export function vehicleFields(opts: { shifting?: boolean }): Field[] {
  const wheelerLabel = opts.shifting ? "Do you have 3 / 4 / 16 / 18 Wheeler?" : "Do you have 2 Wheeler / 3 Wheeler / 4 Wheeler / 6 Wheeler?";
  const f: Field[] = [];
  if (opts.shifting) {
    f.push(select("hasHeavyVehicle", wheelerLabel, ["Yes", "No"], { required: true, placeholder: "Select option (Yes / No)", span: 4 }));
    f.push(select("vehicleType", "Vehicle Type", ["3 Wheeler (Auto Trolley)", "4 Wheeler (Mini Truck)", "Tata Ace / Chhota Hathi", "Pickup (8ft)", "Eicher / 14ft", "16 Wheeler", "18 Wheeler", "Other"], { required: true, placeholder: "Select vehicle type", span: 4 }));
    f.push(text("totalVehicles", "Total Number of Vehicles", { type: "number", required: true, placeholder: "Enter number", span: 4, rule: "positiveInt" }));
  } else {
    f.push(select("wheelerType", wheelerLabel, WHEELER_OPTIONS, { required: true, placeholder: "Select vehicle type", span: 6 }));
    f.push(select("vehicleType", "Vehicle Type", opts.shifting ? [] : ["Bike / Scooter", "Auto Rickshaw", "Hatchback", "Sedan", "SUV / MUV", "Mini Van", "Goods Auto / Tempo", "Pickup / Mini Truck", "Other"], { required: true, placeholder: "Select type", span: 6 }));
  }
  f.push(
    text("vehicleRegNumber", "Vehicle Registration Number", { required: true, placeholder: "Enter registration number", span: 3, rule: "vehicleReg", uppercase: true, maxLength: 12 }),
    file("rcFront", "RC Front (Registration Certificate)", { required: true, variant: "button", actionLabel: "Upload Front", span: 3 }),
    file("rcBack", "RC Back (Registration Certificate)", { required: true, variant: "button", actionLabel: "Upload Back", span: 3 }),
    file("vehiclePhoto", "Vehicle Photo", { required: true, variant: "button", accept: "image", actionLabel: "Upload Photo", span: 3 }),
  );
  return f;
}

export function insuranceFields(): Field[] {
  return [
    text("pollutionCertNumber", "Pollution Certificate Number", { required: true, placeholder: "Enter certificate number", span: 3, maxLength: 40 }),
    file("pollutionCert", "Pollution Certificate", { required: true, variant: "button", actionLabel: "Upload Certificate", span: 3 }),
    text("insuranceNumber", "Vehicle Insurance Number", { required: true, placeholder: "Enter insurance number", span: 3, maxLength: 40 }),
    file("insuranceDoc", "Insurance Document", { required: true, variant: "button", actionLabel: "Upload Insurance", span: 3 }),
  ];
}

export function drivingLicenseFields(withUpload = true): Field[] {
  const f: Field[] = [
    text("licenseNumber", "Driving License Number", { required: true, placeholder: "Enter license number", span: 3, uppercase: true, maxLength: 20 }),
    text("licenseIssueDate", "License Issue Date", { type: "date", required: true, span: 3, rule: "pastOrToday" }),
    text("licenseExpiryDate", "License Expiry Date", { type: "date", required: true, span: 3, rule: "future" }),
  ];
  if (withUpload) f.push(file("licenseDoc", "Upload License", { required: true, variant: "button", actionLabel: "Upload License", span: 3 }));
  return f;
}

export const qualificationSelect = (required = true): SelectField =>
  select("qualification", "Educational Qualification", QUALIFICATIONS, { required, placeholder: "Select qualification", span: 4 });

export const experienceSelect = (name: string, label: string, span: 3 | 4 | 6 = 4) =>
  select(name, label, EXPERIENCE_YEARS, { required: true, placeholder: "Select experience", span });

export { YEARS_BACK };
