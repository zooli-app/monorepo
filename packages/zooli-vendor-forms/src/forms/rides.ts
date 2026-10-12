import type { FormDefinition } from "../types";
import {
  file, personalSection, addressSection, bankSection, vehicleFields, insuranceFields,
  drivingLicenseFields, qualificationSelect, serviceAreaFields, alsoInterestedField, workingSlotsField,
} from "../common";

export const rides: FormDefinition = {
  service: "rides",
  title: "Ride Services Vendor Registration",
  shortTitle: "Ride Services",
  emoji: "🚗",
  blurb: "Bike, auto and cab drivers who want to take ride bookings",
  primaryLabel: "Review & Submit",
  summary: { name: "fullName", mobile: "mobile", email: "email", city: "city", district: "district" },
  steps: [
    { title: "Personal Information", subtitle: "Your basic & contact details" },
    { title: "Address Details", subtitle: "Present address information" },
    { title: "Vehicle Details", subtitle: "Vehicle & RC information" },
    { title: "Driving License", subtitle: "Driving license details" },
    { title: "Documents Upload", subtitle: "Upload required documents" },
    { title: "Bank Details", subtitle: "Bank account information" },
    { title: "Service & Availability", subtitle: "Service area & working hours" },
    { title: "Additional Services", subtitle: "Other services you offer" },
    { title: "Review & Submit", subtitle: "Review all details & submit" },
  ],
  sections: [
    personalSection({ step: 0, fatherLabel: "Father / Husband Name", registrationDateRequired: false }),
    addressSection({ title: "Address Details", step: 1 }),
    { id: "vehicle", title: "Vehicle Details", step: 2, fields: [...vehicleFields({}), ...insuranceFields()] },
    {
      id: "license", title: "Driving License Details", step: 3,
      fields: [...drivingLicenseFields(), { ...qualificationSelect(false), span: 3 as const }],
    },
    {
      id: "documents", title: "Documents & Photos", step: 4,
      fields: [
        file("livePhoto", "Live Photo", { required: true, variant: "tile", accept: "image", emoji: "🧑", actionLabel: "Upload Photo", span: 3 }),
        file("familyPhoto", "Family Photo", { required: true, variant: "tile", accept: "image", emoji: "👨‍👩‍👧", actionLabel: "Upload Photo", span: 3 }),
        file("homeSelfie", "Selfie at Home", { required: true, variant: "tile", accept: "image", emoji: "🏠", actionLabel: "Upload Photo", span: 3 }),
        file("disabilityDoc", "Disability / Surgery (If any)", { variant: "tile", emoji: "♿", actionLabel: "Upload Document", span: 3 }),
      ],
    },
    bankSection(5),
    { id: "area", title: "Service Area", step: 6, half: true, fields: serviceAreaFields(6) },
    { id: "hours", title: "Working Hours", step: 6, half: true, fields: [workingSlotsField(true)] },
    {
      id: "additional", title: "Additional Services (Interested in offering)", step: 7,
      fields: [alsoInterestedField(["Ride Services", "Local Parcel"])],
    },
  ],
};
