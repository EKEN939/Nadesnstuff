import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// Server-side upload to Vercel Blob. The browser POSTs the file as multipart/form-data;
// we authorize (Discord admin or ADMIN_TOKEN) and store it with put().
// Uses BLOB_READ_WRITE_TOKEN (or OIDC) automatically.
export async function POST(req) {
  let session = null;
  try { session = await auth(); } catch {}
  const adminIds = (process.env.ADMIN_DISCORD_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const sessionAdmin = !!(session?.user?.id && adminIds.includes(session.user.id));
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const tokenOk = process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
  if (!sessionAdmin && !tokenOk) {
    return NextResponse.json({ error: "Unauthorized — log in as admin" }, { status: 401 });
  }

  let file;
  try {
    const form = await req.formData();
    file = form.get("file");
  } catch {
    return NextResponse.json({ error: "Could not read file" }, { status: 400 });
  }
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  try {
    const blob = await put(file.name || "upload", file, { access: "public", addRandomSuffix: true });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 400 });
  }
}
