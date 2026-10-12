import type { ServiceListing, ServicePageData } from '@/lib/types';
import { mockCategories } from './mock-categories';
import { mockOffers } from './mock-offers';

const foodListings: ServiceListing[] = [
  { id: 'f1', name: 'Hotel Srinivasa Grand', vendorName: 'Srinivasa Grand', rating: 4.5, reviewCount: 312, deliveryTimeMinutes: 28, priceForTwo: 300, isOpen: true, tags: ['Biryani', 'Andhra', 'Meals'], category: 'food', slug: 'hotel-srinivasa-grand' },
  { id: 'f2', name: 'Spice Garden Restaurant', vendorName: 'Spice Garden', rating: 4.2, reviewCount: 198, deliveryTimeMinutes: 35, priceForTwo: 250, isOpen: true, tags: ['South Indian', 'Tiffin', 'Thali'], category: 'food', slug: 'spice-garden' },
  { id: 'f3', name: 'Taste of Andhra', vendorName: 'Taste of Andhra', rating: 4.7, reviewCount: 451, deliveryTimeMinutes: 22, priceForTwo: 350, isOpen: true, tags: ['Andhra Meals', 'Biryani', 'Curry'], category: 'food', slug: 'taste-of-andhra' },
  { id: 'f4', name: 'Ravi Bakery & Snacks', vendorName: 'Ravi Bakery', rating: 4.0, reviewCount: 87, deliveryTimeMinutes: 18, priceForTwo: 120, isOpen: true, tags: ['Bakery', 'Snacks', 'Tea'], category: 'food', slug: 'ravi-bakery' },
  { id: 'f5', name: 'Dhone Biryani House', vendorName: 'Biryani House', rating: 4.6, reviewCount: 530, deliveryTimeMinutes: 40, priceForTwo: 400, isOpen: false, tags: ['Biryani', 'Dum', 'Family Pack'], category: 'food', slug: 'dhone-biryani-house' },
  { id: 'f6', name: 'Meghana Foods', vendorName: 'Meghana Foods', rating: 4.3, reviewCount: 220, deliveryTimeMinutes: 30, priceForTwo: 280, isOpen: true, tags: ['Chicken', 'Mutton', 'Rice'], category: 'food', slug: 'meghana-foods' },
];

const groceryListings: ServiceListing[] = [
  { id: 'g1', name: 'Sri Laxmi Kirana Store', vendorName: 'Sri Laxmi Stores', rating: 4.4, reviewCount: 165, deliveryTimeMinutes: 25, isOpen: true, tags: ['Groceries', 'Pulses', 'Rice'], category: 'grocery', slug: 'sri-laxmi-kirana' },
  { id: 'g2', name: 'Fresh Veggie Hub', vendorName: 'Fresh Veggie Hub', rating: 4.6, reviewCount: 289, deliveryTimeMinutes: 20, isOpen: true, tags: ['Vegetables', 'Fruits', 'Organic'], category: 'grocery', slug: 'fresh-veggie-hub' },
  { id: 'g3', name: 'Daily Needs Supermart', vendorName: 'Daily Needs', rating: 4.1, reviewCount: 102, deliveryTimeMinutes: 35, isOpen: true, tags: ['FMCG', 'Dairy', 'Snacks'], category: 'grocery', slug: 'daily-needs-supermart' },
  { id: 'g4', name: 'Organic Valley Dhone', vendorName: 'Organic Valley', rating: 4.8, reviewCount: 74, deliveryTimeMinutes: 40, isOpen: true, tags: ['Organic', 'Natural', 'Chemical-free'], category: 'grocery', slug: 'organic-valley-dhone' },
];

const ridesListings: ServiceListing[] = [
  { id: 'r1', name: 'Zooli Car — 4 Seater AC', vendorName: 'Zooli Rides', rating: 4.7, reviewCount: 892, startingFareInr: 99, isOpen: true, tags: ['AC', '4 Seater', 'City Rides'], category: 'rides', slug: 'zooli-car' },
  { id: 'r2', name: 'Zooli Auto — 3 Seater', vendorName: 'Zooli Rides', rating: 4.5, reviewCount: 1240, startingFareInr: 49, isOpen: true, tags: ['Auto', '3 Seater', 'Quick'], category: 'rides', slug: 'zooli-auto' },
  { id: 'r3', name: 'Zooli Bike — Solo Rider', vendorName: 'Zooli Rides', rating: 4.6, reviewCount: 678, startingFareInr: 29, isOpen: true, tags: ['Bike', 'Fast', 'Solo'], category: 'rides', slug: 'zooli-bike' },
  { id: 'r4', name: 'Outstation Car — Sedan', vendorName: 'Zooli Rides', rating: 4.8, reviewCount: 203, startingFareInr: 1299, isOpen: true, tags: ['Outstation', 'AC', 'Long Distance'], category: 'rides', slug: 'outstation-car' },
];

