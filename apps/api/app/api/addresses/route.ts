import { NextRequest, NextResponse } from "next/server";
import { supabaseForUser } from "@/lib/supabase";
import { getAuthedUser } from "@/lib/auth";
import { z } from "zod";

// GET /api/addresses — the caller's own saved addresses.
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseForUser(user.accessToken);
  const { data, error } = await db.from("addresses").select("*").order("is_default", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ addresses: data });
}

const schema = z.object({
  label: z.string().default("Home"),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  pincode: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  is_default: z.boolean().optional(),
});

// POST /api/addresses — save a new delivery address for the caller.
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const db = supabaseForUser(user.accessToken);
  const { data, error } = await db.from("addresses").insert({ ...parsed.data, user_id: user.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ address: data }, { status: 201 });
}
