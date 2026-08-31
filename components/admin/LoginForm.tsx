"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/site/ThemeToggle";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "same-origin",
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Invalid password.");
        setLoading(false);
        return;
      }

      const from = searchParams.get("from");
      router.push(from?.startsWith("/admin") ? from : "/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server. Is the dev server running?");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          autoComplete="current-password"
          required
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted">
          Local dev default password: <code>dev</code>
        </p>
        <ThemeToggle className="h-9 w-9" />
      </div>
    </form>
  );
}
