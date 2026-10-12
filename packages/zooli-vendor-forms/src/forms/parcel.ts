import type { FormDefinition } from "../types";
import {
  file, personalSection, addressSection, bankSection, vehicleFields, insuranceFields,
  serviceAreaFields, alsoInterestedField, workingSlotsField,
} from "../common";

export const parcel: FormDefinition = {
  service: "parcel",
  title: "Parcel Services Vendor Registration",
  shortTitle: "Parcel Services",
  emoji: "📦",
  blurb: "Local parcel pickup & delivery partners with their own vehicle",
  primaryLabel: "Review & Submit",
  summary: { name: "fullName", mobile: "mobile", email: "email", city: "city", district: "district" },
  steps: [
    { title: "Personal Information", subtitle: "Basic & contact details" },
    { title: "Address Details", subtitle: "Present address information" },
    { title: "Vehicle Information", subtitle: "Vehicle & RC details" },
    { title: "Insurance & Pollution", subtitle: "Insurance and certificate details" },
    { title: "Documents Upload", subtitle: "Required documents & photos" },
    { title: "Bank Details", subtitle: "Bank account information" },
    { title: "Service Area", subtitle: "Service area & radius" },
    { title: "Working Hours", subtitle: "Availability & working hours" },
    { title: "Additional Services", subtitle: "Other services you offer" },
    { title: "Review & Submit", subtitle: "Review all details & submit" },
  ],
  sections: [
    personalSection({ step: 0, fatherLabel: "Father / Husband Name", registrationDateRequired: false }),
    addressSection({ title: "Address Details", step: 1 }),
    { id: "vehicle", title: "Vehicle Details", step: 2, fields: vehicleFields({}) },
    {
      id: "insurance", title: "Insurance & Pollution Details", step: 3,
      // order on the mock-up: insurance number / doc first, then pollution number / certificate
      fields: (([pn, pc, inum, idoc]) => [inum, idoc, pn, pc])(insuranceFields()),
    },
    {
      id: "documents", title: "Documents & Photos", step: 4,
      fields: [
        file("drivingLicenseDoc", "Driving License", { required: true, variant: "tile", emoji: "🪪", actionLabel: "Upload License", span: 3 }),
        file("livePhoto", "Live Photo", { required: true, variant: "tile", accept: "image", emoji: "🧑", actionLabel: "Upload Photo", span: 3 }),
        file("homeSelfie", "Selfie at Home", { required: true, variant: "tile", accept: "image", emoji: "🏠", actionLabel: "Upload Photo", span: 3 }),
        file("familyPhoto", "Family Photo", { required: true, variant: "tile", accept: "image", emoji: "👨‍👩‍👧", actionLabel: "Upload Photo", span: 3 }),
        file("disabilityDoc", "Disability / Surgery (If any)", { variant: "tile", emoji: "♿", actionLabel: "Upload Document", span: 3 }),
      ],
    },
    bankSection(5),
    { id: "area", title: "Service Area", step: 6, half: true, fields: serviceAreaFields(6) },
    { id: "hours", title: "Working Hours", step: 7, half: true, fields: [workingSlotsField(true)] },
    {
      id: "additional", title: "Additional Services (Interested in offering)", step: 8,
      fields: [alsoInterestedField(["Local Parcel", "Home Services"])],
    },
  ],
};
