export async function readApiError(
  response: Response,
  fallback = "Request failed",
): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const data = (await response.json()) as { error?: string };
      return data.error ?? fallback;
    } catch {
      return fallback;
    }
  }

  const text = (await response.text()).trim();
  if (text.startsWith("<")) {
    return `${fallback} (server error ${response.status})`;
  }
  if (text.startsWith("error code:")) {
    return `${fallback} (${text})`;
  }

  return text.slice(0, 200) || fallback;
}
