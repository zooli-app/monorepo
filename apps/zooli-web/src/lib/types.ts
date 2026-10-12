/**
 * Core domain types for the Zooli home experience.
 *
 * These shapes are written to mirror what a real backend would return so that
 * swapping the mock data layer (see `src/lib/api/*`) for live HTTP calls
 * requires no changes to components — only to the fetch functions.
 */

export interface Address {
  line1: string;
  city: string;
  state: string;
  pincode?: string;
}

export interface ServiceCategory {
  id: string;
  /** Human label shown on the card, e.g. "Vegetables & Grocery" */
  title: string;
  /** Short machine slug used for routing, e.g. "grocery" */
  slug: string;
  /** Icon identifier resolved by <CategoryIcon /> */
  icon: CategoryIconName;
  /** Route the card links to */
  href: string;
  /** Optional badge, e.g. "New" */
  badge?: string;
}

export type CategoryIconName =
  | 'food'
  | 'grocery'
  | 'rides'
  | 'home-services'
  | 'house-shifting'
  | 'parcel'
  | 'tuition'
  | 'hotel'
  | 'resort';

export type OfferAccent = 'gold' | 'leaf' | 'sky' | 'violet';

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  /** e.g. "40% OFF" or "₹100 OFF" */
  badgeLabel: string;
  accent: OfferAccent;
  href: string;
}

export type RideType = 'car' | 'auto' | 'bike';

export interface RideOption {
  id: string;
  type: RideType;
  label: string;
  description: string;
  /** Lowest fare currently available for this ride type, in INR */
  startingFareInr?: number;
  etaMinutes?: number;
  href: string;
}

export interface LocationSummary {
  label: string;
  address: Address;
}

export interface NotificationSummary {
  unreadCount: number;
}

export interface CartSummary {
  itemCount: number;
}

export interface HomePageData {
  location: LocationSummary;
  notifications: NotificationSummary;
  cart: CartSummary;
  categories: ServiceCategory[];
  offers: Offer[];
  rides: RideOption[];
}

/* ─────────────────────────────── Cart ─────────────────────────────── */

export interface CartItem {
  id: string;
  name: string;
  description: string;
  priceInr: number;
  quantity: number;
  vendorName: string;
  category: CategoryIconName;
}

export interface Cart {
  items: CartItem[];
  subtotalInr: number;
  discountInr: number;
  deliveryFeeInr: number;
  totalInr: number;
  couponCode?: string;
}

/* ─────────────────────────────── Notifications ─────────────────────── */

export type NotifType = 'order' | 'offer' | 'ride' | 'system';

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  href?: string;
}

/* ─────────────────────────────── Account ────────────────────────────── */

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarInitials: string;
  memberSince: string;
  totalOrders: number;
  savedAddresses: SavedAddress[];
  wallet: WalletSummary;
}

export interface SavedAddress {
  id: string;
  label: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface WalletSummary {
  balanceInr: number;
  cashbackInr: number;
}

export type OrderStatus = 'delivered' | 'cancelled' | 'in-progress' | 'placed';

export interface OrderSummary {
  id: string;
  displayId: string;
  placedAt: string;
  status: OrderStatus;
  totalInr: number;
  itemCount: number;
  vendorName: string;
  category: CategoryIconName;
}

/* ─────────────────────────────── Service Detail ─────────────────────── */

export interface ServiceListing {
  id: string;
  name: string;
  vendorName: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMinutes?: number;
  priceForTwo?: number;
  startingFareInr?: number;
  isOpen: boolean;
  tags: string[];
  category: CategoryIconName;
  slug: string;
}

export interface ServicePageData {
  category: ServiceCategory;
  headline: string;
  subheadline: string;
  listings: ServiceListing[];
  featuredOffers: Offer[];
}
