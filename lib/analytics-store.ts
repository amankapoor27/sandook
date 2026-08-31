import "server-only";

import fs from "fs/promises";
import path from "path";
import {
  EMPTY_ANALYTICS,
  EMPTY_ARTWORK_STATS,
  EMPTY_WEEKLY_BUCKET,
  getWeekKey,
  type AnalyticsSnapshot,
  type ArtworkAnalytics,
  type WeeklyBucket,
} from "./analytics-utils";
import { getObject, putObject } from "./storage";
import { isR2Configured } from "./env";

const ANALYTICS_KEY = "analytics.json";
const LOCAL_ANALYTICS = path.join(process.cwd(), "storage", "analytics.json");

export type { AnalyticsSnapshot, ArtworkAnalytics } from "./analytics-utils";

function normalizeWeeklyBucket(raw: Partial<WeeklyBucket>): WeeklyBucket {
  const bySlug: Record<string, ArtworkAnalytics> = {};
  for (const [slug, stats] of Object.entries(raw.bySlug ?? {})) {
    bySlug[slug] = {
      views: stats?.views ?? 0,
      inquireClicks: stats?.inquireClicks ?? 0,
      whatsappClicks: stats?.whatsappClicks ?? 0,
    };
  }

  return {
    homepageViews: raw.homepageViews ?? 0,
    galleryViews: raw.galleryViews ?? 0,
    artworkViews: raw.artworkViews ?? 0,
    inquireClicks: raw.inquireClicks ?? 0,
    whatsappClicks: raw.whatsappClicks ?? 0,
    whatsappGeneralClicks: raw.whatsappGeneralClicks ?? 0,
    bySlug,
  };
}

function normalizeSnapshot(raw: Partial<AnalyticsSnapshot>): AnalyticsSnapshot {
  const bySlug: Record<string, ArtworkAnalytics> = {};
  for (const [slug, stats] of Object.entries(raw.bySlug ?? {})) {
    bySlug[slug] = {
      views: stats?.views ?? 0,
      inquireClicks: stats?.inquireClicks ?? 0,
      whatsappClicks: stats?.whatsappClicks ?? 0,
    };
  }

  const weekly: Record<string, WeeklyBucket> = {};
  for (const [weekKey, bucket] of Object.entries(raw.weekly ?? {})) {
    weekly[weekKey] = normalizeWeeklyBucket(bucket);
  }

  const weeklySources: Record<string, Record<string, number>> = {};
  for (const [weekKey, sources] of Object.entries(raw.weeklySources ?? {})) {
    weeklySources[weekKey] = { ...sources };
  }

  return {
    totals: {
      homepageViews: raw.totals?.homepageViews ?? 0,
      galleryViews: raw.totals?.galleryViews ?? 0,
      whatsappGeneralClicks: raw.totals?.whatsappGeneralClicks ?? 0,
    },
    bySlug,
    sources: { ...(raw.sources ?? {}) },
    weekly,
    weeklySources,
  };
}

async function readAnalytics(): Promise<AnalyticsSnapshot> {
  const stored = await getObject(ANALYTICS_KEY);
  if (stored) {
    return normalizeSnapshot(
      JSON.parse(stored.toString("utf-8")) as Partial<AnalyticsSnapshot>,
    );
  }

  if (!isR2Configured()) {
    try {
      const raw = await fs.readFile(LOCAL_ANALYTICS, "utf-8");
      return normalizeSnapshot(
        JSON.parse(raw) as Partial<AnalyticsSnapshot>,
      );
    } catch {
      return { ...EMPTY_ANALYTICS };
    }
  }

  return { ...EMPTY_ANALYTICS };
}

async function writeAnalytics(snapshot: AnalyticsSnapshot): Promise<void> {
  const normalized = normalizeSnapshot(snapshot);
  const body = Buffer.from(JSON.stringify(normalized, null, 2), "utf-8");
  await putObject(ANALYTICS_KEY, body, "application/json");

  if (!isR2Configured()) {
    await fs.mkdir(path.dirname(LOCAL_ANALYTICS), { recursive: true });
    await fs.writeFile(LOCAL_ANALYTICS, body);
  }
}

function artworkStats(
  snapshot: AnalyticsSnapshot,
  slug: string,
): ArtworkAnalytics {
  return snapshot.bySlug[slug] ?? EMPTY_ARTWORK_STATS();
}

