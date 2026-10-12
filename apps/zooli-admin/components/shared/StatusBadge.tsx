import { cn } from "@/lib/utils";
import type {
  OrderStatus, VendorStatus, VerificationStatus, UserStatus, PaymentStatus, RideStatus
} from "@/lib/types";
import {
  ORDER_STATUS_CONFIG, VENDOR_STATUS_CONFIG, VERIFICATION_STATUS_CONFIG,
  USER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, RIDE_STATUS_CONFIG,
} from "@/lib/utils";

type AnyStatus = OrderStatus | VendorStatus | VerificationStatus | UserStatus | PaymentStatus | RideStatus;

interface StatusBadgeProps {
  type: "order" | "vendor" | "verification" | "user" | "payment" | "ride";
  status: AnyStatus;
  className?: string;
}

const CONFIG_MAP = {
  order: ORDER_STATUS_CONFIG,
  vendor: VENDOR_STATUS_CONFIG,
  verification: VERIFICATION_STATUS_CONFIG,
  user: USER_STATUS_CONFIG,
  payment: PAYMENT_STATUS_CONFIG,
  ride: RIDE_STATUS_CONFIG,
};

export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = (CONFIG_MAP[type] as any)[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
