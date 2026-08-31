"use client";

import { useMemo, useState } from "react";
import type {
  AnalyticsArtworkRow,
  AnalyticsReport,
} from "@/lib/analytics-utils";

type AnalyticsClientProps = {
  report: AnalyticsReport;
};

type ArtworkSort =
  | "views-desc"
  | "views-asc"
  | "title-asc"
  | "title-desc"
  | "inquire-desc"
  | "whatsapp-desc"
  | "engagement-desc";

type ArtworkFilter =
  | "all"
  | "with-views"
  | "with-inquire"
  | "with-whatsapp"
  | "with-engagement"
  | "no-activity";

function engagementTotal(row: AnalyticsArtworkRow): number {
  return row.views + row.inquireClicks + row.whatsappClicks;
}

function filterArtworks(
  artworks: AnalyticsArtworkRow[],
  filter: ArtworkFilter,
  query: string,
): AnalyticsArtworkRow[] {
  const normalizedQuery = query.trim().toLowerCase();

  return artworks.filter((row) => {
    if (normalizedQuery) {
      const haystack = `${row.title} ${row.slug}`.toLowerCase();
      if (!haystack.includes(normalizedQuery)) return false;
    }

    switch (filter) {
      case "with-views":
        return row.views > 0;
      case "with-inquire":
        return row.inquireClicks > 0;
      case "with-whatsapp":
        return row.whatsappClicks > 0;
      case "with-engagement":
        return engagementTotal(row) > 0;
      case "no-activity":
        return engagementTotal(row) === 0;
      default:
        return true;
    }
  });
}

function sortArtworks(
  artworks: AnalyticsArtworkRow[],
  sort: ArtworkSort,
): AnalyticsArtworkRow[] {
  const sorted = [...artworks];

  sorted.sort((a, b) => {
    switch (sort) {
      case "views-asc":
        return a.views - b.views;
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "inquire-desc":
        return b.inquireClicks - a.inquireClicks;
      case "whatsapp-desc":
        return b.whatsappClicks - a.whatsappClicks;
      case "engagement-desc":
        return engagementTotal(b) - engagementTotal(a);
      case "views-desc":
      default:
        return b.views - a.views;
    }
  });

  return sorted;
}

export function AnalyticsClient({ report }: AnalyticsClientProps) {
  const { totals, sources, weekly, artworks } = report;
  const [artworkQuery, setArtworkQuery] = useState("");
  const [artworkFilter, setArtworkFilter] = useState<ArtworkFilter>("all");
  const [artworkSort, setArtworkSort] = useState<ArtworkSort>("views-desc");

  const filteredArtworks = useMemo(
    () =>
      sortArtworks(
        filterArtworks(artworks, artworkFilter, artworkQuery),
        artworkSort,
      ),
    [artworks, artworkFilter, artworkQuery, artworkSort],
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
            Homepage views
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {totals.homepageViews}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
            Gallery page views
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {totals.galleryViews}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
            Floating WhatsApp clicks
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {totals.whatsappGeneralClicks}
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Traffic sources</h2>
        <p className="text-sm text-muted">
          Where visitors came from when they opened a page (referrer hostname
          only).
        </p>
        {sources.length === 0 ? (
          <p className="text-sm text-muted">No source data yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-[0.1em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Page views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sources.map((row) => (
                  <tr key={row.source}>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {row.source}
                    </td>
                    <td className="px-4 py-3 text-muted">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Weekly stats</h2>
        <p className="text-sm text-muted">Last 12 weeks (Monday–Sunday).</p>
        {weekly.length === 0 ? (
          <p className="text-sm text-muted">No weekly data yet.</p>
        ) : (
          <div className="space-y-4">
            {weekly.map((week) => (
              <div
                key={week.weekKey}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <p className="font-medium text-foreground">{week.weekLabel}</p>
                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <p className="text-xs text-muted">Home</p>
                    <p className="font-medium">{week.homepageViews}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Gallery</p>
                    <p className="font-medium">{week.galleryViews}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Artworks</p>
                    <p className="font-medium">{week.artworkViews}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Inquire</p>
                    <p className="font-medium">{week.inquireClicks}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">WhatsApp</p>
                    <p className="font-medium">{week.whatsappClicks}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">WA (site)</p>
                    <p className="font-medium">{week.whatsappGeneralClicks}</p>
                  </div>
                </div>
                {week.topSources.length > 0 && (
                  <p className="mt-3 text-xs text-muted">
                    Top sources:{" "}
                    {week.topSources
                      .map((row) => `${row.source} (${row.count})`)
                      .join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-medium">By artwork (all time)</h2>
            <p className="text-sm text-muted">
              {filteredArtworks.length} of {artworks.length} shown
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="block text-sm text-muted">
              Search
              <input
                type="search"
                value={artworkQuery}
                onChange={(event) => setArtworkQuery(event.target.value)}
                placeholder="Title or slug"
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground sm:w-44"
              />
            </label>
            <label className="block text-sm text-muted">
              Filter
              <select
                value={artworkFilter}
                onChange={(event) =>
                  setArtworkFilter(event.target.value as ArtworkFilter)
                }
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground sm:w-44"
              >
                <option value="all">All artworks</option>
                <option value="with-engagement">Any activity</option>
                <option value="with-views">Has views</option>
                <option value="with-inquire">Has inquire clicks</option>
                <option value="with-whatsapp">Has WhatsApp clicks</option>
                <option value="no-activity">No activity</option>
              </select>
            </label>
            <label className="block text-sm text-muted">
              Sort by
              <select
                value={artworkSort}
                onChange={(event) =>
                  setArtworkSort(event.target.value as ArtworkSort)
                }
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground sm:w-44"
              >
                <option value="views-desc">Views (high → low)</option>
                <option value="views-asc">Views (low → high)</option>
                <option value="engagement-desc">Total engagement</option>
                <option value="inquire-desc">Inquire clicks</option>
                <option value="whatsapp-desc">WhatsApp clicks</option>
                <option value="title-asc">Title (A → Z)</option>
                <option value="title-desc">Title (Z → A)</option>
              </select>
            </label>
          </div>
        </div>
        {artworks.length === 0 ? (
          <p className="text-sm text-muted">No artwork activity yet.</p>
        ) : filteredArtworks.length === 0 ? (
          <p className="text-sm text-muted">
            No artworks match your search or filter.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-[0.1em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Artwork</th>
                  <th className="px-4 py-3 font-medium">Views</th>
                  <th className="px-4 py-3 font-medium">Inquire</th>
                  <th className="px-4 py-3 font-medium">WhatsApp</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredArtworks.map((row) => (
                  <tr key={row.slug}>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {row.title}
                    </td>
                    <td className="px-4 py-3 text-muted">{row.views}</td>
                    <td className="px-4 py-3 text-muted">
                      {row.inquireClicks}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {row.whatsappClicks}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {engagementTotal(row)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-muted">
        Aggregate counts only — referrer hostnames, no personal data.
      </p>
    </div>
  );
}
