import { NextResponse } from "next/server";
import { readRoom, writeRoom, storeConfigured } from "@/lib/store";

export const dynamic = "force-dynamic";

// Shared watch-together state for a room. No auth (low stakes); anyone with the
// code can host their own room. Needs Upstash configured for sync to work.
export async function GET(req) {
  const code = new URL(req.url).searchParams.get("room");
  if (!code) return NextResponse.json({ error: "no room" }, { status: 400 });
  const state = await readRoom(code);
  return NextResponse.json({ state, configured: storeConfigured });
}

export async function POST(req) {
  if (!storeConfigured) return NextResponse.json({ error: "not configured" }, { status: 503 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const { room, state } = body || {};
  if (!room || !state) return NextResponse.json({ error: "missing" }, { status: 400 });
  await writeRoom(room, state);
  return NextResponse.json({ ok: true });
}
