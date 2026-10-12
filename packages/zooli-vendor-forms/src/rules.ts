import type { Field, FormDefinition, FormValues, Rule, Section, UploadedFile } from "./types";
import { isUploadedFile } from "./types";

// ---------------------------------------------------------------------
// Pure validation — no React, no DOM. Used in the browser (inline errors)
// and on the server (apps/api re-validates every submission).
// ---------------------------------------------------------------------

const PATTERNS: Partial<Record<Rule, { re: RegExp; msg: string }>> = {
  aadhaar:       { re: /^[2-9]\d{11}$/, msg: "Enter a valid 12-digit Aadhaar number" },
  pan:           { re: /^[A-Z]{5}\d{4}[A-Z]$/, msg: "Enter a valid PAN (e.g. ABCDE1234F)" },
  gst:           { re: /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, msg: "Enter a valid 15-character GSTIN" },
  ifsc:          { re: /^[A-Z]{4}0[A-Z0-9]{6}$/, msg: "Enter a valid IFSC (e.g. SBIN0001234)" },
  mobile:        { re: /^[6-9]\d{9}$/, msg: "Enter a valid 10-digit mobile number" },
  email:         { re: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, msg: "Enter a valid email address" },
  pincode:       { re: /^[1-9]\d{5}$/, msg: "Enter a valid 6-digit PIN code" },
  accountNumber: { re: /^\d{9,18}$/, msg: "Account number must be 9–18 digits" },
  vehicleReg:    { re: /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{1,4}$/, msg: "Enter a valid vehicle number (e.g. AP21AB1234)" },
  positiveInt:   { re: /^\d+$/, msg: "Enter a whole number" },
};

/** Strip spaces/dashes and upper-case where the format is case-insensitive. */
export function normalize(rule: Rule | undefined, raw: string): string {
  const v = raw.trim();
  switch (rule) {
    case "aadhaar":
    case "accountNumber":
    case "mobile":
      return v.replace(/[\s-]/g, "");
    case "pan":
    case "gst":
    case "ifsc":
    case "vehicleReg":
      return v.replace(/[\s-]/g, "").toUpperCase();
    default:
      return v;
  }
}

function parseDate(v: string): Date | null {
  // <input type="date"> yields YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(v + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

export function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function isVisible(field: Field, values: FormValues): boolean {
  if (!field.showIf) return true;
  const cur = values[field.showIf.field];
  return Array.isArray(cur)
    ? (cur as unknown[]).includes(field.showIf.equals)
    : cur === field.showIf.equals;
}

function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "boolean") return v === false;
  return false;
}

function ruleError(rule: Rule, v: string): string | null {
  const p = PATTERNS[rule];
  if (p) return p.re.test(normalize(rule, v)) ? null : p.msg;
  const d = parseDate(v);
  switch (rule) {
    case "adult": {
      if (!d) return "Enter a valid date";
      const cutoff = new Date(); cutoff.setFullYear(cutoff.getFullYear() - 18);
      if (d > cutoff) return "You must be at least 18 years old";
      if (d.getFullYear() < 1920) return "Enter a valid date of birth";
      return null;
    }
    case "pastOrToday": {
      if (!d) return "Enter a valid date";
      return d > new Date() ? "Date cannot be in the future" : null;
    }
    case "future": {
      if (!d) return "Enter a valid date";
      const t = parseDate(todayISO())!;
      return d <= t ? "Date must be in the future" : null;
    }
    case "latitude": {
      const n = Number(v); return Number.isFinite(n) && n >= -90 && n <= 90 ? null : "Latitude must be between -90 and 90";
    }
    case "longitude": {
      const n = Number(v); return Number.isFinite(n) && n >= -180 && n <= 180 ? null : "Longitude must be between -180 and 180";
    }
    default:
      return null;
  }
}

