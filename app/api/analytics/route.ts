import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import {
  artworkSlugExists,
  getAnalyticsReport,
  recordInquireClick,
  recordWhatsAppClick,
} from "@/lib/analytics";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";

const ANALYTICS_LIMIT = 60;
const ANALYTICS_WINDOW_MS = 60 * 60 * 1000;

const eventSchema = z.object({
  event: z.enum(["inquire_click", "whatsapp_click"]),
  slug: z.string().trim().max(120).optional(),
});

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await getAnalyticsReport();
  return NextResponse.json({ report });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(
    `analytics:${ip}`,
    ANALYTICS_LIMIT,
    ANALYTICS_WINDOW_MS,
  );
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const { event, slug } = parsed.data;

  if (event === "whatsapp_click" && !slug) {
    await recordWhatsAppClick();
    return NextResponse.json({ ok: true });
  }

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  if (!(await artworkSlugExists(slug))) {
    return NextResponse.json({ error: "Unknown artwork" }, { status: 404 });
  }

  if (event === "inquire_click") {
    await recordInquireClick(slug);
  } else {
    await recordWhatsAppClick(slug);
  }

  return NextResponse.json({ ok: true });
}
