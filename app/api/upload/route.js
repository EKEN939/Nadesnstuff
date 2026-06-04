import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Token-protected client uploads to Vercel Blob.
// The client passes the admin token as clientPayload; we verify it before
// handing out an upload token. Needs BLOB_READ_WRITE_TOKEN (set automatically
// when you add a Blob store in Vercel) and ADMIN_TOKEN.
export async function POST(req) {
  const body = await req.json();
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!process.env.ADMIN_TOKEN || clientPayload !== process.env.ADMIN_TOKEN) {
          throw new Error("Unauthorized");
        }
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
