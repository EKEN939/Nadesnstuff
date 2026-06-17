import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/ratelimit";

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
  if (!(await rateLimit("upload", session?.user?.id || "token", 30))) {
    return NextResponse.json({ error: "Too many uploads — wait a minute" }, { status: 429 });
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
  // only media files, with sane size caps (images 10MB, video 100MB)
  const type = file.type || "";
  const isImage = type.startsWith("image/");
  const isVideo = type.startsWith("video/");
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "Only image or video files are allowed" }, { status: 415 });
  }
  const max = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
  if (typeof file.size === "number" && file.size > max) {
    return NextResponse.json({ error: `File too large (max ${isVideo ? "100" : "10"} MB)` }, { status: 413 });
  }
  try {
    const blob = await put(file.name || "upload", file, { access: "public", addRandomSuffix: true });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 400 });
  }
}
