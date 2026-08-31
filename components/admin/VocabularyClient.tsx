"use client";

import { useState } from "react";
import type { CategoryFieldSet, Vocabulary } from "@/lib/types";

type VocabularyClientProps = {
  initialVocabulary: Vocabulary;
};

type ListKey = "mediums" | "dimensions" | "years";

function StringListSection({
  title,
  listKey,
  vocabulary,
  newValue,
  onNewValueChange,
  onAdd,
  onToggleActive,
  busy,
}: {
  title: string;
  listKey: ListKey;
  vocabulary: Vocabulary;
  newValue: string;
  onNewValueChange: (value: string) => void;
  onAdd: () => void;
  onToggleActive: (value: string, active: boolean) => void;
  busy: boolean;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">{title}</h2>
      <ul className="divide-y divide-border rounded-xl border border-border">
        {vocabulary[listKey].length === 0 ? (
          <li className="px-4 py-3 text-sm text-muted">No options yet.</li>
        ) : (
          vocabulary[listKey].map((entry) => (
            <li
              key={entry.value}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <p className="text-sm text-foreground">
                {entry.value}
                {!entry.active && (
                  <span className="ml-2 text-xs text-muted">hidden</span>
                )}
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => onToggleActive(entry.value, entry.active)}
                className="btn btn-secondary text-xs"
              >
                {entry.active ? "Hide" : "Restore"}
              </button>
            </li>
          ))
        )}
      </ul>
      <div className="flex gap-2">
        <input
          type="text"
          value={newValue}
          onChange={(event) => onNewValueChange(event.target.value)}
          placeholder={`Add ${title.toLowerCase().slice(0, -1)}`}
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          disabled={busy}
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={busy}
          className="btn btn-primary"
        >
          Add
        </button>
      </div>
    </section>
  );
}

export function VocabularyClient({
  initialVocabulary,
}: VocabularyClientProps) {
  const [vocabulary, setVocabulary] = useState(initialVocabulary);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryFieldSet, setNewCategoryFieldSet] =
    useState<CategoryFieldSet>("painting");
  const [newValues, setNewValues] = useState<Record<ListKey, string>>({
    mediums: "",
    dimensions: "",
    years: "",
  });
  const [newCollection, setNewCollection] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function patchVocabulary(body: Record<string, unknown>) {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/vocabulary", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Update failed");
      const data = (await response.json()) as { vocabulary: Vocabulary };
      setVocabulary(data.vocabulary);
      setMessage("Saved.");
    } catch {
      setMessage("Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  async function addCategory() {
    const label = newCategory.trim();
    if (!label) return;
    await patchVocabulary({
      action: "add",
      list: "categories",
      label,
      fieldSet: newCategoryFieldSet,
    });
    setNewCategory("");
  }

  async function addListValue(list: ListKey) {
    const value = newValues[list].trim();
    if (!value) return;
    await patchVocabulary({ action: "add", list, value });
    setNewValues((current) => ({ ...current, [list]: "" }));
  }

  async function addCollection() {
    const value = newCollection.trim();
    if (!value) return;
    await patchVocabulary({ action: "add", list: "collections", value });
    setNewCollection("");
  }

  async function reorderCollection(value: string, direction: "up" | "down") {
    await patchVocabulary({ action: "reorder", list: "collections", value, direction });
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Metadata lists</h1>
        <p className="mt-1 text-sm text-muted">
          Manage dropdown options for categories, medium, dimensions, year, and
          collection. Collection order controls how artworks are grouped in the
          gallery.
          Hiding an option removes it from future dropdowns but keeps it on
          existing artworks.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Categories</h2>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {vocabulary.categories.map((entry) => (
            <li
              key={entry.slug}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {entry.label}
                  {!entry.active && (
                    <span className="ml-2 text-xs font-normal text-muted">
                      hidden
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted">
                  {entry.slug} ·{" "}
                  {entry.fieldSet === "print" ? "Print fields" : "Painting fields"}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void patchVocabulary({
                    action: entry.active ? "hide" : "restore",
                    list: "categories",
                    value: entry.slug,
                  })
                }
                className="btn btn-secondary text-xs"
              >
                {entry.active ? "Hide" : "Restore"}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
            disabled={busy}
          />
          <select
            value={newCategoryFieldSet}
            onChange={(event) =>
              setNewCategoryFieldSet(event.target.value as CategoryFieldSet)
            }
            className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
            disabled={busy}
          >
            <option value="painting">Painting fields</option>
            <option value="print">Print fields</option>
          </select>
          <button
            type="button"
            onClick={() => void addCategory()}
            disabled={busy}
            className="btn btn-primary"
          >
            Add
          </button>
        </div>
      </section>

      {(
        [
          ["mediums", "Mediums"],
          ["dimensions", "Dimensions"],
          ["years", "Years"],
        ] as const
      ).map(([key, title]) => (
        <StringListSection
          key={key}
          title={title}
          listKey={key}
          vocabulary={vocabulary}
          newValue={newValues[key]}
          onNewValueChange={(value) =>
            setNewValues((current) => ({ ...current, [key]: value }))
          }
          onAdd={() => void addListValue(key)}
          onToggleActive={(value, active) =>
            void patchVocabulary({
              action: active ? "hide" : "restore",
              list: key,
              value,
            })
          }
          busy={busy}
        />
      ))}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Collections</h2>
          <p className="mt-1 text-sm text-muted">
            Artworks in the gallery are grouped by collection in this order.
            New collections are added at the end unless you move them.
          </p>
        </div>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {vocabulary.collections.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">No options yet.</li>
          ) : (
            vocabulary.collections.map((entry, index) => (
              <li
                key={entry.value}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <p className="text-sm text-foreground">
                  {entry.value}
                  {!entry.active && (
                    <span className="ml-2 text-xs text-muted">hidden</span>
                  )}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={busy || index === 0}
                    onClick={() => void reorderCollection(entry.value, "up")}
                    className="btn btn-secondary text-xs"
                    aria-label={`Move ${entry.value} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={busy || index === vocabulary.collections.length - 1}
                    onClick={() => void reorderCollection(entry.value, "down")}
                    className="btn btn-secondary text-xs"
                    aria-label={`Move ${entry.value} down`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void patchVocabulary({
                        action: entry.active ? "hide" : "restore",
                        list: "collections",
                        value: entry.value,
                      })
                    }
                    className="btn btn-secondary text-xs"
                  >
                    {entry.active ? "Hide" : "Restore"}
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCollection}
            onChange={(event) => setNewCollection(event.target.value)}
            placeholder="Add collection"
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
            disabled={busy}
          />
          <button
            type="button"
            onClick={() => void addCollection()}
            disabled={busy}
            className="btn btn-primary"
          >
            Add
          </button>
        </div>
      </section>

      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
}
