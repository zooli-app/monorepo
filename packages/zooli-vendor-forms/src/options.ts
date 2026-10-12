// Shared dropdown / checkbox option lists. Edit here to change them in every form.

const thisYear = new Date().getFullYear();

export const YEARS_BACK = (n: number): string[] =>
  Array.from({ length: n }, (_, i) => String(thisYear - i));

export const BANKS = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
  "Punjab National Bank", "Bank of Baroda", "Canara Bank", "Union Bank of India",
  "Bank of India", "Indian Bank", "Indian Overseas Bank", "Central Bank of India",
  "IDBI Bank", "Yes Bank", "IndusInd Bank", "Federal Bank", "South Indian Bank",
  "Karnataka Bank", "Andhra Pradesh Grameena Vikas Bank", "Telangana Grameena Bank",
  "Andhra Pragathi Grameena Bank", "India Post Payments Bank", "Other",
];

export const DISTRICTS = [
  // Andhra Pradesh
  "Alluri Sitharama Raju", "Anakapalli", "Ananthapuramu", "Annamayya", "Bapatla", "Chittoor",
  "East Godavari", "Eluru", "Guntur", "Kakinada", "Konaseema", "Krishna", "Kurnool", "Nandyal",
  "NTR", "Palnadu", "Parvathipuram Manyam", "Prakasam", "Sri Balaji", "Sri Sathya Sai",
  "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa",
  "Nellore (SPSR)", "Tirupati",
  // Telangana
  "Adilabad", "Bhadradri Kothagudem", "Hanumakonda", "Hyderabad", "Jagtial", "Jangaon",
  "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam",
  "Kumuram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri",
  "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli",
  "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad",
  "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri",
  "Other",
];

export const STATES = [
  "Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Kerala", "Maharashtra", "Goa", "Gujarat",
  "Rajasthan", "Madhya Pradesh", "Chhattisgarh", "Odisha", "West Bengal", "Bihar", "Jharkhand",
  "Uttar Pradesh", "Uttarakhand", "Himachal Pradesh", "Punjab", "Haryana", "Delhi", "Jammu & Kashmir",
  "Ladakh", "Assam", "Meghalaya", "Manipur", "Mizoram", "Nagaland", "Tripura", "Arunachal Pradesh",
  "Sikkim", "Puducherry", "Chandigarh", "Andaman & Nicobar Islands", "Lakshadweep",
  "Dadra & Nagar Haveli and Daman & Diu",
];

export const SERVICE_CITIES = [
  "Dhone", "Kurnool", "Nandyal", "Atmakur", "Hyderabad", "Secunderabad", "Anantapur", "Kadapa",
  "Tirupati", "Nellore", "Guntur", "Vijayawada", "Visakhapatnam", "Warangal", "Karimnagar",
  "Nizamabad", "Khammam", "Mahabubnagar", "Other",
];

export const RADIUS_KM = ["5 km", "10 km", "15 km", "20 km", "30 km", "50 km", "100 km", "Anywhere in district"];

export const WORKING_SLOTS = ["5 AM - 10 AM", "10 AM - 11 AM", "5 PM - 10 PM", "1 AM - 3 AM"];

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const LANGUAGES = [
  "Telugu", "Hindi", "English", "Urdu", "Tamil", "Kannada", "Malayalam", "Marathi", "Other",
];

export const QUALIFICATIONS = [
  "Below 10th", "10th / SSC", "12th / Intermediate", "ITI / Diploma", "Graduate",
  "Post Graduate", "Professional Degree", "Other",
];

export const EXPERIENCE_YEARS = [
  "Less than 1 year", "1 - 2 years", "3 - 5 years", "6 - 10 years", "More than 10 years",
];

export const YEARS_IN_BUSINESS = [
  "Less than 1 year", "1 - 3 years", "3 - 5 years", "5 - 10 years", "More than 10 years",
];

/** Half-hour clock times for check-in / opening hours dropdowns. */
export const TIMES: string[] = (() => {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hh = h % 12 === 0 ? 12 : h % 12;
      out.push(`${String(hh).padStart(2, "0")}:${m === 0 ? "00" : "30"} ${h < 12 ? "AM" : "PM"}`);
    }
  }
  return out;
})();

export const WHEELER_OPTIONS = ["2 Wheeler", "3 Wheeler", "4 Wheeler", "6 Wheeler"];

export const ALSO_INTERESTED_SERVICES = [
  { value: "Food Delivery", emoji: "🍲" },
  { value: "Grocery Delivery", emoji: "🛒" },
  { value: "Home Services", emoji: "🏠" },
  { value: "Local Parcel", emoji: "📦" },
  { value: "Ride Services", emoji: "🚗" },
];
