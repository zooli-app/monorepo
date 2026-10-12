import type { Order, Vendor, User, Transaction, Ride, ServiceCategory, Coupon, DashboardMetrics, ChartDataPoint } from "./types";

export const dashboardMetrics: DashboardMetrics = {
  ordersToday: 1284,
  revenueToday: 382400,
  activeUsers: 8234,
  pendingOrders: 87,
  ordersGrowth: 18,
  revenueGrowth: 12,
  usersGrowth: 231,
  totalVendors: 342,
  totalOrders: 12847,
  totalRevenue: 4520000,
};

export const recentOrders: Order[] = [
  { id: "ZL-8842", customerId: "u1", customerName: "Ravi Kumar", customerPhone: "+91 9876543210", vendorId: "v1", vendorName: "Hotel Paradise", service: "food", zone: "Dhone", amount: 485, commission: 73, status: "delivered", paymentMethod: "upi", createdAt: new Date(Date.now() - 2 * 60000).toISOString(), updatedAt: new Date(Date.now() - 1 * 60000).toISOString() },
  { id: "ZL-8841", customerId: "u2", customerName: "Priya Sharma", customerPhone: "+91 9876543211", vendorId: "v3", vendorName: "Ravi Auto", service: "rides", zone: "Kurnool", amount: 220, commission: 33, status: "in_progress", paymentMethod: "card", createdAt: new Date(Date.now() - 5 * 60000).toISOString(), updatedAt: new Date(Date.now() - 3 * 60000).toISOString() },
  { id: "ZL-8840", customerId: "u3", customerName: "Suresh Babu", customerPhone: "+91 9876543212", vendorId: "v2", vendorName: "FreshMart", service: "grocery", zone: "Dhone", amount: 1240, commission: 186, status: "pending", paymentMethod: "cash", createdAt: new Date(Date.now() - 8 * 60000).toISOString(), updatedAt: new Date(Date.now() - 7 * 60000).toISOString() },
  { id: "ZL-8839", customerId: "u4", customerName: "Lakshmi Devi", customerPhone: "+91 9876543213", vendorId: "v4", vendorName: "FixIt Pro", service: "home", zone: "Nandyal", amount: 650, commission: 98, status: "delivered", paymentMethod: "upi", createdAt: new Date(Date.now() - 15 * 60000).toISOString(), updatedAt: new Date(Date.now() - 10 * 60000).toISOString() },
  { id: "ZL-8838", customerId: "u5", customerName: "Anil Reddy", customerPhone: "+91 9876543214", vendorId: "v5", vendorName: "SpeedMove", service: "parcel", zone: "Hyderabad", amount: 180, commission: 0, status: "cancelled", paymentMethod: "wallet", createdAt: new Date(Date.now() - 22 * 60000).toISOString(), updatedAt: new Date(Date.now() - 20 * 60000).toISOString() },
  { id: "ZL-8837", customerId: "u6", customerName: "Kavya Mada", customerPhone: "+91 9876543215", vendorId: "v6", vendorName: "Royal Banquet", service: "hotel", zone: "Kurnool", amount: 8500, commission: 1275, status: "delivered", paymentMethod: "card", createdAt: new Date(Date.now() - 60 * 60000).toISOString(), updatedAt: new Date(Date.now() - 50 * 60000).toISOString() },
  { id: "ZL-8836", customerId: "u7", customerName: "Rajesh Teja", customerPhone: "+91 9876543216", vendorId: "v7", vendorName: "MoveEasy", service: "shifting", zone: "Dhone", amount: 3200, commission: 480, status: "in_progress", paymentMethod: "upi", createdAt: new Date(Date.now() - 90 * 60000).toISOString(), updatedAt: new Date(Date.now() - 80 * 60000).toISOString() },
  { id: "ZL-8835", customerId: "u8", customerName: "Divya Rani", customerPhone: "+91 9876543217", vendorId: "v8", vendorName: "Greenfield Tutor", service: "tuition", zone: "Nandyal", amount: 1500, commission: 225, status: "delivered", paymentMethod: "upi", createdAt: new Date(Date.now() - 120 * 60000).toISOString(), updatedAt: new Date(Date.now() - 100 * 60000).toISOString() },
];

