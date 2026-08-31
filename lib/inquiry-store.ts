import "server-only";

import fs from "fs/promises";
import path from "path";
import { getObject, putObject } from "./storage";
import { isR2Configured } from "./env";
import type { Inquiry } from "./types";

const INQUIRIES_KEY = "inquiries.json";
const LOCAL_INQUIRIES = path.join(process.cwd(), "storage", "inquiries.json");

function normalizeInquiry(inquiry: Inquiry): Inquiry {
  return {
    ...inquiry,
    archived: inquiry.archived ?? false,
  };
}

function sortInquiries(inquiries: Inquiry[]): Inquiry[] {
  return [...inquiries].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

async function readInquiries(): Promise<Inquiry[]> {
  let raw: Inquiry[] = [];

  const stored = await getObject(INQUIRIES_KEY);
  if (stored) {
    raw = JSON.parse(stored.toString("utf-8")) as Inquiry[];
  } else if (!isR2Configured()) {
    try {
      const file = await fs.readFile(LOCAL_INQUIRIES, "utf-8");
      raw = JSON.parse(file) as Inquiry[];
    } catch {
      raw = [];
    }
  }

  return sortInquiries(raw.map(normalizeInquiry));
}

async function writeInquiries(inquiries: Inquiry[]): Promise<void> {
  const body = Buffer.from(JSON.stringify(inquiries, null, 2), "utf-8");
  await putObject(INQUIRIES_KEY, body, "application/json");

  if (!isR2Configured()) {
    await fs.mkdir(path.dirname(LOCAL_INQUIRIES), { recursive: true });
    await fs.writeFile(LOCAL_INQUIRIES, body);
  }
}

export function createInquiryId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export async function listInquiries(): Promise<Inquiry[]> {
  const inquiries = await readInquiries();
  return inquiries.filter((inquiry) => !inquiry.archived);
}

export async function listArchivedInquiries(): Promise<Inquiry[]> {
  const inquiries = await readInquiries();
  return inquiries
    .filter((inquiry) => inquiry.archived)
    .sort(
      (a, b) =>
        new Date(b.archivedAt ?? b.createdAt).getTime() -
        new Date(a.archivedAt ?? a.createdAt).getTime(),
    );
}

export async function deleteInquiry(id: string): Promise<boolean> {
  const inquiries = await readInquiries();
  const next = inquiries.filter((inquiry) => inquiry.id !== id);
  if (next.length === inquiries.length) return false;
  await writeInquiries(next);
  return true;
}

export async function archiveInquiry(id: string): Promise<boolean> {
  const inquiries = await readInquiries();
  const index = inquiries.findIndex((inquiry) => inquiry.id === id);
  if (index === -1) return false;

  inquiries[index] = {
    ...inquiries[index],
    archived: true,
    archivedAt: new Date().toISOString(),
  };

  await writeInquiries(inquiries);
  return true;
}

export async function appendInquiry(inquiry: Inquiry): Promise<void> {
  const inquiries = await readInquiries();
  inquiries.unshift(normalizeInquiry({ ...inquiry, archived: false }));
  await writeInquiries(inquiries);
}
