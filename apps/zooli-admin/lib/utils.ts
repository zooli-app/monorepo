import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { OrderStatus, PaymentStatus, RideStatus, ServiceType, VerificationStatus, VendorStatus, UserStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  food: "Food & Beverages",
  grocery: "Grocery",
  rides: "Rides",
  home: "Home Services",
  shifting: "House Shifting",
  parcel: "Parcel",
  tuition: "Tuition",
  hotel: "Hotel & Halls",
  resort: "Resorts & Tourist",
};

export const SERVICE_EMOJI: Record<ServiceType, string> = {
  food: "🍔",
  grocery: "🥦",
  rides: "🚗",
  home: "🔧",
  shifting: "🚛",
  parcel: "📦",
  tuition: "🎓",
  hotel: "🏨",
  resort: "🏖️",
};

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  delivered: {
    label: "Delivered",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
};

export const VENDOR_STATUS_CONFIG: Record<
  VendorStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  inactive: {
    label: "Inactive",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  },
  suspended: {
    label: "Suspended",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
};

export const VERIFICATION_STATUS_CONFIG: Record<
  VerificationStatus,
  { label: string; className: string }
> = {
  verified: {
    label: "Verified",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
};

export const USER_STATUS_CONFIG: Record<
  UserStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  idle: {
    label: "Idle",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  },
  blocked: {
    label: "Blocked",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  success: {
    label: "Success",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  processing: {
    label: "Processing",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  refunded: {
    label: "Refunded",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  failed: {
    label: "Failed",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
};

export const RIDE_STATUS_CONFIG: Record<
  RideStatus,
  { label: string; className: string }
> = {
  on_trip: {
    label: "On Trip",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
  assigned: {
    label: "Assigned",
    className: "bg-purple-50 text-purple-700 border border-purple-200",
  },
};

export const ZONES = ["Dhone", "Kurnool", "Nandyal", "Hyderabad", "Atmakur"];
