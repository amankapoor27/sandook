import fs from "fs/promises";
import path from "path";
import type { Inquiry, InquiryType } from "./types";
import { getObject, putObject } from "./storage";
import { isR2Configured } from "./env";
import { siteConfig } from "./site";

const INQUIRIES_KEY = "inquiries.json";
const LOCAL_INQUIRIES = path.join(process.cwd(), "storage", "inquiries.json");

export type InquiryInput = {
  type: InquiryType;
  name: string;
  email: string;
  message: string;
  artworkSlug?: string;
  artworkTitle?: string;
};

async function readInquiries(): Promise<Inquiry[]> {
  const stored = await getObject(INQUIRIES_KEY);
  if (stored) {
    return JSON.parse(stored.toString("utf-8")) as Inquiry[];
  }

  if (!isR2Configured()) {
    try {
      const raw = await fs.readFile(LOCAL_INQUIRIES, "utf-8");
      return JSON.parse(raw) as Inquiry[];
    } catch {
      return [];
    }
  }

  return [];
}

async function writeInquiries(inquiries: Inquiry[]): Promise<void> {
  const body = Buffer.from(JSON.stringify(inquiries, null, 2), "utf-8");
  await putObject(INQUIRIES_KEY, body, "application/json");

  if (!isR2Configured()) {
    await fs.mkdir(path.dirname(LOCAL_INQUIRIES), { recursive: true });
    await fs.writeFile(LOCAL_INQUIRIES, body);
  }
}

function createInquiryId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

async function sendInquiryEmail(inquiry: Inquiry): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_EMAIL ?? process.env.CONTACT_EMAIL;

  if (!apiKey || !to) return;

  const subject =
    inquiry.type === "purchase"
      ? `Purchase inquiry: ${inquiry.artworkTitle ?? inquiry.artworkSlug ?? "Artwork"}`
      : inquiry.type === "commission"
        ? "Commission inquiry"
        : "Contact form message";

  const lines = [
    `Type: ${inquiry.type}`,
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    inquiry.artworkTitle ? `Artwork: ${inquiry.artworkTitle}` : null,
    inquiry.artworkSlug ? `Slug: ${inquiry.artworkSlug}` : null,
    "",
    inquiry.message,
  ].filter(Boolean);

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Sandook Studio <onboarding@resend.dev>`,
      to: [to],
      reply_to: inquiry.email,
      subject,
      text: lines.join("\n"),
    }),
  });
}

export async function saveInquiry(input: InquiryInput): Promise<Inquiry> {
  const inquiries = await readInquiries();

  const inquiry: Inquiry = {
    id: createInquiryId(),
    type: input.type,
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
    artworkSlug: input.artworkSlug,
    artworkTitle: input.artworkTitle,
    createdAt: new Date().toISOString(),
  };

  inquiries.unshift(inquiry);
  await writeInquiries(inquiries);

  try {
    await sendInquiryEmail(inquiry);
  } catch {
    // email is optional — inquiry is still saved
  }

  return inquiry;
}

export function getInquiryReplyTo(): string {
  return process.env.INQUIRY_EMAIL ?? process.env.CONTACT_EMAIL ?? siteConfig.email;
}
