import "server-only";

import { getManifest } from "./manifest";
import {
  getAnalyticsSnapshot,
  recordArtworkView,
  recordGalleryView,
  recordHomepageView,
  recordInquireClick,
  recordWhatsAppClick,
  type ArtworkAnalytics,
} from "./analytics-store";
import {
  formatWeekLabel,
  sumArtworkViews,
  type AnalyticsArtworkRow,
  type AnalyticsReport,
  type AnalyticsSourceRow,
  type WeeklyStatsRow,
} from "./analytics-utils";

export type { AnalyticsReport } from "./analytics-utils";

export {
  recordArtworkView,
  recordGalleryView,
  recordHomepageView,
  recordInquireClick,
  recordWhatsAppClick,
};

export async function artworkSlugExists(slug: string): Promise<boolean> {
  const manifest = await getManifest();
  return manifest.images.some((image) => image.slug === slug);
}

function sortSources(sources: Record<string, number>): AnalyticsSourceRow[] {
  return Object.entries(sources)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

function buildWeeklyReport(
  snapshot: Awaited<ReturnType<typeof getAnalyticsSnapshot>>,
): WeeklyStatsRow[] {
  const weekKeys = new Set([
    ...Object.keys(snapshot.weekly),
    ...Object.keys(snapshot.weeklySources),
  ]);

  return [...weekKeys]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 12)
    .map((weekKey) => {
      const bucket = snapshot.weekly[weekKey];
      const artworkViews =
        bucket?.artworkViews ??
        (bucket ? sumArtworkViews(bucket) : 0);

      return {
        weekKey,
        weekLabel: formatWeekLabel(weekKey),
        homepageViews: bucket?.homepageViews ?? 0,
        galleryViews: bucket?.galleryViews ?? 0,
        artworkViews,
        inquireClicks: bucket?.inquireClicks ?? 0,
        whatsappClicks: bucket?.whatsappClicks ?? 0,
        whatsappGeneralClicks: bucket?.whatsappGeneralClicks ?? 0,
        topSources: sortSources(snapshot.weeklySources[weekKey] ?? {}).slice(
          0,
          5,
        ),
      };
    });
}

export async function getAnalyticsReport(): Promise<AnalyticsReport> {
  const [snapshot, manifest] = await Promise.all([
    getAnalyticsSnapshot(),
    getManifest(),
  ]);

  const titleBySlug = new Map(
    manifest.images.map((image) => [image.slug, image.title]),
  );
  const slugs = new Set([
    ...manifest.images.map((image) => image.slug),
    ...Object.keys(snapshot.bySlug),
  ]);

  const artworks: AnalyticsArtworkRow[] = [...slugs]
    .map((slug) => {
      const stats: ArtworkAnalytics = snapshot.bySlug[slug] ?? {
        views: 0,
        inquireClicks: 0,
        whatsappClicks: 0,
      };
      return {
        slug,
        title: titleBySlug.get(slug) ?? slug,
        views: stats.views,
        inquireClicks: stats.inquireClicks,
        whatsappClicks: stats.whatsappClicks,
      };
    })
    .filter(
      (row) =>
        titleBySlug.has(row.slug) ||
        row.views > 0 ||
        row.inquireClicks > 0 ||
        row.whatsappClicks > 0,
    )
    .sort((a, b) => {
      if (b.views !== a.views) return b.views - a.views;
      return (
        b.inquireClicks +
        b.whatsappClicks -
        (a.inquireClicks + a.whatsappClicks)
      );
    });

  return {
    totals: snapshot.totals,
    sources: sortSources(snapshot.sources),
    weekly: buildWeeklyReport(snapshot),
    artworks,
  };
}
