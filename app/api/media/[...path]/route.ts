import { NextResponse } from "next/server";
import {
  contentTypeForMediaKey,
  resolvePublicMediaKey,
} from "@/lib/media-access";
import { getObject } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const key = resolvePublicMediaKey(segments);

  if (!key) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = await getObject(key);

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": contentTypeForMediaKey(key),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
