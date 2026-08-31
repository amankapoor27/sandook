import { NextResponse } from "next/server";
import { getStorageMode } from "@/lib/storage";
import { ALLOWED_MIME_TYPES } from "@/lib/constants";
import { createImageId } from "@/lib/images";

const ALLOWED_UPLOAD_TYPES = new Set<string>(ALLOWED_MIME_TYPES);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    contentType?: string;
  };

  const uploadId = createImageId();
  const mode = getStorageMode();

  if (mode === "r2") {
    const contentType = body.contentType ?? "image/jpeg";
    if (!ALLOWED_UPLOAD_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 },
      );
    }
    const tempKey = `uploads/${uploadId}/original`;

    const { createPresignedUploadUrl } = await import("@/lib/storage");
    const presignedUrl = await createPresignedUploadUrl(tempKey, contentType);

    return NextResponse.json({
      mode: "r2",
      uploadId,
      tempKey,
      presignedUrl,
    });
  }

  return NextResponse.json({
    mode: "local",
    uploadId,
  });
}
