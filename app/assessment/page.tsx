import { Suspense } from "react";
import { AssessmentShell } from "@/components/assessment/assessment-shell";
import { IntakeGrid } from "@/components/assessment/intake-grid";

export default function AssessmentPage() {
  return (
    <AssessmentShell activeStage="intake">
      <Suspense fallback={<div className="py-12 text-center text-sm text-[var(--text-secondary)]">Loading intake…</div>}>
        <IntakeGrid />
      </Suspense>
    </AssessmentShell>
  );
}
