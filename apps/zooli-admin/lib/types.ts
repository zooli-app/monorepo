export type OrderStatus = "delivered" | "pending" | "cancelled" | "in_progress";
export type VendorStatus = "active" | "inactive" | "suspended";
export type VerificationStatus = "verified" | "pending" | "rejected";
export type UserStatus = "active" | "idle" | "blocked";
export type PaymentStatus = "success" | "processing" | "refunded" | "failed";
export type RideStatus = "on_trip" | "completed" | "cancelled" | "assigned";
export type ServiceType =
  | "food"
  | "grocery"
  | "rides"
  | "home"
  | "shifting"
  | "parcel"
  | "tuition"
  | "hotel"
  | "resort";

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vendorId: string;
  vendorName: string;
  service: ServiceType;
  zone: string;
  amount: number;
  commission: number;
  status: OrderStatus;
  paymentMethod: "upi" | "card" | "cash" | "wallet";
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: ServiceType;
  zone: string;
  totalOrders: number;
  revenue: number;
  rating: number;
  status: VendorStatus;
  verificationStatus: VerificationStatus;
  joinedAt: string;
  documents: string[];
  commissionRate: number;
  gstin?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  zone: string;
  totalOrders: number;
  totalSpent: number;
  status: UserStatus;
  joinedAt: string;
  lastActive: string;
  referralCode: string;
  walletBalance: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  commission: number;
  paymentMethod: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface Ride {
  id: string;
  passenger: string;
  driver: string;
  driverPhone: string;
  rideType: "car" | "auto" | "bike";
  from: string;
  to: string;
  fare: number;
  distance: number;
  status: RideStatus;
  startTime?: string;
  endTime?: string;
  zone: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: ServiceType;
  emoji: string;
  vendorCount: number;
  orderCount: number;
  revenue: number;
  isActive: boolean;
  commission: number;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  applicableServices: ServiceType[];
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface DashboardMetrics {
  ordersToday: number;
  revenueToday: number;
  activeUsers: number;
  pendingOrders: number;
  ordersGrowth: number;
  revenueGrowth: number;
  usersGrowth: number;
  totalVendors: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number | string;
  section?: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface FilterState {
  search: string;
  status?: string;
  service?: string;
  zone?: string;
  dateFrom?: string;
  dateTo?: string;
}
