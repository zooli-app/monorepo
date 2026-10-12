import type { FormDefinition } from "../types";
import { text, select, file, personalSection, addressSection, bankSection, qualificationSelect, alsoInterestedField } from "../common";
import { EXPERIENCE_YEARS, LANGUAGES, SERVICE_CITIES } from "../options";

const SLOTS = ["5 AM - 10 AM", "10 AM - 11 AM", "5 PM - 10 PM", "1 AM - 3 AM"];

export const home: FormDefinition = {
  service: "home",
  title: "Home Services Vendor Registration",
  shortTitle: "Home Services",
  emoji: "🛠️",
  blurb: "Electricians, plumbers, carpenters, painters, AC & appliance repair, cleaning",
  primaryLabel: "Review & Submit",
  summary: { name: "fullName", mobile: "mobile", email: "email", city: "city", district: "district" },
  steps: [
    { title: "Personal Information", subtitle: "Basic & contact details" },
    { title: "Address Details", subtitle: "Present address details" },
    { title: "Service & Skills", subtitle: "Select services & skills" },
    { title: "Experience & Documents", subtitle: "Experience & related docs" },
    { title: "Working Hours", subtitle: "Set your availability" },
    { title: "Bank Details", subtitle: "Bank account information" },
    { title: "Photos", subtitle: "Upload required photos" },
    { title: "Additional Services", subtitle: "Other services you offer" },
    { title: "Review & Submit", subtitle: "Review all details & submit" },
  ],
  sections: [
    personalSection({ step: 0, fatherLabel: "Father Name" }),
    addressSection({ title: "Address Details", step: 1 }),
    {
      id: "skills", title: "Service Information / Employee Need to select Related Skills", step: 2,
      fields: [
        {
          type: "checkboxes", name: "skills", label: "Select Your Skills / Services", required: true, variant: "cards", span: 8,
          options: [
            { value: "Electrician", emoji: "⚡" }, { value: "Plumber", emoji: "🚰" }, { value: "Carpenter", emoji: "🔨" },
            { value: "Painter", emoji: "🎨" }, { value: "AC Repair", emoji: "❄️" }, { value: "Appliance Repair", emoji: "🔧" },
            { value: "Pest Control", emoji: "🪲" }, { value: "Home Cleaning", emoji: "🧹" }, { value: "Other", emoji: "➕" },
          ],
        },
        text("skillsOther", "Other skill (please specify)", { placeholder: "Enter your skill", span: 4, showIf: { field: "skills", equals: "Other" }, required: true, maxLength: 80 }),
        select("yearsExperience", "Years of Experience", EXPERIENCE_YEARS, { required: true, placeholder: "Select experience", span: 4 }),
        file("experienceDocs", "Experience / Related Documents", { variant: "button", actionLabel: "Upload Document", span: 4, multiple: true }),
        { type: "multiselect", name: "languages", label: "Languages Known", options: LANGUAGES, placeholder: "Select languages", span: 4 },
      ],
    },
    {
      id: "hours", title: "Service Location & Working Hours", step: 4,
      fields: [
        select("city1", "Select City / Area You Want to Work In (1)", SERVICE_CITIES, { required: true, placeholder: "Select City 1", span: 3 }),
        select("city2", "City / Area (2)", SERVICE_CITIES, { placeholder: "Select City 2", span: 3 }),
        select("city3", "City / Area (3)", SERVICE_CITIES, { placeholder: "Select City 3", span: 3 }),
        { type: "checkboxes", name: "workingSlots", label: "Working Hours / Availability", required: true, options: SLOTS, variant: "chips", span: 12 },
        { type: "checkbox", name: "availableAllDay", label: "Available All Day", text: "Available All Day", span: 12 },
      ],
    },
    {
      id: "documents", title: "Documents Upload", step: 3,
      fields: [
        file("aadhaarPhoto", "Aadhar Card Photo", { required: true, variant: "tile", emoji: "🪪", span: 3 }),
        file("panCard", "PAN Card", { required: true, variant: "tile", emoji: "💳", span: 3 }),
        file("passbook", "Bank Passbook / Cancelled Cheque", { required: true, variant: "tile", emoji: "🏦", span: 3 }),
        file("experienceCert", "Experience / Certificate (If any)", { variant: "tile", emoji: "🎓", span: 3 }),
        file("disabilityDoc", "Any Surgery / Disability (If any)", { variant: "tile", emoji: "📋", span: 3 }),
      ],
    },
    { ...bankSection(5, "bank"), fields: bankSection(5).fields.filter((f) => f.name !== "passbook") },
    {
      id: "photos", title: "Photos", step: 6,
      fields: [
        file("livePhoto", "Live Photo", { required: true, variant: "tile", accept: "image", emoji: "🧑", actionLabel: "Take / Upload", span: 3 }),
        file("familyPhoto", "Family Photo", { required: true, variant: "tile", accept: "image", emoji: "👨‍👩‍👧", actionLabel: "Upload", span: 3 }),
        file("homeSelfie", "Present Living Home Selfie", { required: true, variant: "tile", accept: "image", emoji: "🏠", actionLabel: "Take / Upload", span: 3 }),
        file("disabilityPhoto", "Disability / Any Surgery (If any)", { variant: "tile", accept: "image", emoji: "♿", actionLabel: "Upload", span: 3 }),
      ],
    },
    {
      id: "interested", title: "Are you interested along with below services?", caption: "(You can select multiple)", step: 7, half: true,
      fields: [alsoInterestedField(["Home Services", "Ride Services"])],
    },
    {
      id: "education", title: "Educational Qualification", step: 7, half: true,
      fields: [
        { ...qualificationSelect(true), span: 12 },
        file("qualificationProof", "Any Proof Upload (Optional)", { variant: "button", actionLabel: "Upload Document", span: 12 }),
      ],
    },
  ],
};
