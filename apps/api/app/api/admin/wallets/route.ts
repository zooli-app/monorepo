import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthedUser, requireRole } from "@/lib/auth";

// GET /api/admin/wallets — every user's wallet balance, for the admin
// wallet-management overview.
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "admin");
  if (denied) return denied;

  const { data, error } = await supabaseAdmin()
    .from("wallets")
    .select("user_id, balance, cashback_total, updated_at, profiles(full_name, phone)")
    .order("balance", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const totalBalance = (data ?? []).reduce((a, w) => a + Number(w.balance), 0);
  const totalCashback = (data ?? []).reduce((a, w) => a + Number(w.cashback_total), 0);
  return NextResponse.json({ wallets: data, totalBalance, totalCashback });
}
