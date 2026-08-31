import { timingSafeEqual } from "crypto";

function safeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifyPasswordCandidate(
  password: string,
  expected: string,
): boolean {
  return safeEqualString(password, expected);
}
