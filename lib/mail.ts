import "server-only";

import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { Inquiry } from "./types";

export type InquiryEmailContent = {
  subject: string;
  text: string;
};

function readEnv(name: string): string {
  const raw = process.env[name];
  if (!raw) return "";
  let value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

export function getInquiryRecipient(): string | undefined {
  const value = readEnv("INQUIRY_EMAIL") || readEnv("CONTACT_EMAIL");
  return value || undefined;
}

export function buildInquiryEmailContent(inquiry: Inquiry): InquiryEmailContent {
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

  return { subject, text: lines.join("\n") };
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    readEnv("SMTP_USER") && readEnv("SMTP_PASS") && getInquiryRecipient(),
  );
}

export function isResendConfigured(): boolean {
  return Boolean(readEnv("RESEND_API_KEY") && getInquiryRecipient());
}

function getSmtpUser(): string {
  return readEnv("SMTP_USER");
}

function getSmtpPass(): string {
  return readEnv("SMTP_PASS").replace(/\s/g, "");
}

function getSmtpFromAddress(): string {
  const user = getSmtpUser();
  const configured = readEnv("SMTP_FROM");

  if (configured) {
    if (configured.includes("<") && configured.includes(">")) {
      return configured;
    }
    return `${configured} <${user}>`;
  }

  return `Sandook Studio <${user}>`;
}

function createSmtpTransporter() {
  const user = getSmtpUser();
  const pass = getSmtpPass();
  const host = readEnv("SMTP_HOST") || "smtp.gmail.com";
  const port = Number(readEnv("SMTP_PORT") || "587");
  const secure =
    readEnv("SMTP_SECURE") === "true" || port === 465;

  const timeouts = {
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  };

  if (host.includes("gmail.com")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      ...timeouts,
    } satisfies SMTPTransport.Options);
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
    ...timeouts,
  } satisfies SMTPTransport.Options);
}

export async function sendInquiryViaSmtp(
  inquiry: Inquiry,
  content: InquiryEmailContent,
): Promise<void> {
  const to = getInquiryRecipient();
  if (!to) throw new Error("INQUIRY_EMAIL is not configured");

  const transporter = createSmtpTransporter();

  await transporter.sendMail({
    from: getSmtpFromAddress(),
    to,
    replyTo: inquiry.email,
    subject: content.subject,
    text: content.text,
  });
}

export async function sendInquiryViaResend(
  inquiry: Inquiry,
  content: InquiryEmailContent,
): Promise<void> {
  const apiKey = readEnv("RESEND_API_KEY");
  const to = getInquiryRecipient();
  if (!apiKey || !to) throw new Error("Resend is not configured");

  const from =
    readEnv("RESEND_FROM") || `Sandook Studio <onboarding@resend.dev>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: inquiry.email,
      subject: content.subject,
      text: content.text,
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(body.message ?? "Resend request failed");
  }
}

export async function sendInquiryNotification(
  inquiry: Inquiry,
): Promise<"smtp" | "resend" | "none"> {
  const content = buildInquiryEmailContent(inquiry);
  const errors: string[] = [];

  if (isSmtpConfigured()) {
    try {
      await sendInquiryViaSmtp(inquiry, content);
      return "smtp";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown SMTP error";
      errors.push(`SMTP: ${message}`);
      console.error("Inquiry SMTP failed:", error);
    }
  }

  if (isResendConfigured()) {
    try {
      await sendInquiryViaResend(inquiry, content);
      return "resend";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Resend error";
      errors.push(`Resend: ${message}`);
      console.error("Inquiry Resend failed:", error);
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  console.warn(
    "Inquiry saved but no email sent — configure SMTP or Resend in .env.local",
  );
  return "none";
}
