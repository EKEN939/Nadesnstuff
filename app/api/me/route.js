import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { readUser, writeUser, storeConfigured } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  let session = null;
  try { session = await auth(); } catch {}
  if (!session?.user?.id) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const data = await readUser(session.user.id);
  return NextResponse.json({ favs: data?.favs || [], learned: data?.learned || [], collections: data?.collections || [], executes: data?.executes || [] });
}

export async function PUT(req) {
  let session = null;
  try { session = await auth(); } catch {}
  if (!session?.user?.id) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!storeConfigured) return NextResponse.json({ error: "not configured" }, { status: 503 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  await writeUser(session.user.id, {
    favs: Array.isArray(body?.favs) ? body.favs : [],
    learned: Array.isArray(body?.learned) ? body.learned : [],
    collections: Array.isArray(body?.collections) ? body.collections : [],
    executes: Array.isArray(body?.executes) ? body.executes : [],
  });
  return NextResponse.json({ ok: true });
}