/** Error message for one field, or null if it's fine (or hidden). */
export function validateField(field: Field, values: FormValues): string | null {
  if (!isVisible(field, values)) return null;
  const v = values[field.name];

  switch (field.type) {
    case "file": {
      const files: UploadedFile[] = Array.isArray(v) ? (v as UploadedFile[]).filter(isUploadedFile)
        : isUploadedFile(v) ? [v] : [];
      if (field.required && files.length === 0) return "Please upload this document";
      if (field.multiple && field.min && files.length > 0 && files.length < field.min) {
        return `Upload at least ${field.min} files`;
      }
      return null;
    }
    case "map": {
      const lat = values[field.latField]; const lng = values[field.lngField];
      if (field.required && (isEmpty(lat) || isEmpty(lng))) return "Select the location on the map";
      return null;
    }
    case "checkbox":
      return field.required && v !== true ? "This is required" : null;
    case "checkboxes":
    case "multiselect":
      return field.required && isEmpty(v) ? "Select at least one option" : null;
    case "radio":
    case "select":
      return field.required && isEmpty(v) ? "Please choose an option" : null;
    default: {
      const s = typeof v === "string" ? v : "";
      if (isEmpty(s)) return field.required ? "This field is required" : null;
      if (field.type === "email") return ruleError("email", s);
      if (field.rule) return ruleError(field.rule, s);
      return null;
    }
  }
}

export type FormErrors = Record<string, string>;

export function validateSection(section: Section, values: FormValues): FormErrors {
  const errors: FormErrors = {};
  for (const f of section.fields) {
    if (!isVisible(f, values)) continue;
    const e = validateField(f, values);
    if (e) errors[f.name] = e;
    if ("attach" in f && f.attach && f.attach.required && !isUploadedFile(values[f.attach.name])) {
      errors[f.attach.name] = `Upload ${f.attach.label.replace(/^Upload\s+/i, "")}`;
    }
  }
  return errors;
}

export function validateForm(form: FormDefinition, values: FormValues): FormErrors {
  let errors: FormErrors = {};
  for (const s of form.sections) errors = { ...errors, ...validateSection(s, values) };

  if (values.declaration !== true) errors.declaration = "Please confirm the declaration to continue";

  // Cross-field checks
  const f = (n: string) => (typeof values[n] === "string" ? (values[n] as string) : "");
  if (f("licenseIssueDate") && f("licenseExpiryDate") && !errors.licenseExpiryDate) {
    if (f("licenseExpiryDate") <= f("licenseIssueDate")) errors.licenseExpiryDate = "Expiry must be after the issue date";
  }
  if (f("mobile") && f("emergencyContact") && normalize("mobile", f("mobile")) === normalize("mobile", f("emergencyContact"))
      && !errors.emergencyContact) {
    errors.emergencyContact = "Emergency contact must be different from your mobile number";
  }
  if (f("totalWorkers") && f("skilledWorkers") && f("unskilledWorkers") && !errors.totalWorkers) {
    const total = Number(f("totalWorkers")), s = Number(f("skilledWorkers")), u = Number(f("unskilledWorkers"));
    if (s + u > total) errors.totalWorkers = "Skilled + unskilled workers can't exceed the total";
  }
  if (f("qualifiedTeachers") && f("totalFaculty") && !errors.qualifiedTeachers) {
    if (Number(f("qualifiedTeachers")) > Number(f("totalFaculty"))) errors.qualifiedTeachers = "Can't exceed total faculty";
  }
  return errors;
}

/** Names of every field a section owns, including inline-attach fields. */
export function sectionFieldNames(section: Section): string[] {
  const names: string[] = [];
  for (const f of section.fields) {
    names.push(f.name);
    if (f.type === "map") names.push(f.latField, f.lngField, f.searchField);
    if ("attach" in f && f.attach) names.push(f.attach.name);
  }
  return names;
}

/** Defaults for a fresh form (today's date, pre-set selects, …). */
export function initialValues(form: FormDefinition): FormValues {
  const v: FormValues = {};
  for (const s of form.sections) {
    for (const f of s.fields) {
      if (f.type === "text" || f.type === "email" || f.type === "tel" || f.type === "number" ||
          f.type === "textarea" || f.type === "date" || f.type === "time") {
        if (f.defaultToday) v[f.name] = todayISO();
        else if (f.defaultValue !== undefined) v[f.name] = f.defaultValue;
      } else if (f.type === "select" && f.defaultValue !== undefined) v[f.name] = f.defaultValue;
      else if (f.type === "radio" && f.defaultValue !== undefined) v[f.name] = f.defaultValue;
      else if (f.type === "checkboxes" && f.defaultValue) v[f.name] = [...f.defaultValue];
    }
  }
  return v;
}