const homeServicesListings: ServiceListing[] = [
  { id: 'hs1', name: 'Plumber On Demand', vendorName: 'FixIt Dhone', rating: 4.5, reviewCount: 134, startingFareInr: 199, isOpen: true, tags: ['Plumbing', 'Leaks', 'Tap'], category: 'home-services', slug: 'plumber-on-demand' },
  { id: 'hs2', name: 'Electrician Services', vendorName: 'PowerFix', rating: 4.3, reviewCount: 98, startingFareInr: 249, isOpen: true, tags: ['Electrical', 'Wiring', 'Fan'], category: 'home-services', slug: 'electrician-services' },
  { id: 'hs3', name: 'Home Deep Cleaning', vendorName: 'CleanHome Pro', rating: 4.7, reviewCount: 201, startingFareInr: 799, isOpen: true, tags: ['Cleaning', 'Sanitize', 'Full Home'], category: 'home-services', slug: 'home-deep-cleaning' },
  { id: 'hs4', name: 'AC Service & Repair', vendorName: 'CoolCare', rating: 4.6, reviewCount: 312, startingFareInr: 349, isOpen: false, tags: ['AC', 'Service', 'Gas Fill'], category: 'home-services', slug: 'ac-service' },
];

const houseShiftingListings: ServiceListing[] = [
  { id: 'hsh1', name: 'Mini Truck Shifting', vendorName: 'Zooli Move', rating: 4.4, reviewCount: 89, startingFareInr: 1499, isOpen: true, tags: ['Mini Truck', 'Local', '1-2 BHK'], category: 'house-shifting', slug: 'mini-truck-shifting' },
  { id: 'hsh2', name: 'Full Home Packers & Movers', vendorName: 'SwiftMove Dhone', rating: 4.6, reviewCount: 145, startingFareInr: 4999, isOpen: true, tags: ['Packers', 'Movers', '3 BHK'], category: 'house-shifting', slug: 'full-home-packers-movers' },
  { id: 'hsh3', name: 'Office Relocation', vendorName: 'SwiftMove Dhone', rating: 4.5, reviewCount: 56, startingFareInr: 3499, isOpen: true, tags: ['Office', 'Corporate', 'Same Day'], category: 'house-shifting', slug: 'office-relocation' },
];

const parcelListings: ServiceListing[] = [
  { id: 'p1', name: 'Instant Bike Parcel', vendorName: 'Zooli Parcel', rating: 4.6, reviewCount: 432, startingFareInr: 39, isOpen: true, tags: ['Instant', 'Bike', 'Small Parcel'], category: 'parcel', slug: 'instant-bike-parcel' },
  { id: 'p2', name: 'Same-Day Delivery', vendorName: 'Zooli Parcel', rating: 4.4, reviewCount: 218, startingFareInr: 79, isOpen: true, tags: ['Same Day', 'Medium Box', 'Tracked'], category: 'parcel', slug: 'same-day-delivery' },
  { id: 'p3', name: 'Inter-city Courier', vendorName: 'Zooli Parcel', rating: 4.3, reviewCount: 134, startingFareInr: 149, isOpen: true, tags: ['Inter-city', 'Documents', '2-3 Days'], category: 'parcel', slug: 'inter-city-courier' },
];

const tuitionListings: ServiceListing[] = [
  { id: 't1', name: 'Ramesh Maths Coaching', vendorName: 'Ramesh Sir', rating: 4.8, reviewCount: 203, startingFareInr: 1500, isOpen: true, tags: ['Maths', 'Class 8-10', 'SSC'], category: 'tuition', slug: 'ramesh-maths-coaching' },
  { id: 't2', name: 'Science & English Tutor', vendorName: 'Priya Madam', rating: 4.7, reviewCount: 167, startingFareInr: 1200, isOpen: true, tags: ['Science', 'English', 'Class 5-8'], category: 'tuition', slug: 'science-english-tutor' },
  { id: 't3', name: 'IIT JEE Foundation', vendorName: 'BrightMinds Academy', rating: 4.9, reviewCount: 312, startingFareInr: 4000, isOpen: true, tags: ['JEE', 'NEET', 'Inter'], category: 'tuition', slug: 'iit-jee-foundation' },
];

