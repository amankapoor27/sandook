import "server-only";

import { headers } from "next/headers";
import { parseReferrerSource } from "./analytics-utils";

export async function readPageReferrerSource(): Promise<string> {
  const headerStore = await headers();
  const referer = headerStore.get("referer");
  const host =
    headerStore.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headerStore.get("host") ||
    "localhost";

  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  const siteOrigin = `${protocol}://${host}`;

  return parseReferrerSource(referer, new URL(siteOrigin).hostname);
}
