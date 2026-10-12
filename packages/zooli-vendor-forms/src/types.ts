// Declarative description of a vendor registration form. The same definition
// drives (a) the form UI in zooli-vendor, (b) server-side validation in
// apps/api, and (c) the labelled read-only view in zooli-admin.

export type ServiceKey =
  | "food" | "rides" | "home" | "shifting" | "parcel" | "tuition" | "hotel" | "resort";

/** Named validators — implemented in rules.ts. */
export type Rule =
  | "aadhaar" | "pan" | "gst" | "ifsc" | "mobile" | "email" | "pincode"
  | "accountNumber" | "vehicleReg" | "adult" | "pastOrToday" | "future"
  | "latitude" | "longitude" | "positiveInt";

/** Grid span (out of 12 columns) at the `lg` breakpoint. Below that, fields stack / go two-up. */
export type Span = 3 | 4 | 5 | 6 | 8 | 12;

export interface ShowIf {
  field: string;
  /** Visible when the controlling field equals this value (or is included in it, for arrays). */
  equals: string | boolean;
}

interface FieldBase {
  name: string;
  label: string;
  required?: boolean;
  span?: Span;
  hint?: string;
  showIf?: ShowIf;
  /** Spans multiple grid rows (used by the map widget). */
  rowSpan?: 2 | 3 | 4;
}

export interface InlineAttach {
  name: string;
  label: string; // e.g. "Upload Aadhar"
  required?: boolean;
}

export interface TextField extends FieldBase {
  type: "text" | "email" | "tel" | "number" | "textarea" | "date" | "time";
  placeholder?: string;
  rule?: Rule;
  maxLength?: number;
  rows?: number;
  /** Small "Upload …" button rendered beside the input (Aadhaar / PAN / GST proofs). */
  attach?: InlineAttach;
  /** Prefill with today's date (Date of Registration). */
  defaultToday?: boolean;
  readOnly?: boolean;
  defaultValue?: string;
  /** Force upper-case on blur (PAN, IFSC, GST, vehicle number). */
  uppercase?: boolean;
  /** Shows a search icon (area / street search on the food form). */
  search?: boolean;
}

export interface SelectField extends FieldBase {
  type: "select";
  options: string[];
  placeholder?: string;
  defaultValue?: string;
  readOnly?: boolean;
}

export interface MultiSelectField extends FieldBase {
  type: "multiselect";
  options: string[];
  placeholder?: string;
  max?: number;
}

export interface RadioField extends FieldBase {
  type: "radio";
  options: string[];
  /** "chips" renders bordered pill buttons (star category); default is plain radio dots. */
  variant?: "dots" | "chips";
  defaultValue?: string;
}

export interface ChoiceOption {
  value: string;
  emoji?: string;
}

export interface CheckboxesField extends FieldBase {
  type: "checkboxes";
  options: Array<string | ChoiceOption>;
  /** chips = bordered boxes (facilities), plain = simple checkbox list, cards = emoji tiles (skills). */
  variant?: "chips" | "plain" | "cards";
  defaultValue?: string[];
}

export interface CheckboxField extends FieldBase {
  type: "checkbox";
  /** Text shown next to the box (defaults to label). */
  text?: string;
}

export interface FileField extends FieldBase {
  type: "file";
  accept: "image" | "doc" | "any"; // image = JPG/PNG, doc = PDF/JPG/PNG
  /** tile = illustrated card with an Upload button; button = just the button. */
  variant?: "tile" | "button";
  emoji?: string;
  actionLabel?: string; // "Upload Document", "Take / Upload", …
  multiple?: boolean;
  /** Minimum files when `multiple` (e.g. "Min. 3 photos"). */
  min?: number;
}

/** Search box + OpenStreetMap preview + "use my location"; writes latitude/longitude. */
export interface MapField extends FieldBase {
  type: "map";
  latField: string;
  lngField: string;
  searchField: string;
}

export type Field =
  | TextField | SelectField | MultiSelectField | RadioField
  | CheckboxesField | CheckboxField | FileField | MapField;

export interface Section {
  id: string;
  title: string;
  subtitle?: string;
  /** Index into FormDefinition.steps — which sidebar step this section belongs to. */
  step: number;
  fields: Field[];
  /** Optional heads-up banner shown under the title (food form's "keep documents ready"). */
  notice?: { title: string; items: string[] };
  /** Small "(Select all that apply)" style caption next to the title. */
  caption?: string;
  /** Two sections can share a row on large screens (e.g. Working Hours | Declaration). */
  half?: boolean;
}

export interface Step {
  title: string;
  subtitle: string;
}

export interface FormDefinition {
  service: ServiceKey;
  title: string; // "Food & Restaurant Vendor Registration"
  shortTitle: string; // "Food & Restaurant"
  emoji: string;
  blurb: string; // one-liner for the chooser
  steps: Step[];
  sections: Section[];
  /** Field names that feed the application list (admin table + duplicate check). */
  summary: {
    name: string;
    business?: string;
    mobile: string;
    email?: string;
    city?: string;
    district?: string;
  };
  primaryLabel: string;
}

export interface UploadedFile {
  /** Cloudinary delivery URL. Files are stored as type=authenticated, so this URL alone does NOT open them. */
  url: string;
  name: string;
  size: number;
  type: string;
  /** Cloudinary identifiers — used by the server to verify the file and mint short-lived signed links. */
  publicId?: string;
  resourceType?: "image" | "raw" | "video";
  format?: string;
}

/**
 * Text fields that are encrypted at rest (AES-256-GCM) by the API and shown masked
 * to admins until explicitly revealed (each reveal is audit-logged). They are also
 * never written to the applicant's browser draft.
 */
export const SENSITIVE_FIELDS = ["aadhaarNumber", "panNumber", "accountNumber", "licenseNumber"] as const;

export type FieldValue = string | string[] | boolean | UploadedFile | UploadedFile[] | undefined;
export type FormValues = Record<string, FieldValue>;

export function isUploadedFile(v: unknown): v is UploadedFile {
  return !!v && typeof v === "object" && !Array.isArray(v) && typeof (v as UploadedFile).url === "string";
}
