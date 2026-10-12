import { NextRequest, NextResponse } from "next/server";
import { supabaseForUser } from "@/lib/supabase";
import { getAuthedUser } from "@/lib/auth";

// GET /api/wallet — the caller's own balance + lifetime cashback. RLS
// (wallets_select_own) already restricts this to the caller's row; a user
// with no wallet row yet (never completed an order/ride) just gets zeros.
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseForUser(user.accessToken);
  const { data } = await db.from("wallets").select("balance, cashback_total").eq("user_id", user.id).maybeSingle();
  return NextResponse.json({ balance: data?.balance ?? 0, cashbackTotal: data?.cashback_total ?? 0 });
}
