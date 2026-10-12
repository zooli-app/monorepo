import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cached } from "@/lib/redis";

// GET /api/stores?category=grocery — list open stores, optionally by category.
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? "grocery";
  try {
    const stores = await cached(`stores:${category}`, 60, async () => {
      const { data, error } = await supabaseAdmin()
        .from("stores")
        .select("id, name, category, address, lat, lng, is_open, logo_url")
        .eq("category", category)
        .eq("is_open", true);
      if (error) throw error;
      return data;
    });
    return NextResponse.json({ stores });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
