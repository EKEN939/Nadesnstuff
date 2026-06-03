import { Redis } from "@upstash/redis";
import { LINEUPS as SEED } from "@/data/lineups";

// Stoder bade Vercel KV-namnen och Upstash egna namn.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "lineups";

export const storeConfigured = Boolean(url && token);
const redis = storeConfigured ? new Redis({ url, token }) : null;

export async function readLineups() {
  if (!redis) return SEED;
  try {
    const data = await redis.get(KEY);
    return Array.isArray(data) ? data : SEED;
  } catch {
    return SEED;
  }
}

export async function writeLineups(lineups) {
  if (!redis) throw new Error("Storage not configured");
  await redis.set(KEY, lineups);
  return true;
}
