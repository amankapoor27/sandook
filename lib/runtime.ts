export function isCloudflareWorkers(): boolean {
  if (process.env.SANDOOK_RUNTIME === "cloudflare") {
    return true;
  }

  return (
    typeof (globalThis as { WebSocketPair?: unknown }).WebSocketPair ===
    "function"
  );
}
