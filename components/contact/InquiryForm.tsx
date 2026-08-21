"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { InquiryType } from "@/lib/types";

type InquiryFormProps = {
  defaultType?: InquiryType;
  artworkSlug?: string;
  artworkTitle?: string;
};

export function InquiryForm({
  defaultType = "general",
  artworkSlug: initialSlug,
  artworkTitle: initialTitle,
}: InquiryFormProps) {
  const searchParams = useSearchParams();
  const [type, setType] = useState<InquiryType>(
    (searchParams.get("type") as InquiryType) ?? defaultType,
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [artworkSlug] = useState(
    searchParams.get("slug") ?? initialSlug ?? "",
  );
  const [artworkTitle] = useState(
    searchParams.get("title") ?? initialTitle ?? "",
  );
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          email,
          message,
          artworkSlug: artworkSlug || undefined,
          artworkTitle: artworkTitle || undefined,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="font-display text-2xl text-foreground">Message sent</p>
        <p className="mt-2 text-sm text-muted">
          Thank you — I&apos;ll get back to you within a few business days.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium text-accent hover:text-accent-hover"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      {artworkTitle && (
        <p className="rounded-lg bg-accent/10 px-4 py-3 text-sm text-foreground">
          Inquiring about: <strong>{artworkTitle}</strong>
        </p>
      )}

      <label className="block text-sm font-medium text-foreground">
        Inquiry type
        <select
          value={type}
          onChange={(e) => setType(e.target.value as InquiryType)}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2"
        >
          <option value="general">General question</option>
          <option value="purchase">Purchase inquiry</option>
          <option value="commission">Commission request</option>
        </select>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-foreground">
          Name
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-foreground">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-foreground">
        Message
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2"
          placeholder="Tell me about your interest, preferred size, timeline…"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-accent px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
