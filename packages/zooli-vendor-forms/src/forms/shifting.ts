import type { FormDefinition } from "../types";
import {
  text, select, file, personalSection, addressSection, bankSection, vehicleFields, insuranceFields,
  drivingLicenseFields, serviceAreaFields, alsoInterestedField, workingSlotsField,
} from "../common";
import { YEARS_IN_BUSINESS, EXPERIENCE_YEARS } from "../options";

export const shifting: FormDefinition = {
  service: "shifting",
  title: "House Shifting Vendor Registration",
  shortTitle: "House Shifting",
  emoji: "🚚",
  blurb: "Packers & movers, local and outstation house / office shifting",
  primaryLabel: "Review & Submit",
  summary: { name: "fullName", business: "businessName", mobile: "mobile", email: "email", city: "city", district: "district" },
  steps: [
    { title: "Business Information", subtitle: "Business & service details" },
    { title: "Owner Information", subtitle: "Owner / contact details" },
    { title: "Address Details", subtitle: "Business address details" },
    { title: "Vehicle Details", subtitle: "Vehicle & RC details" },
    { title: "Driver Licenses", subtitle: "Driving license details" },
    { title: "Employee / Worker Details", subtitle: "Worker information" },
    { title: "Documents Upload", subtitle: "Upload documents" },
    { title: "Bank Details", subtitle: "Bank account information" },
    { title: "Review & Submit", subtitle: "Review all details & submit" },
  ],
  sections: [
    {
      id: "business", title: "Business Information", step: 0,
      fields: [
        text("businessName", "Business Name (As per GST / Registration)", { required: true, placeholder: "Enter business name", span: 4, maxLength: 100 }),
        select("businessType", "Business Type", ["Proprietorship", "Partnership", "Private Limited", "LLP", "Individual / Unregistered"], { required: true, placeholder: "Select type", span: 4 }),
        select("serviceCategory", "Service Category", ["House Shifting Service"], { required: true, span: 4, defaultValue: "House Shifting Service", readOnly: true }),
        text("businessRegNumber", "Business Registration Number (If any)", { placeholder: "Enter registration number", span: 4, maxLength: 40 }),
        text("gstNumber", "GST Number (If any)", { placeholder: "Enter GST number", span: 4, rule: "gst", uppercase: true, maxLength: 15, attach: { name: "gstDoc", label: "Upload GST" } }),
        select("yearsInBusiness", "Years in Business", YEARS_IN_BUSINESS, { required: true, placeholder: "Select years", span: 4 }),
        {
          type: "checkboxes", name: "servicesOffered", label: "Services Offered", required: true, variant: "chips", span: 12,
          options: ["House Shifting (Local)", "House Shifting (Outstation)", "Office Shifting", "Packing & Unpacking", "Loading & Unloading", "Car / Bike Transport", "Storage / Warehouse", "Other Services"],
        },
      ],
    },
    personalSection({ id: "owner", title: "Owner / Contact Person Information", step: 1, fatherLabel: "Father / Husband Name" }),
    addressSection({ title: "Business Address", step: 2 }),
    {
      id: "vehicle", title: "Vehicle Details", step: 3,
      fields: [
        ...vehicleFields({ shifting: true }),
        ...insuranceFields(),
      ],
    },
    { id: "license", title: "Driving License Details", caption: "(For Drivers)", step: 4, half: true, fields: drivingLicenseFields().map((f) => ({ ...f, span: 6 as const })) },
    {
      id: "workers", title: "Employee / Worker Details", step: 5, half: true,
      fields: [
        text("totalWorkers", "Total Number of Workers", { type: "number", required: true, placeholder: "Enter number of workers", span: 4, rule: "positiveInt" }),
        text("skilledWorkers", "Skilled Workers", { type: "number", required: true, placeholder: "Enter number", span: 4, rule: "positiveInt" }),
        text("unskilledWorkers", "Unskilled Workers", { type: "number", required: true, placeholder: "Enter number", span: 4, rule: "positiveInt" }),
        { type: "radio", name: "safetyTraining", label: "Any Safety Training Provided?", options: ["Yes", "No"], span: 6 },
        select("teamExperience", "Experience of Team", EXPERIENCE_YEARS, { required: true, placeholder: "Select experience", span: 6 }),
      ],
    },
    {
      id: "documents", title: "Documents Upload", step: 6,
      fields: [
        file("businessRegDoc", "Business Registration", { variant: "tile", emoji: "🏛️", span: 3 }),
        file("gstCert", "GST Certificate (If any)", { variant: "tile", emoji: "🧾", span: 3 }),
        file("panCard", "PAN Card", { variant: "tile", emoji: "🪪", span: 3 }),
        file("insurancePolicy", "Insurance Policy", { variant: "tile", emoji: "🛡️", span: 3 }),
        file("otherDoc", "Other Document (If any)", { variant: "tile", emoji: "📄", span: 3 }),
      ],
    },
    bankSection(7),
    {
      id: "area", title: "Service Area & Availability", step: 8,
      fields: [
        ...serviceAreaFields(6),
        { ...workingSlotsField(true), label: "Working Hours / Availability" },
        { type: "checkbox", name: "availableAllDay", label: "Available All Day", text: "Available All Day", span: 12 },
        alsoInterestedField(["Local Parcel", "Ride Services"]),
      ],
    },
  ],
};
