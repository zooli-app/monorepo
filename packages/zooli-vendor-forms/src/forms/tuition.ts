import type { FormDefinition } from "../types";
import { text, select, file, personalSection, addressSection, bankSection, daysAndHoursSection, experienceSelect } from "../common";
import { YEARS_BACK } from "../options";

export const tuition: FormDefinition = {
  service: "tuition",
  title: "Tuition Point Vendor Registration",
  shortTitle: "Tuition Point",
  emoji: "🎓",
  blurb: "Tuition centres, coaching institutes and online classes",
  primaryLabel: "Review & Submit",
  summary: { name: "fullName", business: "instituteName", mobile: "mobile", email: "email", city: "city", district: "district" },
  steps: [
    { title: "Institute Information", subtitle: "Basic institute details" },
    { title: "Owner / Contact Person", subtitle: "Owner & contact details" },
    { title: "Address Details", subtitle: "Institute address" },
    { title: "Courses & Classes", subtitle: "Courses & classes offered" },
    { title: "Faculty Details", subtitle: "Teacher / faculty information" },
    { title: "Documents Upload", subtitle: "Upload documents & photos" },
    { title: "Bank Details", subtitle: "Bank account information" },
    { title: "Working Hours", subtitle: "Working days & hours" },
    { title: "Additional Information", subtitle: "Other details" },
    { title: "Review & Submit", subtitle: "Review all details & submit" },
  ],
  sections: [
    {
      id: "institute", title: "Institute Information", step: 0,
      fields: [
        text("instituteName", "Institute / Tuition Center Name", { required: true, placeholder: "Enter institute name", span: 4, maxLength: 100 }),
        select("instituteType", "Institute Type", ["Tuition Centre", "Coaching Institute", "Private School Tuition", "Skill / Vocational Training", "Online Academy", "Language / Spoken English Centre"], { required: true, placeholder: "Select type", span: 4 }),
        select("classMode", "Class Mode", ["Offline", "Online", "Both"], { required: true, placeholder: "Select mode", span: 4, hint: "(Offline / Online / Both)" }),
        select("establishedYear", "Established Year", YEARS_BACK(60), { required: true, placeholder: "Select year", span: 4 }),
        select("board", "Board / Curriculum", ["State Board (AP / TS)", "CBSE", "ICSE", "IB / IGCSE", "All Boards", "Not Applicable"], { required: true, placeholder: "Select board", span: 4 }),
        select("instituteCategory", "Institute Category", ["School Level", "Intermediate / Junior College", "Degree / Professional", "Competitive Exams", "Skills & Hobbies", "Mixed"], { required: true, placeholder: "Select category", span: 4 }),
        { type: "checkboxes", name: "classesOffered", label: "Classes Offered (You can select multiple)", required: true, variant: "chips", span: 12, options: ["Nursery - 5th", "6th - 8th", "9th - 10th", "11th - 12th", "Competitive Exams", "Other"] },
      ],
    },
    personalSection({ id: "owner", title: "Owner / Contact Person Information", step: 1, fatherLabel: "Father / Husband Name" }),
    addressSection({ title: "Institute Address", step: 2 }),
    {
      id: "courses", title: "Courses & Classes Offered", step: 3,
      fields: [
        {
          type: "checkboxes", name: "subjects", label: "Subjects / Courses Offered (You can select multiple)", required: true, variant: "chips", span: 8,
          options: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Accountancy", "Business Studies", "Computer Science", "Reasoning", "Competitive Exams", "Spoken English", "Other"],
        },
        select("teachingMedium", "Medium of Teaching", ["Telugu", "English", "Hindi", "Urdu", "Telugu & English", "Other"], { required: true, placeholder: "Select medium", span: 4 }),
        select("batchType", "Batch Type", ["Regular", "Weekend", "Crash Course"], { required: true, placeholder: "Select type", span: 4, hint: "(Regular / Weekend / Crash Course)" }),
      ],
    },
    {
      id: "faculty", title: "Faculty / Teacher Information", step: 4,
      fields: [
        text("totalFaculty", "Total Number of Faculty", { type: "number", required: true, placeholder: "Enter number", span: 4, rule: "positiveInt" }),
        text("qualifiedTeachers", "Qualified Teachers", { type: "number", required: true, placeholder: "Enter number", span: 4, rule: "positiveInt" }),
        experienceSelect("teachingExperience", "Teaching Experience (Average)", 4),
      ],
    },
    {
      id: "documents", title: "Documents Upload", step: 5,
      fields: [
        file("instituteLogo", "Institute Logo", { variant: "tile", accept: "image", emoji: "🏷️", actionLabel: "Upload Logo", span: 3 }),
        file("institutePhoto", "Institute Photo", { variant: "tile", accept: "image", emoji: "🏫", actionLabel: "Upload Photo", span: 3 }),
        file("registrationCert", "Registration Certificate", { variant: "tile", emoji: "📜", span: 3 }),
        file("addressProof", "Address Proof", { variant: "tile", emoji: "📍", span: 3 }),
        file("otherDoc", "Other Document (If any)", { variant: "tile", emoji: "📄", span: 3 }),
      ],
    },
    bankSection(6),
    daysAndHoursSection(7, { from: "09:00 AM", to: "06:00 PM", allDayLabel: "24 Hours (For Online Classes)" }),
    {
      id: "additional", title: "Additional Information", step: 8, half: true,
      fields: [
        { type: "checkboxes", name: "facilities", label: "Facilities Available (You can select multiple)", variant: "plain", span: 12, options: ["Smart Class", "Library", "Study Material", "Online Test", "Doubt Clearing Sessions", "Career Guidance", "Transport Facility", "Other"] },
        text("otherInfo", "Any Other Information", { type: "textarea", placeholder: "Enter any other information about your institute", span: 12, rows: 3, maxLength: 500 }),
      ],
    },
  ],
};