export const vendors: Vendor[] = [
  { id: "v1", name: "Hotel Paradise", email: "owner@paradise.in", phone: "+91 9800001111", service: "food", zone: "Dhone", totalOrders: 1284, revenue: 480000, rating: 4.7, status: "active", verificationStatus: "verified", joinedAt: "2024-01-15T00:00:00Z", documents: [], commissionRate: 15 },
  { id: "v2", name: "FreshMart Store", email: "fm@fresh.in", phone: "+91 9800002222", service: "grocery", zone: "Kurnool", totalOrders: 892, revenue: 620000, rating: 4.5, status: "active", verificationStatus: "verified", joinedAt: "2024-02-10T00:00:00Z", documents: [], commissionRate: 12 },
  { id: "v3", name: "Ravi Auto Services", email: "ravi@auto.in", phone: "+91 9800003333", service: "rides", zone: "Dhone", totalOrders: 643, revenue: 140000, rating: 4.2, status: "active", verificationStatus: "verified", joinedAt: "2024-01-20T00:00:00Z", documents: [], commissionRate: 18 },
  { id: "v4", name: "FixIt Pro", email: "fixit@pro.in", phone: "+91 9800004444", service: "home", zone: "Nandyal", totalOrders: 312, revenue: 98000, rating: 4.4, status: "active", verificationStatus: "verified", joinedAt: "2024-03-05T00:00:00Z", documents: [], commissionRate: 20 },
  { id: "v5", name: "SpeedMove Logistics", email: "speed@move.in", phone: "+91 9800005555", service: "parcel", zone: "Hyderabad", totalOrders: 284, revenue: 51120, rating: 4.0, status: "active", verificationStatus: "verified", joinedAt: "2024-03-18T00:00:00Z", documents: [], commissionRate: 15 },
  { id: "v6", name: "Royal Banquet Hall", email: "royal@hall.in", phone: "+91 9800006666", service: "hotel", zone: "Kurnool", totalOrders: 48, revenue: 210000, rating: 4.8, status: "inactive", verificationStatus: "pending", joinedAt: "2024-05-01T00:00:00Z", documents: [], commissionRate: 12 },
  { id: "v7", name: "MoveEasy Packers", email: "moveeasy@in.com", phone: "+91 9800007777", service: "shifting", zone: "Dhone", totalOrders: 97, revenue: 310400, rating: 4.3, status: "active", verificationStatus: "verified", joinedAt: "2024-02-28T00:00:00Z", documents: [], commissionRate: 15 },
  { id: "v8", name: "Greenfield Tutors", email: "green@tutor.in", phone: "+91 9800008888", service: "tuition", zone: "Nandyal", totalOrders: 156, revenue: 234000, rating: 4.6, status: "active", verificationStatus: "verified", joinedAt: "2024-04-01T00:00:00Z", documents: [], commissionRate: 15 },
  { id: "v9", name: "Palm Beach Resort", email: "palm@resort.in", phone: "+91 9800009999", service: "resort", zone: "Kurnool", totalOrders: 22, revenue: 330000, rating: 4.9, status: "inactive", verificationStatus: "pending", joinedAt: "2024-05-10T00:00:00Z", documents: [], commissionRate: 10 },
];

export const users: User[] = [
  { id: "u1", name: "Ravi Kumar", email: "ravi@gmail.com", phone: "+91 9876543210", zone: "Dhone", totalOrders: 28, totalSpent: 14820, status: "active", joinedAt: "2024-01-10T00:00:00Z", lastActive: new Date(Date.now() - 2 * 60000).toISOString(), referralCode: "RAVI10", walletBalance: 240 },
  { id: "u2", name: "Priya Sharma", email: "priya@gmail.com", phone: "+91 9876543211", zone: "Kurnool", totalOrders: 42, totalSpent: 22400, status: "active", joinedAt: "2024-01-15T00:00:00Z", lastActive: new Date(Date.now() - 5 * 60000).toISOString(), referralCode: "PRIYA42", walletBalance: 120 },
  { id: "u3", name: "Suresh Babu", email: "suresh@gmail.com", phone: "+91 9876543212", zone: "Dhone", totalOrders: 15, totalSpent: 8640, status: "idle", joinedAt: "2024-02-20T00:00:00Z", lastActive: new Date(Date.now() - 60 * 60000).toISOString(), referralCode: "SURES15", walletBalance: 0 },
  { id: "u4", name: "Lakshmi Devi", email: "lakshmi@gmail.com", phone: "+91 9876543213", zone: "Nandyal", totalOrders: 9, totalSpent: 3210, status: "idle", joinedAt: "2024-03-05T00:00:00Z", lastActive: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(), referralCode: "LAKSH9", walletBalance: 50 },
  { id: "u5", name: "Anil Reddy", email: "anil@gmail.com", phone: "+91 9876543214", zone: "Hyderabad", totalOrders: 34, totalSpent: 18920, status: "active", joinedAt: "2024-01-25T00:00:00Z", lastActive: new Date(Date.now() - 30 * 60000).toISOString(), referralCode: "ANILR34", walletBalance: 380 },
  { id: "u6", name: "Kavya Mada", email: "kavya@gmail.com", phone: "+91 9876543215", zone: "Kurnool", totalOrders: 7, totalSpent: 12400, status: "active", joinedAt: "2024-04-10T00:00:00Z", lastActive: new Date(Date.now() - 10 * 60000).toISOString(), referralCode: "KAVYA7", walletBalance: 0 },
];

