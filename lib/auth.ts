import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import {
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_SESSION_SECRET,
} from "./env-defaults";

const COOKIE_NAME = "sandook_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function readAdminPassword(): string {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value || DEFAULT_ADMIN_PASSWORD;
}

function readSessionSecret(): string {
  const value = process.env.SESSION_SECRET?.trim();
  if (value && value.length >= 32) return value;
  return DEFAULT_SESSION_SECRET;
}

function getSecretKey() {
  return new TextEncoder().encode(readSessionSecret());
}

export function sessionCookieOptions(request: Request): Partial<ResponseCookie> {
  const { hostname, protocol } = new URL(request.url);
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local");

  return {
    httpOnly: true,
    secure: protocol === "https:" && !isLocalHost,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<boolean> {
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

export async function setSessionCookie(
  token: string,
  request?: Request,
) {
  const cookieStore = await cookies();
  cookieStore.set(
    COOKIE_NAME,
    token,
    request
      ? sessionCookieOptions(request)
      : {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          path: "/",
          maxAge: SESSION_MAX_AGE_SECONDS,
        },
  );
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export function readAdminPasswordForLogin(): string {
  return readAdminPassword();
}

export { COOKIE_NAME, DEFAULT_ADMIN_PASSWORD as DEFAULT_PASSWORD };
