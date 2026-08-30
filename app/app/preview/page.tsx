import { Suspense } from "react";
import { PreviewDashboard } from "@/components/assessment/preview-dashboard";

export default function PreviewDashboardPage() {
  return (
    <Suspense fallback={<div className="premium-card p-8 text-[15px] text-[var(--text-secondary)]">Opening your saved assessment workspace…</div>}>
      <PreviewDashboard />
    </Suspense>
  );
}