/** Plain-language value for review screens / admin view. */
export function displayValue(field: Field, values: FormValues): string {
  const v = values[field.name];
  if (field.type === "file") {
    const files = Array.isArray(v) ? (v as UploadedFile[]) : isUploadedFile(v) ? [v] : [];
    return files.length ? files.map((x) => x.name).join(", ") : "—";
  }
  if (field.type === "map") {
    const lat = values[field.latField], lng = values[field.lngField];
    return lat && lng ? `${lat}, ${lng}` : "—";
  }
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.length ? (v as string[]).join(", ") : "—";
  return typeof v === "string" && v.trim() ? v : "—";
}

// ---------------------------------------------------------------------
// Sanitising untrusted input (server side) / normalising before submit
// ---------------------------------------------------------------------

export interface SanitizeOptions {
  /** Uploaded-file URLs must match this (e.g. your Cloudinary host) or the file is dropped. */
  fileUrlPattern?: RegExp;
  /** Server mode: drop uploaded-file objects that lack a valid zooli/applications/* Cloudinary public id. */
  requirePublicId?: boolean;
  maxString?: number;
}

/**
 * Keeps only keys the form actually defines, coerces types, trims/limits strings, applies
 * `normalize()` for formatted fields (PAN → upper-case, Aadhaar → digits only, …) and drops
 * uploaded-file objects that don't look like our own uploads.
 */
export function sanitizeValues(form: FormDefinition, raw: unknown, opts: SanitizeOptions = {}): FormValues {
  const max = opts.maxString ?? 1000;
  const src = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: FormValues = {};

  const cleanFile = (v: unknown): UploadedFile | null => {
    if (!isUploadedFile(v)) return null;
    const f = v as UploadedFile;
    if (opts.fileUrlPattern && !opts.fileUrlPattern.test(f.url)) return null;
    const publicId = typeof f.publicId === "string" && /^zooli\/applications\/[A-Za-z0-9_-]{1,100}$/.test(f.publicId) ? f.publicId : undefined;
    if (opts.requirePublicId && !publicId) return null;
    const rt = f.resourceType === "image" || f.resourceType === "raw" || f.resourceType === "video" ? f.resourceType : undefined;
    return {
      url: String(f.url).slice(0, 500),
      name: String(f.name ?? "file").slice(0, 200),
      size: Number(f.size) || 0,
      type: String(f.type ?? "").slice(0, 80),
      ...(publicId ? { publicId, resourceType: rt ?? "image", format: String(f.format ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) } : {}),
    };
  };

  const put = (name: string, rule: Rule | undefined, kind: "text" | "list" | "bool" | "file" | "files" | "any") => {
    const v = src[name];
    if (v === undefined || v === null) return;
    if (kind === "bool") { out[name] = v === true; return; }
    if (kind === "file") { const f = cleanFile(v); if (f) out[name] = f; return; }
    if (kind === "files") {
      const list = (Array.isArray(v) ? v : [v]).map(cleanFile).filter((x): x is UploadedFile => !!x).slice(0, 12);
      if (list.length) out[name] = list;
      return;
    }
    if (kind === "list") {
      if (Array.isArray(v)) out[name] = v.filter((x) => typeof x === "string").map((x) => (x as string).trim().slice(0, 120)).slice(0, 60);
      return;
    }
    if (typeof v === "string") out[name] = normalize(rule, v.slice(0, max));
    else if (typeof v === "number") out[name] = String(v);
  };

  for (const section of form.sections) {
    for (const f of section.fields) {
      switch (f.type) {
        case "file": put(f.name, undefined, f.multiple ? "files" : "file"); break;
        case "checkbox": put(f.name, undefined, "bool"); break;
        case "checkboxes":
        case "multiselect": put(f.name, undefined, "list"); break;
        case "map": break; // lat / lng / search are ordinary text fields on the form
        default: put(f.name, "rule" in f ? f.rule : undefined, "text");
      }
      if ("attach" in f && f.attach) put(f.attach.name, undefined, "file");
    }
  }
  put("declaration", undefined, "bool");
  return out;
}