const hotelListings: ServiceListing[] = [
  { id: 'h1', name: 'Srinivasa Function Hall', vendorName: 'Srinivasa Kalyana Mandapam', rating: 4.5, reviewCount: 289, startingFareInr: 25000, isOpen: true, tags: ['Wedding', '500 Pax', 'Catering'], category: 'hotel', slug: 'srinivasa-function-hall' },
  { id: 'h2', name: 'Hotel Krishna Palace', vendorName: 'Krishna Palace', rating: 4.2, reviewCount: 134, startingFareInr: 1200, isOpen: true, tags: ['Rooms', 'AC', 'Family'], category: 'hotel', slug: 'hotel-krishna-palace' },
  { id: 'h3', name: 'Mahalaxmi Convention Centre', vendorName: 'Mahalaxmi Events', rating: 4.6, reviewCount: 201, startingFareInr: 40000, isOpen: true, tags: ['Convention', '1000 Pax', 'Parking'], category: 'hotel', slug: 'mahalaxmi-convention' },
];

const resortListings: ServiceListing[] = [
  { id: 'rs1', name: 'Nallamala Eco Resort', vendorName: 'Nallamala Resort', rating: 4.7, reviewCount: 178, startingFareInr: 3500, isOpen: true, tags: ['Nature', 'Eco', 'Weekend'], category: 'resort', slug: 'nallamala-eco-resort' },
  { id: 'rs2', name: 'Srisailam Day Trip Package', vendorName: 'Zooli Tours', rating: 4.6, reviewCount: 312, startingFareInr: 1299, isOpen: true, tags: ['Srisailam', 'Tour', 'Day Trip'], category: 'resort', slug: 'srisailam-day-trip' },
  { id: 'rs3', name: 'Tungabhadra River Camp', vendorName: 'River Camp Co.', rating: 4.8, reviewCount: 94, startingFareInr: 2800, isOpen: true, tags: ['Camping', 'River', 'Adventure'], category: 'resort', slug: 'tungabhadra-river-camp' },
];

export const mockServiceListingsBySlug: Record<string, ServiceListing[]> = {
  'food': foodListings,
  'grocery': groceryListings,
  'rides': ridesListings,
  'home-services': homeServicesListings,
  'house-shifting': houseShiftingListings,
  'parcel': parcelListings,
  'tuition': tuitionListings,
  'hotel-function-halls': hotelListings,
  'resorts-tourist': resortListings,
};

const headlineMap: Record<string, { headline: string; subheadline: string }> = {
  'food': { headline: 'Hot food, delivered fast', subheadline: 'From local restaurants and home kitchens straight to your door' },
  'grocery': { headline: 'Fresh groceries, your doorstep', subheadline: 'Vegetables, fruits, staples and more — picked fresh daily' },
  'rides': { headline: 'Go anywhere, anytime', subheadline: 'Bikes, autos and cabs available round the clock in Dhone' },
  'home-services': { headline: 'Trusted pros for your home', subheadline: 'Electricians, plumbers, cleaners — verified and background-checked' },
  'house-shifting': { headline: 'Move with zero stress', subheadline: 'Professional packers and movers for local and outstation moves' },
  'parcel': { headline: 'Send anything, anywhere locally', subheadline: 'Fast, tracked parcel delivery across Dhone and nearby towns' },
  'tuition': { headline: 'Expert tutors near you', subheadline: 'From school subjects to competitive exam coaching' },
  'hotel-function-halls': { headline: 'Perfect venues for every occasion', subheadline: 'Hotels, function halls and convention centres in and around Dhone' },
  'resorts-tourist': { headline: 'Explore, unwind, discover', subheadline: 'Weekend getaways and day trips from Dhone' },
};

export function getMockServicePageData(slug: string): ServicePageData | null {
  const category = mockCategories.find((c) => c.slug === slug);
  if (!category) return null;
  const listings = mockServiceListingsBySlug[slug] ?? [];
  const meta = headlineMap[slug] ?? { headline: category.title, subheadline: 'Browse all available options' };
  return {
    category,
    headline: meta.headline,
    subheadline: meta.subheadline,
    listings,
    featuredOffers: mockOffers.slice(0, 2),
  };
}
