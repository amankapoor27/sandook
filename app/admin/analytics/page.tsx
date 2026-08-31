import { AnalyticsClient } from "@/components/admin/AnalyticsClient";
import { getAnalyticsReport } from "@/lib/analytics";

export default async function AdminAnalyticsPage() {
  const report = await getAnalyticsReport();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted">
          Anonymous interest signals — artwork views and inquiry button clicks.
        </p>
      </div>
      <AnalyticsClient report={report} />
    </div>
  );
}
