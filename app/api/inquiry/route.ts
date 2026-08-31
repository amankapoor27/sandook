import { NextResponse } from "next/server";
import { z } from "zod";
import { saveInquiry } from "@/lib/inquiry";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";

const INQUIRY_LIMIT = 10;
const INQUIRY_WINDOW_MS = 60 * 60 * 1000;

const inquirySchema = z.object({
  type: z.enum(["general", "purchase", "commission"]),
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Valid email is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(5000),
  artworkSlug: z.string().trim().max(120).optional(),
  artworkTitle: z.string().trim().max(200).optional(),
  _sandook_hp: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`inquiry:${ip}`, INQUIRY_LIMIT, INQUIRY_WINDOW_MS);
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { _sandook_hp, ...inquiryInput } = parsed.data;
  if (_sandook_hp?.trim()) {
    return NextResponse.json({ ok: true, id: "ok" });
  }

  const inquiry = await saveInquiry(inquiryInput);
  return NextResponse.json({ ok: true, id: inquiry.id });
}
