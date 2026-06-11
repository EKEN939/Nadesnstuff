import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { readUser, writeUser, storeConfigured } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  let session = null;
  try { session = await auth(); } catch {}
  if (!session?.user?.id) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const adminIds = (process.env.ADMIN_DISCORD_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const data = await readUser(session.user.id);
  return NextResponse.json({
    favs: data?.favs || [], learned: data?.learned || [], collections: data?.collections || [],
    admin: adminIds.includes(session.user.id),
  });
}

export async function PUT(req) {
  let session = null;
  try { session = await auth(); } catch {}
  if (!session?.user?.id) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!storeConfigured) return NextResponse.json({ error: "not configured" }, { status: 503 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  // sanitize + cap: ids are short scalars, collections have a strict shape
  const capIds = (a) => (Array.isArray(a) ? a.slice(0, 2000).map(String).filter((s) => s.length <= 40) : []);
  const collections = (Array.isArray(body?.collections) ? body.collections : [])
    .slice(0, 100)
    .filter((c) => c && typeof c === "object")
    .map((c) => ({
      id: String(c.id || "").slice(0, 40),
      name: String(c.name || "").slice(0, 80),
      items: capIds(c.items),
    }))
    .filter((c) => c.id);
  await writeUser(session.user.id, {
    favs: capIds(body?.favs),
    learned: capIds(body?.learned),
    collections,
  });
  return NextResponse.json({ ok: true });
}
