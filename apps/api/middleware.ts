import { NextRequest, NextResponse } from "next/server";

// The three frontends (and the Expo dev client) run on different origins
// than this API, so every response needs CORS headers — otherwise the
// browser blocks the fetch before our route handler code ever runs.
// ALLOWED_ORIGINS should list exact production origins once deployed;
// during local dev everything on localhost is allowed for convenience.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "").split(",").filter(Boolean);

function isAllowed(origin: string | null): boolean {
  if (!origin) return true; // same-origin / server-to-server / curl
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (process.env.NODE_ENV !== "production" && /^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowed = isAllowed(origin);

  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: allowed ? 204 : 403 });
    if (allowed && origin) applyCorsHeaders(res, origin);
    return res;
  }

  const res = NextResponse.next();
  if (allowed && origin) applyCorsHeaders(res, origin);
  return res;
}

function applyCorsHeaders(res: NextResponse, origin: string) {
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-apply-session, x-otp-token");
  res.headers.set("Access-Control-Allow-Credentials", "true");
}

export const config = { matcher: "/api/:path*" };
