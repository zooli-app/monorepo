import { NextRequest } from "next/server";
import { redis } from "./redis";

/** Best-effort client IP (Vercel / proxies set x-forwarded-for). */
export function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff ? xff.split(",")[0].trim() : req.headers.get("x-real-ip")) || "unknown";
}

// Per-instance fallback so a Redis outage degrades to "limited per server instance"
// instead of "no limit at all". (Serverless instances don't share memory, so this is
// weaker than Redis, but it still stops a single-instance flood.)
const mem = new Map<string, { n: number; reset: number }>();
function memLimited(key: string, limit: number, windowSeconds: number): boolean {
  const now = Date.now();
  if (mem.size > 5000) for (const [k, v] of mem) if (v.reset < now) mem.delete(k);
  const cur = mem.get(key);
  if (!cur || cur.reset < now) { mem.set(key, { n: 1, reset: now + windowSeconds * 1000 }); return false; }
  cur.n += 1;
  return cur.n > limit;
}

/** Fixed-window limiter. Returns true when the caller is OVER the limit. */
export async function isRateLimited(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    const r = redis();
    const k = `rl:${key}`;
    const n = await r.incr(k);
    if (n === 1) await r.expire(k, windowSeconds);
    return n > limit;
  } catch {
    return memLimited(key, limit, windowSeconds);
  }
}