export const transactions: Transaction[] = [
  { id: "TXN-982847", orderId: "ZL-8842", customerName: "Ravi Kumar", amount: 485, commission: 73, paymentMethod: "UPI", status: "success", createdAt: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: "TXN-982846", orderId: "ZL-8841", customerName: "Priya Sharma", amount: 220, commission: 33, paymentMethod: "Card", status: "processing", createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: "TXN-982845", orderId: "ZL-8840", customerName: "Suresh Babu", amount: 1240, commission: 186, paymentMethod: "Cash", status: "success", createdAt: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: "TXN-982844", orderId: "ZL-8838", customerName: "Anil Reddy", amount: 180, commission: 0, paymentMethod: "UPI", status: "refunded", createdAt: new Date(Date.now() - 22 * 60000).toISOString() },
  { id: "TXN-982843", orderId: "ZL-8837", customerName: "Kavya Mada", amount: 8500, commission: 1275, paymentMethod: "Card", status: "success", createdAt: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: "TXN-982842", orderId: "ZL-8836", customerName: "Rajesh Teja", amount: 3200, commission: 480, paymentMethod: "UPI", status: "processing", createdAt: new Date(Date.now() - 90 * 60000).toISOString() },
];

export const rides: Ride[] = [
  { id: "R-4821", passenger: "Priya Sharma", driver: "Suresh Driver", driverPhone: "+91 9812341234", rideType: "car", from: "Bus Stand", to: "Civil Hospital", fare: 120, distance: 4.2, status: "on_trip", startTime: new Date(Date.now() - 10 * 60000).toISOString(), zone: "Dhone" },
  { id: "R-4820", passenger: "Ravi Kumar", driver: "Mohan Auto", driverPhone: "+91 9812345678", rideType: "auto", from: "Market Area", to: "Railway Station", fare: 60, distance: 2.1, status: "on_trip", startTime: new Date(Date.now() - 8 * 60000).toISOString(), zone: "Kurnool" },
  { id: "R-4819", passenger: "Anil Reddy", driver: "Kiran Bike", driverPhone: "+91 9812349999", rideType: "bike", from: "Home Colony", to: "Office Area", fare: 45, distance: 3.5, status: "completed", startTime: new Date(Date.now() - 25 * 60000).toISOString(), endTime: new Date(Date.now() - 10 * 60000).toISOString(), zone: "Dhone" },
  { id: "R-4818", passenger: "Lakshmi Devi", driver: "Raju Auto", driverPhone: "+91 9812340000", rideType: "auto", from: "Temple Road", to: "Hospital", fare: 80, distance: 3.0, status: "completed", startTime: new Date(Date.now() - 45 * 60000).toISOString(), endTime: new Date(Date.now() - 20 * 60000).toISOString(), zone: "Nandyal" },
];

