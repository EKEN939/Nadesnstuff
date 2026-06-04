import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// Client uploads to Vercel Blob. Authorized either by a logged-in admin
// (Discord id in ADMIN_DISCORD_IDS) or by the ADMIN_TOKEN sent as clientPayload.
// Needs BLOB_READ_WRITE_TOKEN (set automatically when you add a Blob store in Vercel).
export async function POST(req) {
  let session = null;
  try { session = await auth(); } catch {}
  const adminIds = (process.env.ADMIN_DISCORD_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const sessionAdmin = !!(session?.user?.id && adminIds.includes(session.user.id));

  const body = await req.json();
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const tokenOk = process.env.ADMIN_TOKEN && clientPayload === process.env.ADMIN_TOKEN;
        if (!sessionAdmin && !tokenOk) throw new Error("Unauthorized — log in as admin or set the admin token");
        return {
          allowedContentTypes: [
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "video/mp4", "video/webm", "video/quicktime",
          ],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 400 });
  }
}
