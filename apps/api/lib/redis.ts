import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

/** Lazily-constructed Upstash Redis REST client (safe under `next build`). */
export function redis(): Redis {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set");
  }
  _redis = new Redis({ url, token });
  return _redis;
}

const DEFAULT_TTL_SECONDS = 60;

/** Cache-aside helper: serve from Redis if present, else compute + store. */
export async function cached<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  const r = redis();
  const hit = await r.get<T>(key);
  if (hit !== null && hit !== undefined) return hit;
  const value = await fn();
  await r.set(key, value, { ex: ttlSeconds || DEFAULT_TTL_SECONDS });
  return value;
}

export async function invalidate(...keys: string[]) {
  if (keys.length) await redis().del(...keys);
}
