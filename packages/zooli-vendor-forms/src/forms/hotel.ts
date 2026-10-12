import type { FormDefinition, Field } from "../types";
import { text, select, file, personalSection, addressSection, bankSection, daysAndHoursSection } from "../common";
import { TIMES, YEARS_BACK } from "../options";

const yesNo = (name: string, label: string, span: 3 | 4 | 6 = 3): Field => ({ type: "radio", name, label, options: ["Yes", "No"], span });

export const hotel: FormDefinition = {
  service: "hotel",
  title: "Hotels & Function Hall Vendor Registration",
  shortTitle: "Hotels & Function Halls",
  emoji: "🏨",
  blurb: "Hotels, lodges, banquet halls and function venues",
  primaryLabel: "Review & Submit",
  summary: { name: "fullName", business: "businessName", mobile: "mobile", email: "email", city: "city", district: "district" },
  steps: [
    { title: "Business Information", subtitle: "Hotel / Hall basic details" },
    { title: "Owner / Contact Person", subtitle: "Owner & contact details" },
    { title: "Address Details", subtitle: "Business address" },
    { title: "Property Details", subtitle: "Hotel / Hall information" },
    { title: "Facilities & Amenities", subtitle: "Facilities available" },
    { title: "Documents Upload", subtitle: "Upload documents & photos" },
    { title: "Bank Details", subtitle: "Bank account information" },
    { title: "Working Hours", subtitle: "Availability & timings" },
    { title: "Additional Information", subtitle: "Other details" },
    { title: "Review & Submit", subtitle: "Review all details & submit" },
  ],
  sections: [
    {
      id: "business", title: "Business Information", step: 0,
      fields: [
        text("businessName", "Business Name (Hotel / Function Hall)", { required: true, placeholder: "Enter business name", span: 4, maxLength: 100 }),
        select("businessType", "Business Type", ["Hotel", "Lodge", "Function Hall", "Banquet Hall", "Convention Centre", "Hotel with Banquet"], { required: true, placeholder: "Select type", span: 4 }),
        select("propertyType", "Property Type", ["Budget", "Standard", "Premium", "Luxury", "Heritage"], { required: true, placeholder: "Select type", span: 4 }),
        { type: "radio", name: "starCategory", label: "Star Category (If Hotel)", options: ["5 Star", "4 Star", "3 Star", "2 Star", "1 Star", "Not Applicable"], variant: "chips", span: 8 },
        select("establishedYear", "Established Year", YEARS_BACK(80), { required: true, placeholder: "Select year", span: 4 }),
        text("businessRegNumber", "Business Registration Number (If any)", { placeholder: "Enter registration number", span: 4, maxLength: 40 }),
        text("gstNumber", "GST Number (If any)", { placeholder: "Enter GST number", span: 4, rule: "gst", uppercase: true, maxLength: 15, attach: { name: "gstDoc", label: "Upload GST" } }),
        text("panNumber", "PAN Number", { required: true, placeholder: "Enter PAN number", span: 4, rule: "pan", uppercase: true, maxLength: 10, attach: { name: "panDoc", label: "Upload PAN", required: true } }),
      ],
    },
    personalSection({ id: "owner", title: "Owner / Contact Person Information", step: 1, panAttach: false, fatherLabel: "Father / Husband Name" }),
    addressSection({ title: "Business Address", step: 2, withState: true }),
    {
      id: "property", title: "Property Details", step: 3,
      fields: [
        text("totalRooms", "Total Rooms / Guest Rooms", { type: "number", placeholder: "Enter number", span: 3, rule: "positiveInt" }),
        text("totalCapacity", "Total Capacity (Guests)", { type: "number", placeholder: "Enter capacity", span: 3, rule: "positiveInt" }),
        text("numHalls", "Number of Halls / Banquet Halls", { type: "number", placeholder: "Enter number", span: 3, rule: "positiveInt" }),
        text("largestHallCapacity", "Largest Hall Capacity", { type: "number", placeholder: "Enter capacity", span: 3, rule: "positiveInt" }),
        select("checkInTime", "Check-in Time", TIMES, { placeholder: "Select time", span: 3, defaultValue: "12:00 PM" }),
        select("checkOutTime", "Check-out Time", TIMES, { placeholder: "Select time", span: 3, defaultValue: "11:00 AM" }),
        yesNo("parking", "Parking Facility"),
        yesNo("ownRestaurant", "Own Restaurant"),
        { ...yesNo("hasFssai", "FSSAI License (If Restaurant)"), showIf: { field: "ownRestaurant", equals: "Yes" } },
      ],
    },
    {
      id: "facilities", title: "Facilities & Amenities", caption: "(Select all that apply)", step: 4,
      fields: [{
        type: "checkboxes", name: "facilities", label: "Facilities", variant: "chips", span: 12,
        options: ["AC Rooms", "Free Wi-Fi", "Restaurant", "Room Service", "Parking", "Banquet Hall", "Conference Room", "Swimming Pool", "Gym / Fitness Center", "Spa", "Laundry Service", "Power Backup", "Elevator / Lift", "Catering Service", "Decorations", "DJ / Music System", "Stage", "Projector / Screen", "Other"],
      }],
    },
    {
      id: "documents", title: "Documents Upload", step: 5,
      fields: [
        file("businessRegDoc", "Business Registration Certificate", { variant: "tile", emoji: "🏛️", span: 3 }),
        file("gstCert", "GST Certificate", { variant: "tile", emoji: "🧾", span: 3 }),
        file("panCard", "PAN Card", { variant: "tile", emoji: "🪪", span: 3 }),
        file("propertyPhoto", "Property Photo (Front View)", { required: true, variant: "tile", accept: "image", emoji: "🏨", actionLabel: "Upload Photo", span: 3 }),
        file("interiorPhotos", "Interior Photos (Min. 3 Photos)", { required: true, variant: "tile", accept: "image", emoji: "🖼️", actionLabel: "Upload Photos", multiple: true, min: 3, span: 3 }),
      ],
    },
    bankSection(6),
    daysAndHoursSection(7, { allDayLabel: "24 Hours Service Available" }),
    {
      id: "additional", title: "Additional Information", step: 8, half: true,
      fields: [
        {
          type: "checkboxes", name: "servicesOffered", label: "Services Offered", required: true, variant: "plain", span: 12,
          options: ["Accommodation", "Banquet / Function Hall", "Wedding", "Corporate Events", "Birthday Parties", "Conferences", "Seminars", "Exhibitions", "Other"],
        },
        text("otherInfo", "Any Other Information", { type: "textarea", placeholder: "Enter any other information about your business", span: 12, rows: 3, maxLength: 500 }),
      ],
    },
  ],
};
