import { Redis } from "@upstash/redis";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

/**
 * Fixed-window rate limit. Returns true if the call is allowed.
 * Fails open if storage is unavailable (we never want limits to take the site down).
 */
export async function rateLimit(bucket, id, max, windowSeconds = 60) {
  if (!redis) return true;
  try {
    const key = `rl:${bucket}:${id}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds + 5);
    return count <= max;
  } catch {
    return true;
  }
}
