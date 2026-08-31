export type ArtworkAnalytics = {
  views: number;
  inquireClicks: number;
  whatsappClicks: number;
};

export type WeeklyBucket = {
  homepageViews: number;
  galleryViews: number;
  artworkViews: number;
  inquireClicks: number;
  whatsappClicks: number;
  whatsappGeneralClicks: number;
  bySlug: Record<string, ArtworkAnalytics>;
};

export type AnalyticsSnapshot = {
  totals: {
    homepageViews: number;
    galleryViews: number;
    whatsappGeneralClicks: number;
  };
  bySlug: Record<string, ArtworkAnalytics>;
  sources: Record<string, number>;
  weekly: Record<string, WeeklyBucket>;
  weeklySources: Record<string, Record<string, number>>;
};

export type AnalyticsArtworkRow = {
  slug: string;
  title: string;
  views: number;
  inquireClicks: number;
  whatsappClicks: number;
};

export type AnalyticsSourceRow = {
  source: string;
  count: number;
};

export type WeeklyStatsRow = {
  weekKey: string;
  weekLabel: string;
  homepageViews: number;
  galleryViews: number;
  artworkViews: number;
  inquireClicks: number;
  whatsappClicks: number;
  whatsappGeneralClicks: number;
  topSources: AnalyticsSourceRow[];
};

export type AnalyticsReport = {
  totals: AnalyticsSnapshot["totals"];
  sources: AnalyticsSourceRow[];
  weekly: WeeklyStatsRow[];
  artworks: AnalyticsArtworkRow[];
};

export const EMPTY_ARTWORK_STATS = (): ArtworkAnalytics => ({
  views: 0,
  inquireClicks: 0,
  whatsappClicks: 0,
});

export const EMPTY_WEEKLY_BUCKET = (): WeeklyBucket => ({
  homepageViews: 0,
  galleryViews: 0,
  artworkViews: 0,
  inquireClicks: 0,
  whatsappClicks: 0,
  whatsappGeneralClicks: 0,
  bySlug: {},
});

export const EMPTY_ANALYTICS: AnalyticsSnapshot = {
  totals: {
    homepageViews: 0,
    galleryViews: 0,
    whatsappGeneralClicks: 0,
  },
  bySlug: {},
  sources: {},
  weekly: {},
  weeklySources: {},
};

export function getWeekKey(date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function formatWeekLabel(weekKey: string): string {
  const start = new Date(`${weekKey}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const sameMonth = start.getMonth() === end.getMonth();
  const startFmt = start.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
  const endFmt = end.toLocaleDateString("en-IN", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFmt} – ${endFmt}`;
}

export function parseReferrerSource(
  referer: string | null | undefined,
  siteHost: string,
): string {
  if (!referer?.trim()) return "Direct";

  try {
    const url = new URL(referer);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const normalizedSite = siteHost.replace(/^www\./, "").toLowerCase();

    if (host === normalizedSite || host.endsWith(`.${normalizedSite}`)) {
      return "Direct";
    }

    if (host.includes("google.")) return "Google";
    if (host.includes("instagram.")) return "Instagram";
    if (host.includes("facebook.") || host === "fb.com") return "Facebook";
    if (host === "t.co" || host.includes("twitter.") || host === "x.com") {
      return "X / Twitter";
    }

    return host;
  } catch {
    return "Unknown";
  }
}

export function sumArtworkViews(bucket: WeeklyBucket): number {
  return Object.values(bucket.bySlug).reduce((sum, stats) => sum + stats.views, 0);
}
