"use client";

import { slugify } from "@/lib/slug";

type VocabularyComboboxProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  inputMode?: "text" | "numeric";
};

export function VocabularyCombobox({
  label,
  value,
  options,
  onChange,
  disabled,
  placeholder,
  inputMode = "text",
}: VocabularyComboboxProps) {
  const listId = `${label.replace(/\s+/g, "-").toLowerCase()}-options`;

  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <input
        type="text"
        list={listId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        disabled={disabled}
        className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
      />
      {options.length > 0 && (
        <datalist id={listId}>
          {options.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      )}
    </label>
  );
}

type CategorySelectProps = {
  value: string;
  categories: {
    slug: string;
    label: string;
    fieldSet: "painting" | "print";
    active: boolean;
  }[];
  onChange: (slug: string, label?: string) => void;
  disabled?: boolean;
};

export function CategorySelect({
  value,
  categories,
  onChange,
  disabled,
}: CategorySelectProps) {
  const active = categories.filter((entry) => entry.active);
  const hasCurrent = active.some((entry) => entry.slug === value);
  const showNew = value && !hasCurrent;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Category
        <select
          value={hasCurrent ? value : showNew ? "__custom__" : value}
          onChange={(event) => {
            const next = event.target.value;
            if (next === "__custom__") return;
            const entry = categories.find((item) => item.slug === next);
            onChange(next, entry?.label);
          }}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          disabled={disabled}
        >
          {active.map((entry) => (
            <option key={entry.slug} value={entry.slug}>
              {entry.label}
            </option>
          ))}
          {showNew && (
            <option value="__custom__">
              {categories.find((entry) => entry.slug === value)?.label ?? value}
            </option>
          )}
        </select>
      </label>
      <label className="block text-sm text-muted">
        Or add new category
        <input
          type="text"
          placeholder="e.g. Watercolour"
          disabled={disabled}
          onBlur={(event) => {
            const label = event.target.value.trim();
            if (!label) return;
            onChange(slugify(label) || "category", label);
            event.target.value = "";
          }}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
        />
      </label>
    </div>
  );
}
