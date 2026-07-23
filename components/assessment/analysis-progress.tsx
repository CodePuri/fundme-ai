"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAssessment } from "@/components/assessment/assessment-provider";
import { validateIntake } from "@/lib/assessment/validation";

export function AnalysisProgress() {
  const router = useRouter();
  const { session, hasHydrated, generateReport } = useAssessment();
  const [activeIndex, setActiveIndex] = useState(0);
  const startedRef = useRef(false);

  const stages = useMemo(() => {
    const hasFounderEvidence = Boolean(
      session.input.linkedInUrl?.trim()
      || session.input.profileText.trim()
      || session.artifacts.some((artifact) => artifact.kind === "founder-profile"),
    );
    const hasDeck = session.artifacts.some((artifact) => artifact.kind === "pitch-deck");
    return [
      hasFounderEvidence ? "Organizing submitted founder evidence" : "Recording missing founder-profile evidence",
      session.input.websiteUrl.trim() ? "Recording submitted website address — contents are not fetched" : "Using the submitted startup description",
      hasDeck ? "Recording pitch-deck metadata — contents are not parsed" : "Confirming that no pitch deck was supplied",
      "Checking submitted evidence and explicit gaps",
      "Scoring funding readiness with fundme-demo-rubric@1",
      "Finding relevant Preview opportunity categories",
    ];
  }, [session.artifacts, session.input]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (session.report) {
      router.replace("/assessment/result");
      return;
    }
    if (!validateIntake(session.input, session.artifacts).valid) {
      router.replace("/assessment");
      return;
    }
    if (session.processingState !== "assessing" || startedRef.current) return;

    startedRef.current = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intervalMs = reducedMotion ? 40 : 260;
    let index = 0;
    let completionTimer: number | null = null;
    const interval = window.setInterval(() => {
      index += 1;
      setActiveIndex(Math.min(index, stages.length - 1));
      if (index >= stages.length - 1) {
        window.clearInterval(interval);
        completionTimer = window.setTimeout(generateReport, reducedMotion ? 20 : 320);
      }
    }, intervalMs);
    return () => {
      window.clearInterval(interval);
      if (completionTimer !== null) window.clearTimeout(completionTimer);
      startedRef.current = false;
    };
  }, [
    generateReport,
    hasHydrated,
    router,
    session.artifacts,
    session.input,
    session.processingState,
    session.report,
    stages.length,
  ]);

  return (
    <div className="mx-auto grid max-w-[920px] gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:py-12">
      <div>
        <p className="eyebrow">Local deterministic analysis</p>
        <h1 className="instrument-serif mt-3 text-5xl leading-[0.98] tracking-[-0.035em] sm:text-6xl">
          Turning submitted evidence into a clear diagnosis.
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[var(--text-muted)]">
          FundMe is applying one stable Preview rubric. It is not browsing the web, reading unparsed deck slides, or generating live matches.
        </p>
      </div>

      <section aria-live="polite" className="rounded-[26px] border border-[var(--border)] bg-white p-5 shadow-[0_24px_70px_rgba(17,17,17,0.06)] sm:p-6">
        <div className="space-y-1">
          {stages.map((stage, index) => {
            const complete = index < activeIndex;
            const active = index === activeIndex;
            return (
              <div className={`flex items-start gap-3 rounded-xl px-3 py-3 text-sm ${active ? "bg-[#fff4ed] text-[#171513]" : "text-[#777066]"}`} key={stage}>
                <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${complete ? "bg-[#2f7d57] text-white" : active ? "bg-[#ff6b3d] text-white" : "border border-black/10"}`}>
                  {complete ? <Check className="size-3" /> : active ? <LoaderCircle className="size-3 animate-spin motion-reduce:animate-none" /> : null}
                </span>
                <span className={active ? "font-semibold" : undefined}>{stage}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 border-t border-black/8 pt-4 text-xs leading-5 text-[#8b8276]">
          Your browser-local assessment is preserved if you refresh during this step.
        </p>
      </section>
    </div>
  );
}
