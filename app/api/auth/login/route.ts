import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createSessionToken,
  readAdminPasswordForLogin,
  sessionCookieOptions,
} from "@/lib/auth";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { verifyPasswordCandidate } from "@/lib/password";

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  try {
    const body = (await request.json()) as { password?: string };

    if (
      !body.password ||
      !verifyPasswordCandidate(body.password, readAdminPasswordForLogin())
    ) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, sessionCookieOptions(request));
    return response;
  } catch (error) {
    console.error("Admin login failed:", error);
    return NextResponse.json(
      { error: "Login failed. Check server env configuration." },
      { status: 500 },
    );
  }
}
