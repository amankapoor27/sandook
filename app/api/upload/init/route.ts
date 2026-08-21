import { NextResponse } from "next/server";
import { getStorageMode } from "@/lib/storage";
import { createImageId } from "@/lib/images";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    contentType?: string;
  };

  const uploadId = createImageId();
  const mode = getStorageMode();

  if (mode === "r2") {
    const contentType = body.contentType ?? "image/jpeg";
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
