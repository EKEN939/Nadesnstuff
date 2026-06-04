import { NextResponse } from "next/server";
import { readLineups, writeLineups, storeConfigured } from "@/lib/store";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// Publik lasning - sajten hamtar alla lineups harifran.
export async function GET() {
  const lineups = await readLineups();
  return NextResponse.json({ lineups, configured: storeConfigured });
}

// Skyddad skrivning - kraver ADMIN_TOKEN eller en admin Discord-inloggning.
export async function PUT(req) {
  const header = req.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  const session = await auth();
  const adminIds = (process.env.ADMIN_DISCORD_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const sessionAdmin = session?.user?.id && adminIds.includes(session.user.id);
  const tokenOk = process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
  if (!sessionAdmin && !tokenOk) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!storeConfigured) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }
  if (!Array.isArray(body?.lineups)) {
    return NextResponse.json({ error: "lineups must be an array" }, { status: 400 });
  }
  await writeLineups(body.lineups);
  return NextResponse.json({ ok: true, count: body.lineups.length });
}
