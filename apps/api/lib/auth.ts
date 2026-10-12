import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "./supabase";

export type Role = "customer" | "vendor" | "admin" | "driver";

export interface AuthedUser {
  id: string;
  role: Role;
  storeId: string | null; // set for vendor role
  accessToken: string;
}

/**
 * Verifies the `Authorization: Bearer <supabase-jwt>` header and loads the
 * caller's profile/role. Returns null if missing/invalid so callers can
 * respond with 401.
 */
export async function getAuthedUser(req: NextRequest): Promise<AuthedUser | null> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .select("role, store_id")
    .eq("id", data.user.id)
    .single();
  if (profileErr || !profile) return null;

  return {
    id: data.user.id,
    role: profile.role as Role,
    storeId: profile.store_id ?? null,
    accessToken: token,
  };
}

export function requireRole(user: AuthedUser | null, ...allowed: Role[]) {
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!allowed.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null; // null == authorized, caller proceeds
}
