"use client";

export type ClientAnalyticsEvent = "inquire_click" | "whatsapp_click";

export function trackAnalyticsEvent(
  event: ClientAnalyticsEvent,
  slug?: string,
): void {
  const body = JSON.stringify({ event, slug });

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon("/api/analytics", blob)) return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}
