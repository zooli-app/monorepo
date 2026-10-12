import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cached } from "@/lib/redis";

// Public, low-churn data — cache for 5 minutes.
export async function GET() {
  try {
    const categories = await cached("categories:all", 300, async () => {
      const { data, error } = await supabaseAdmin()
        .from("categories")
        .select("id, name, slug, parent_id, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data;
    });
    return NextResponse.json({ categories });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
