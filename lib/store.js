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

// --- watch-together rooms (ephemeral, 1h TTL) ---
export async function readRoom(code) {
  if (!redis) return null;
  try { return await redis.get("room:" + code); } catch { return null; }
}
export async function writeRoom(code, state) {
  if (!redis) throw new Error("Storage not configured");
  await redis.set("room:" + code, state, { ex: 3600 });
  return true;
}
