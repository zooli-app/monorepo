import { supabaseAdmin } from "./supabase";

const CASHBACK_RATE = 0.02; // 2% of order/ride total, credited on completion

/**
 * Credits cashback to a user's wallet — called from order/ride completion,
 * never exposed as a user-triggered endpoint. Idempotency isn't enforced
 * here at the DB level (no unique constraint on `reason`), so callers must
 * only invoke this once per order/ride; both call sites do so from the
 * single status-transition branch that fires exactly once (pending →
 * delivered / → completed can't be re-entered once left, per each route's
 * own transition table).
 */
export async function creditCashback(userId: string, total: number, reason: string) {
  const amount = Math.round(total * CASHBACK_RATE * 100) / 100;
  if (amount <= 0) return;

  const admin = supabaseAdmin();
  const { data: wallet } = await admin
    .from("wallets")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true })
    .select()
    .maybeSingle();

  const current = wallet ?? (await admin.from("wallets").select("*").eq("user_id", userId).single()).data;
  await admin
    .from("wallets")
    .update({
      balance: (current?.balance ?? 0) + amount,
      cashback_total: (current?.cashback_total ?? 0) + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  await admin.from("wallet_transactions").insert({ user_id: userId, amount, reason });
}
