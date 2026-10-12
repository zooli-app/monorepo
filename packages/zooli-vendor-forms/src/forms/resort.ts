import type { FormDefinition } from "../types";
import { text, select, file, personalSection, addressSection, bankSection, daysAndHoursSection } from "../common";
import { TIMES, YEARS_BACK } from "../options";

export const resort: FormDefinition = {
  service: "resort",
  title: "Resort & Tourist Vendor Registration",
  shortTitle: "Resorts & Tourist",
  emoji: "🏝️",
  blurb: "Resorts, homestays, villas, cottages and tourism operators",
  primaryLabel: "Review & Submit",
  summary: { name: "fullName", business: "businessName", mobile: "mobile", email: "email", city: "city", district: "district" },
  steps: [
    { title: "Business Information", subtitle: "Resort / Tourism business details" },
    { title: "Owner / Contact Person", subtitle: "Owner & contact details" },
    { title: "Location Details", subtitle: "Business location" },
    { title: "Resort / Property Details", subtitle: "Resort, rooms & amenities" },
    { title: "Facilities & Activities", subtitle: "Facilities & tourist activities" },
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
        text("businessName", "Business Name (Resort / Tourism)", { required: true, placeholder: "Enter business name", span: 4, maxLength: 100 }),
        select("businessType", "Business Type", ["Resort", "Homestay Operator", "Villa / Farmhouse", "Tour Operator", "Adventure / Activity Operator", "Travel Agency"], { required: true, placeholder: "Select type", span: 4 }),
        { type: "checkboxes", name: "propertyTypes", label: "Property Type (You can select multiple)", required: true, variant: "plain", span: 4, options: ["Resort", "Hotel", "Homestay", "Villa", "Cottage", "Other"] },
        text("businessRegNumber", "Business Registration Number (If any)", { placeholder: "Enter registration number", span: 4, maxLength: 40 }),
        text("gstNumber", "GST Number (If any)", { placeholder: "Enter GST number", span: 4, rule: "gst", uppercase: true, maxLength: 15, attach: { name: "gstDoc", label: "Upload GST" } }),
        text("panNumber", "PAN Number", { required: true, placeholder: "Enter PAN number", span: 4, rule: "pan", uppercase: true, maxLength: 10, attach: { name: "panDoc", label: "Upload PAN", required: true } }),
      ],
    },
    personalSection({ id: "owner", title: "Owner / Contact Person Information", step: 1, panAttach: false, alternateMobile: true, fatherLabel: "Father / Husband Name" }),
    { ...addressSection({ title: "Resort / Property Location", step: 2, withState: true, areaLabel: "Area / Landmark" }) },
    {
      id: "property", title: "Resort / Property Details", step: 3,
      fields: [
        text("totalArea", "Total Area (in Sq. Ft / Acres)", { required: true, placeholder: "Enter area", span: 3, maxLength: 30 }),
        text("totalRooms", "Total Rooms / Units", { type: "number", required: true, placeholder: "Enter number", span: 3, rule: "positiveInt" }),
        text("totalBeds", "Total Beds", { type: "number", required: true, placeholder: "Enter number", span: 3, rule: "positiveInt" }),
        text("maxOccupancy", "Max. Occupancy (Guests)", { type: "number", required: true, placeholder: "Enter number", span: 3, rule: "positiveInt" }),
        select("checkInTime", "Check-in Time", TIMES, { required: true, placeholder: "Select time", span: 3, defaultValue: "12:00 PM" }),
        select("checkOutTime", "Check-out Time", TIMES, { required: true, placeholder: "Select time", span: 3, defaultValue: "11:00 AM" }),
        text("nearestAirport", "Nearest Airport", { placeholder: "Enter airport name", span: 3, maxLength: 80 }),
        text("nearestRailway", "Nearest Railway Station", { placeholder: "Enter station name", span: 3, maxLength: 80 }),
        text("nearestBusStand", "Nearest Bus Stand", { placeholder: "Enter bus stand name", span: 4, maxLength: 80 }),
        select("yearOfConstruction", "Year of Construction", YEARS_BACK(80), { placeholder: "Select year", span: 3 }),
        { type: "radio", name: "starCategory", label: "Property Star Category (If any)", options: ["5 Star", "4 Star", "3 Star", "2 Star", "1 Star", "Not Applicable"], variant: "chips", span: 5 },
      ],
    },
    {
      id: "facilities", title: "Facilities & Amenities", caption: "(Select all that apply)", step: 4,
      fields: [{
        type: "checkboxes", name: "facilities", label: "Facilities", variant: "chips", span: 12,
        options: ["Swimming Pool", "Restaurant", "Free Wi-Fi", "Room Service", "Parking", "AC Rooms", "Hot Water", "Gym / Fitness", "Spa", "Laundry", "Travel Desk", "Conference Hall", "Bonfire", "Kids Play Area", "Power Backup", "House Keeping", "Doctor on Call", "Lift", "CCTV Security", "Wheelchair Access", "Other"],
      }],
    },
    {
      id: "activities", title: "Tourist Activities / Services Offered", caption: "(Select all that apply)", step: 4,
      fields: [{
        type: "checkboxes", name: "activities", label: "Activities", variant: "cards", span: 12,
        options: [
          { value: "Sightseeing", emoji: "📸" }, { value: "Adventure Sports", emoji: "🧗" }, { value: "Trekking", emoji: "🥾" },
          { value: "Boating", emoji: "⛵" }, { value: "Wildlife Safari", emoji: "🦌" }, { value: "Camp Fire", emoji: "🔥" },
          { value: "Cultural Tours", emoji: "🏛️" }, { value: "Local Guide", emoji: "🧭" }, { value: "Event Management", emoji: "🎪" },
          { value: "Car / Bike Rental", emoji: "🚙" }, { value: "Other", emoji: "➕" },
        ],
      }],
    },
    {
      id: "documents", title: "Documents Upload", step: 5,
      fields: [
        file("businessRegDoc", "Business Registration Certificate", { variant: "tile", emoji: "🏛️", span: 4 }),
        file("gstCert", "GST Certificate (If any)", { variant: "tile", emoji: "🧾", span: 4 }),
        file("panCard", "PAN Card", { variant: "tile", emoji: "🪪", span: 4 }),
        file("propertyPhotos", "Property / Resort Photos (Min. 3 Photos)", { required: true, variant: "tile", accept: "image", emoji: "🌴", actionLabel: "Upload Photos", multiple: true, min: 3, span: 4 }),
        file("ownerAadhaarCard", "Owner Aadhar Card", { variant: "tile", emoji: "🪪", span: 4 }),
        file("otherDoc", "Other Document (If any)", { variant: "tile", emoji: "📄", span: 4 }),
      ],
    },
    bankSection(6),
    daysAndHoursSection(7, { allDayLabel: "24 Hours Service Available" }),
    {
      id: "additional", title: "Additional Information", step: 8, half: true,
      fields: [
        { type: "checkboxes", name: "languagesSpoken", label: "Languages Spoken", required: true, variant: "plain", span: 12, options: ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Other"] },
        text("otherInfo", "Any Other Information", { type: "textarea", placeholder: "Enter any other information about your resort / tourism business", span: 12, rows: 3, maxLength: 500 }),
      ],
    },
  ],
};