function weekBucket(snapshot: AnalyticsSnapshot, weekKey: string): WeeklyBucket {
  return snapshot.weekly[weekKey] ?? EMPTY_WEEKLY_BUCKET();
}

function weekArtworkStats(
  bucket: WeeklyBucket,
  slug: string,
): ArtworkAnalytics {
  return bucket.bySlug[slug] ?? EMPTY_ARTWORK_STATS();
}

function bumpSource(
  snapshot: AnalyticsSnapshot,
  weekKey: string,
  source?: string,
): void {
  const label = source?.trim() || "Direct";
  snapshot.sources[label] = (snapshot.sources[label] ?? 0) + 1;
  if (!snapshot.weeklySources[weekKey]) {
    snapshot.weeklySources[weekKey] = {};
  }
  snapshot.weeklySources[weekKey][label] =
    (snapshot.weeklySources[weekKey][label] ?? 0) + 1;
}

function withCurrentWeek(
  snapshot: AnalyticsSnapshot,
  mutate: (weekKey: string, bucket: WeeklyBucket) => void,
): void {
  const weekKey = getWeekKey();
  const bucket = { ...weekBucket(snapshot, weekKey), bySlug: { ...weekBucket(snapshot, weekKey).bySlug } };
  mutate(weekKey, bucket);
  snapshot.weekly[weekKey] = bucket;
}

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  return readAnalytics();
}

export async function recordHomepageView(source?: string): Promise<void> {
  const snapshot = await readAnalytics();
  snapshot.totals.homepageViews += 1;
  bumpSource(snapshot, getWeekKey(), source);
  withCurrentWeek(snapshot, (_weekKey, bucket) => {
    bucket.homepageViews += 1;
  });
  await writeAnalytics(snapshot);
}

export async function recordGalleryView(source?: string): Promise<void> {
  const snapshot = await readAnalytics();
  snapshot.totals.galleryViews += 1;
  bumpSource(snapshot, getWeekKey(), source);
  withCurrentWeek(snapshot, (_weekKey, bucket) => {
    bucket.galleryViews += 1;
  });
  await writeAnalytics(snapshot);
}

export async function recordArtworkView(
  slug: string,
  source?: string,
): Promise<void> {
  const snapshot = await readAnalytics();
  snapshot.bySlug[slug] = {
    ...artworkStats(snapshot, slug),
    views: artworkStats(snapshot, slug).views + 1,
  };
  bumpSource(snapshot, getWeekKey(), source);
  withCurrentWeek(snapshot, (_weekKey, bucket) => {
    bucket.artworkViews += 1;
    bucket.bySlug[slug] = {
      ...weekArtworkStats(bucket, slug),
      views: weekArtworkStats(bucket, slug).views + 1,
    };
  });
  await writeAnalytics(snapshot);
}

export async function recordInquireClick(slug: string): Promise<void> {
  const snapshot = await readAnalytics();
  snapshot.bySlug[slug] = {
    ...artworkStats(snapshot, slug),
    inquireClicks: artworkStats(snapshot, slug).inquireClicks + 1,
  };
  withCurrentWeek(snapshot, (_weekKey, bucket) => {
    bucket.inquireClicks += 1;
    bucket.bySlug[slug] = {
      ...weekArtworkStats(bucket, slug),
      inquireClicks: weekArtworkStats(bucket, slug).inquireClicks + 1,
    };
  });
  await writeAnalytics(snapshot);
}

export async function recordWhatsAppClick(slug?: string): Promise<void> {
  const snapshot = await readAnalytics();

  if (!slug) {
    snapshot.totals.whatsappGeneralClicks += 1;
    withCurrentWeek(snapshot, (_weekKey, bucket) => {
      bucket.whatsappGeneralClicks += 1;
    });
    await writeAnalytics(snapshot);
    return;
  }

  snapshot.bySlug[slug] = {
    ...artworkStats(snapshot, slug),
    whatsappClicks: artworkStats(snapshot, slug).whatsappClicks + 1,
  };
  withCurrentWeek(snapshot, (_weekKey, bucket) => {
    bucket.whatsappClicks += 1;
    bucket.bySlug[slug] = {
      ...weekArtworkStats(bucket, slug),
      whatsappClicks: weekArtworkStats(bucket, slug).whatsappClicks + 1,
    };
  });
  await writeAnalytics(snapshot);
}
