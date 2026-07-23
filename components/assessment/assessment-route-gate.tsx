"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAssessment } from "@/components/assessment/assessment-provider";
import type { GrillStage } from "@/lib/assessment/types";
import { validateIntake } from "@/lib/assessment/validation";

export function AssessmentRouteGate({
  stage,
  children,
}: {
  stage: Exclude<GrillStage, "intake" | "result">;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session, hasHydrated } = useAssessment();
  const hasIntake = validateIntake(session.input).valid;
  const allowed = hasIntake && (stage === "review" || Boolean(session.reviewedAt));
  const fallback = hasIntake ? "/assessment/review" : "/assessment";

  useEffect(() => {
    if (hasHydrated && !allowed) router.replace(fallback);
  }, [allowed, fallback, hasHydrated, router]);

  if (!hasHydrated || !allowed) {
    return <div className="mx-auto max-w-xl rounded-[24px] border border-[var(--border)] bg-white p-6 text-center text-sm text-[#6f685f]">Recovering your saved progress…</div>;
  }
  return children;
}
