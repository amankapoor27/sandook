"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Inquiry } from "@/lib/types";

type InquiriesClientProps = {
  initialInquiries: Inquiry[];
  initialArchived: Inquiry[];
};

type View = "active" | "archive";

const typeLabels: Record<Inquiry["type"], string> = {
  general: "General",
  purchase: "Purchase",
  commission: "Commission",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function InquiryRow({
  inquiry,
  mode,
  busyId,
  onArchive,
  onDelete,
}: {
  inquiry: Inquiry;
  mode: View;
  busyId: string | null;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isBusy = busyId === inquiry.id;

  return (
    <li>
      <div className="flex items-start gap-4 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            {inquiry.name}
            <span className="ml-2 text-xs font-normal text-muted">
              {typeLabels[inquiry.type]}
            </span>
          </p>
          <p className="text-xs text-muted">
            <a
              href={`mailto:${inquiry.email}`}
              className="hover:text-foreground hover:underline"
            >
              {inquiry.email}
            </a>
            {" · "}
            {formatDate(inquiry.createdAt)}
            {mode === "archive" && inquiry.archivedAt && (
              <>
                {" · "}
                Archived {formatDate(inquiry.archivedAt)}
              </>
            )}
          </p>
          {inquiry.artworkTitle && (
            <p className="mt-1 text-xs text-muted">
              Artwork:{" "}
              {inquiry.artworkSlug ? (
                <Link
                  href={`/gallery/${inquiry.artworkSlug}`}
                  className="font-medium text-foreground underline decoration-border underline-offset-2 hover:decoration-muted"
                  target="_blank"
                >
                  {inquiry.artworkTitle}
                </Link>
              ) : (
                inquiry.artworkTitle
              )}
            </p>
          )}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 select-text">
            {inquiry.message}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {mode === "active" && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onArchive(inquiry.id)}
              className="btn btn-secondary"
            >
              {isBusy ? "Archiving…" : "Archive"}
            </button>
          )}
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onDelete(inquiry.id)}
            className="btn btn-danger"
          >
            {isBusy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </li>
  );
}

export function InquiriesClient({
  initialInquiries,
  initialArchived,
}: InquiriesClientProps) {
  const router = useRouter();
  const [view, setView] = useState<View>("active");
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [archived, setArchived] = useState(initialArchived);
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = useMemo(
    () => (view === "active" ? inquiries : archived),
    [view, inquiries, archived],
  );

  async function handleArchive(id: string) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      if (!response.ok) throw new Error("Archive failed");

      const item = inquiries.find((inquiry) => inquiry.id === id);
      if (item) {
        const archivedItem: Inquiry = {
          ...item,
          archived: true,
          archivedAt: new Date().toISOString(),
        };
        setInquiries((current) => current.filter((inquiry) => inquiry.id !== id));
        setArchived((current) => [archivedItem, ...current]);
      }
      router.refresh();
    } catch {
      alert("Could not archive inquiry. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this inquiry permanently?")) return;

    setBusyId(id);
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");

      setInquiries((current) => current.filter((item) => item.id !== id));
      setArchived((current) => current.filter((item) => item.id !== id));
      router.refresh();
    } catch {
      alert("Could not delete inquiry. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setView("active")}
          className={`btn px-4 py-1.5 text-xs font-medium uppercase tracking-[0.12em] ${
            view === "active"
              ? "bg-foreground text-background"
              : "text-muted ring-1 ring-line hover:text-foreground"
          }`}
        >
          Inbox ({inquiries.length})
        </button>
        <button
          type="button"
          onClick={() => setView("archive")}
          className={`btn px-4 py-1.5 text-xs font-medium uppercase tracking-[0.12em] ${
            view === "archive"
              ? "bg-foreground text-background"
              : "text-muted ring-1 ring-line hover:text-foreground"
          }`}
        >
          Archive ({archived.length})
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted">
          {view === "active"
            ? "No inquiries yet. Messages from the contact form will appear here."
            : "No archived inquiries."}
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {visible.map((inquiry) => (
            <InquiryRow
              key={inquiry.id}
              inquiry={inquiry}
              mode={view}
              busyId={busyId}
              onArchive={(id) => void handleArchive(id)}
              onDelete={(id) => void handleDelete(id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
