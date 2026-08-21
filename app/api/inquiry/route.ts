import { NextResponse } from "next/server";
import { z } from "zod";
import { saveInquiry } from "@/lib/inquiry";

const inquirySchema = z.object({
  type: z.enum(["general", "purchase", "commission"]),
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Valid email is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(5000),
  artworkSlug: z.string().trim().max(120).optional(),
  artworkTitle: z.string().trim().max(200).optional(),
});

export async function POST(request: Request) {
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

  const inquiry = await saveInquiry(parsed.data);
  return NextResponse.json({ ok: true, id: inquiry.id });
}
