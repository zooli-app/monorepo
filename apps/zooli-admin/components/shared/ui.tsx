import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700", red: "bg-red-50 text-red-700", amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700", purple: "bg-purple-50 text-purple-700", gray: "bg-gray-100 text-gray-600", cyan: "bg-cyan-50 text-cyan-700",
};

export function Pill({ tone = "gray", children }: { tone?: keyof typeof TONES | string; children: React.ReactNode }) {
  return <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap", TONES[tone] ?? TONES.gray)}>{children}</span>;
}

export const label = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

const ORDER_TONE: Record<string, string> = {
  pending: "amber", confirmed: "blue", preparing: "purple", ready_for_pickup: "purple", out_for_delivery: "cyan", delivered: "green", cancelled: "red",
};
export const OrderPill = ({ status }: { status: string }) => <Pill tone={ORDER_TONE[status] ?? "gray"}>{label(status)}</Pill>;

const PAY_TONE: Record<string, string> = { paid: "green", unpaid: "amber", refunded: "blue", failed: "red" };
export const PayPill = ({ status }: { status: string }) => <Pill tone={PAY_TONE[status] ?? "gray"}>{label(status)}</Pill>;

const RIDE_TONE: Record<string, string> = { requested: "amber", accepted: "blue", arrived: "purple", in_progress: "cyan", completed: "green", cancelled: "red" };
export const RidePill = ({ status }: { status: string }) => <Pill tone={RIDE_TONE[status] ?? "gray"}>{label(status)}</Pill>;

export function Spinner() {
  return <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400"><Loader2 size={16} className="animate-spin" />Loading…</div>;
}

export function ErrorBox({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex gap-3">
      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="font-semibold">Couldn&apos;t load this data</p>
        <p className="mt-0.5 break-words">{error}</p>
        {onRetry && <button onClick={onRetry} className="mt-2 text-xs font-semibold underline">Try again</button>}
      </div>
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      <Inbox size={28} className="text-gray-300 mb-2" />
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {text && <p className="text-xs text-gray-400 mt-1 max-w-sm">{text}</p>}
    </div>
  );
}

export const th = "px-4 py-3 text-left text-[11px] uppercase tracking-wide text-gray-400 font-semibold";
export const td = "px-4 py-3 text-sm text-gray-700";
