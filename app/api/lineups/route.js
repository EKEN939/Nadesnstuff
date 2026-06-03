import { NextResponse } from "next/server";
import { readLineups, writeLineups, storeConfigured } from "@/lib/store";

export const dynamic = "force-dynamic";

// Publik lasning - sajten hamtar alla lineups harifran.
export async function GET() {
  const lineups = await readLineups();
  return NextResponse.json({ lineups, configured: storeConfigured });
}

// Skyddad skrivning - kraver ADMIN_TOKEN. Sparar hela listan.
export async function PUT(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
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
