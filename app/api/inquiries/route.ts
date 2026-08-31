import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { listInquiries } from "@/lib/inquiry";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inquiries = await listInquiries();
  return NextResponse.json({ inquiries });
}
