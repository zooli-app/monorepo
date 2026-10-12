import type { FormDefinition } from "../types";
import { text, select, file, personalSection, bankSection } from "../common";
import { DAYS, DISTRICTS, TIMES, YEARS_BACK } from "../options";

export const food: FormDefinition = {
  service: "food",
  title: "Food & Restaurant Vendor Registration",
  shortTitle: "Food & Restaurant",
  emoji: "🍽️",
  blurb: "Restaurants, cafés, bakeries, cloud kitchens and sweet shops",
  primaryLabel: "Review & Submit",
  summary: { name: "fullName", business: "restaurantName", mobile: "mobile", email: "email", city: "city", district: "district" },
  steps: [
    { title: "Restaurant Info", subtitle: "Basic details about your restaurant" },
    { title: "Owner Details", subtitle: "Personal information" },
    { title: "Restaurant Location", subtitle: "Set your restaurant location" },
    { title: "Documents", subtitle: "Upload required documents" },
    { title: "Bank Details", subtitle: "Bank account information" },
    { title: "Menu & Photos", subtitle: "Upload menu and restaurant photos" },
    { title: "Working Hours", subtitle: "Set working days & hours" },
    { title: "Delivery & Orders", subtitle: "Delivery settings & order preferences" },
    { title: "Review", subtitle: "Review your information" },
    { title: "Submit", subtitle: "Submit for approval" },
  ],
  sections: [
    {
      id: "restaurant", title: "Restaurant Information", step: 0,
      notice: { title: "Keep below documents and details ready for faster registration", items: ["PAN Card", "FSSAI License", "GST Number (If Required)", "Bank Account Details", "Menu & Food Photos"] },
      fields: [
        text("restaurantName", "Restaurant Name", { required: true, placeholder: "Enter restaurant name (visible to customers)", span: 6, maxLength: 100 }),
        select("restaurantType", "Restaurant Type", ["Restaurant", "Café", "Bakery", "Cloud Kitchen", "Sweet Shop", "Fast Food / QSR", "Dhaba", "Juice & Beverages", "Catering"], { required: true, placeholder: "Select type", span: 6 }),
        select("cuisine", "Cuisine", ["Andhra", "Telangana", "South Indian", "North Indian", "Biryani", "Chinese", "Fast Food", "Street Food", "Italian", "Bakery & Desserts", "Beverages", "Multi-cuisine"], { required: true, placeholder: "Select cuisine", span: 6 }),
        select("restaurantCategory", "Restaurant Category", ["Pure Veg", "Non-Veg", "Veg & Non-Veg", "Egg"], { required: true, placeholder: "Select category", span: 6 }),
      ],
    },
    { ...personalSection({ id: "owner", title: "Owner Details", step: 1, fatherLabel: "Father / Husband Name", panRequired: true }) },
    {
      id: "location", title: "Restaurant Location", step: 2,
      fields: [
        text("searchArea", "Search Area / Street Name", { required: false, placeholder: "Search area, street name...", span: 6, search: true }),
        { type: "map", name: "map", label: "Select Location on Map", span: 6, rowSpan: 3, latField: "latitude", lngField: "longitude", searchField: "searchArea" },
        text("fullAddress", "Full Address", { type: "textarea", required: true, placeholder: "Enter complete address", span: 6, rows: 3, maxLength: 300 }),
        text("shopNo", "Shop No / Floor / Tower", { placeholder: "Enter shop no / floor / tower", span: 6, maxLength: 80 }),
        text("area", "Area / Sector / Locality", { required: true, placeholder: "Enter locality", span: 3, maxLength: 80 }),
        select("district", "District", DISTRICTS, { required: true, placeholder: "Select district", span: 3 }),
        text("city", "City / Town", { required: true, placeholder: "Enter city", span: 3, maxLength: 60 }),
        text("pincode", "PIN Code", { required: true, placeholder: "Enter pin code", span: 3, rule: "pincode", maxLength: 6 }),
        text("latitude", "Latitude", { required: true, placeholder: "Enter latitude", span: 6, rule: "latitude" }),
        text("longitude", "Longitude", { required: true, placeholder: "Enter longitude", span: 6, rule: "longitude" }),
      ],
    },
    {
      id: "documents", title: "Restaurant Documents", subtitle: "Upload clear and valid documents", step: 3,
      fields: [
        file("panCard", "PAN Card", { required: true, variant: "tile", emoji: "🪪", span: 3 }),
        file("fssai", "FSSAI License", { required: true, variant: "tile", emoji: "📜", span: 3 }),
        file("gstCert", "GST Number", { variant: "tile", emoji: "🧾", span: 3 }),
        file("otherApproval", "Any Other Approval", { variant: "tile", emoji: "📑", span: 3 }),
      ],
    },
    bankSection(4),
    {
      id: "photos", title: "Restaurant Photos", subtitle: "Upload clear and good quality photos", step: 5,
      fields: [
        file("shopFrontPhoto", "Shop Front Photo (Open Status)", { required: true, variant: "tile", accept: "image", emoji: "🏪", actionLabel: "Upload Photo", span: 3 }),
        file("insidePhoto", "Inside Shop Photo", { required: true, variant: "tile", accept: "image", emoji: "🛋️", actionLabel: "Upload Photo", span: 3 }),
        file("ownerPhoto", "Owner Photo", { required: true, variant: "tile", accept: "image", emoji: "🧑", actionLabel: "Upload Photo", span: 3 }),
        file("businessLogo", "Business Logo", { variant: "tile", accept: "image", emoji: "🏷️", actionLabel: "Upload Photo", span: 3 }),
        file("menuCard", "Menu Card / Food Photos", { variant: "tile", accept: "doc", emoji: "📖", actionLabel: "Upload Menu", multiple: true, span: 3, hint: "Optional — you can also add your menu later from the vendor dashboard" }),
      ],
    },
    {
      id: "details", title: "Restaurant Details", step: 6, half: true,
      fields: [
        select("runningSince", "Shop Running Since", YEARS_BACK(60), { required: true, placeholder: "Select year", span: 12 }),
        { type: "checkboxes", name: "workingDays", label: "Shop Working Days", required: true, options: DAYS, variant: "plain", span: 12, defaultValue: [...DAYS] },
        select("openFrom", "Opening Time", TIMES, { required: true, span: 6, defaultValue: "09:00 AM" }),
        select("openTo", "Closing Time", TIMES, { required: true, span: 6, defaultValue: "10:00 PM" }),
      ],
    },
    {
      id: "other", title: "Other Information", step: 7, half: true,
      fields: [
        { type: "radio", name: "partyOrders", label: "Are you accepting Party Orders?", required: true, options: ["Yes", "No"], span: 12 },
        text("otherNotes", "Other Notes (Optional)", { type: "textarea", placeholder: "Enter any additional information", span: 12, rows: 4, maxLength: 500 }),
      ],
    },
  ],
};