export const serviceCategories: ServiceCategory[] = [
  { id: "s1", name: "Food & Beverages", slug: "food", emoji: "🍔", vendorCount: 84, orderCount: 4200, revenue: 1890000, isActive: true, commission: 15 },
  { id: "s2", name: "Vegetables & Grocery", slug: "grocery", emoji: "🥦", vendorCount: 32, orderCount: 2800, revenue: 2240000, isActive: true, commission: 12 },
  { id: "s3", name: "Rides (Car/Auto/Bike)", slug: "rides", emoji: "🚗", vendorCount: 156, orderCount: 3800, revenue: 836000, isActive: true, commission: 18 },
  { id: "s4", name: "Home Services", slug: "home", emoji: "🔧", vendorCount: 48, orderCount: 1200, revenue: 600000, isActive: true, commission: 20 },
  { id: "s5", name: "House Shifting", slug: "shifting", emoji: "🚛", vendorCount: 12, orderCount: 320, revenue: 1024000, isActive: true, commission: 15 },
  { id: "s6", name: "Parcel (Local)", slug: "parcel", emoji: "📦", vendorCount: 28, orderCount: 950, revenue: 171000, isActive: true, commission: 15 },
  { id: "s7", name: "Tuition Point", slug: "tuition", emoji: "🎓", vendorCount: 67, orderCount: 780, revenue: 1170000, isActive: true, commission: 15 },
  { id: "s8", name: "Hotel & Function Halls", slug: "hotel", emoji: "🏨", vendorCount: 18, orderCount: 490, revenue: 4165000, isActive: true, commission: 12 },
  { id: "s9", name: "Resorts & Tourist", slug: "resort", emoji: "🏖️", vendorCount: 9, orderCount: 0, revenue: 0, isActive: false, commission: 10 },
];

export const coupons: Coupon[] = [
  { id: "c1", code: "EAT40", title: "40% OFF on Food", description: "On Restaurants", discountType: "percentage", discountValue: 40, minOrderValue: 200, maxDiscount: 150, usageLimit: 2000, usedCount: 1284, applicableServices: ["food"], isActive: true, expiresAt: "2026-05-31T23:59:59Z", createdAt: "2026-05-01T00:00:00Z" },
  { id: "c2", code: "GROC100", title: "₹100 OFF on Grocery", description: "On Grocery Orders above ₹499", discountType: "flat", discountValue: 100, minOrderValue: 499, usageLimit: 1500, usedCount: 892, applicableServices: ["grocery"], isActive: true, expiresAt: "2026-05-28T23:59:59Z", createdAt: "2026-05-01T00:00:00Z" },
  { id: "c3", code: "RIDE50", title: "₹50 OFF on Rides", description: "On Ride Bookings", discountType: "flat", discountValue: 50, minOrderValue: 100, usageLimit: 5000, usedCount: 2100, applicableServices: ["rides"], isActive: true, expiresAt: "2026-06-15T23:59:59Z", createdAt: "2026-05-01T00:00:00Z" },
  { id: "c4", code: "RESORT30", title: "Up to 30% OFF Resorts", description: "On Resort Bookings", discountType: "percentage", discountValue: 30, minOrderValue: 2000, maxDiscount: 1000, usageLimit: 200, usedCount: 48, applicableServices: ["resort"], isActive: false, expiresAt: "2026-06-30T23:59:59Z", createdAt: "2026-05-05T00:00:00Z" },
];

export const ordersChartData: ChartDataPoint[] = [
  { label: "Food", value: 4200 },
  { label: "Rides", value: 3800 },
  { label: "Grocery", value: 2800 },
  { label: "Home", value: 1200 },
  { label: "Parcel", value: 950 },
  { label: "Hotel", value: 490 },
];

export const revenueChartData: ChartDataPoint[] = [
  { label: "Mon", value: 280000 },
  { label: "Tue", value: 320000 },
  { label: "Wed", value: 290000 },
  { label: "Thu", value: 380000 },
  { label: "Fri", value: 420000 },
  { label: "Sat", value: 510000 },
  { label: "Sun", value: 380000 },
];

export const monthlyRevenueData: ChartDataPoint[] = [
  { label: "Jan", value: 2800000 },
  { label: "Feb", value: 3200000 },
  { label: "Mar", value: 4100000 },
  { label: "Apr", value: 3800000 },
  { label: "May", value: 4520000 },
];

export const userGrowthData: ChartDataPoint[] = [
  { label: "Jan", value: 12000 },
  { label: "Feb", value: 18000 },
  { label: "Mar", value: 24000 },
  { label: "Apr", value: 36000 },
  { label: "May", value: 48392 },
];

export const zoneOrderData: ChartDataPoint[] = [
  { label: "Dhone", value: 384 },
  { label: "Kurnool", value: 298 },
  { label: "Hyderabad", value: 212 },
  { label: "Nandyal", value: 174 },
  { label: "Atmakur", value: 98 },
];

export const statusPieData = [
  { name: "Delivered", value: 68, color: "#10B981" },
  { name: "In Progress", value: 15, color: "#3B82F6" },
  { name: "Pending", value: 12, color: "#F59E0B" },
  { name: "Cancelled", value: 5, color: "#EF4444" },
];
