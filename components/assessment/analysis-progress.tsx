"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Globe2, Linkedin, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAssessment } from "@/components/assessment/assessment-provider";
import { validateIntake } from "@/lib/assessment/validation";

export function AnalysisProgress() {
  const router = useRouter();
  const { session, hasHydrated, generateReport } = useAssessment();
  const [activeIndex, setActiveIndex] = useState(0);
  const startedRef = useRef(false);

  const stages = useMemo(() => [
    "Preparing your evidence",
    "Validating founder signals",
    "Checking startup clarity",
    "Finding the strongest signal",
    "Identifying the biggest risk",
    "Preparing your diagnosis",
  ], []);

  const sources = useMemo(() => [
    {
      available: Boolean(session.input.linkedInUrl?.trim() || session.input.profileText.trim() || session.artifacts.some((artifact) => artifact.kind === "founder-profile")),
      icon: Linkedin,
      label: "Founder",
    },
    { available: Boolean(session.input.websiteUrl.trim()), icon: Globe2, label: "Website" },
    { available: session.artifacts.some((artifact) => artifact.kind === "pitch-deck"), icon: FileText, label: "Deck" },
  ], [session.artifacts, session.input]);

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
  }, [generateReport, hasHydrated, router, session.artifacts, session.input, session.processingState, session.report, stages.length]);

  const progress = Math.round(((activeIndex + 1) / stages.length) * 100);

  return (
    <div className="mx-auto flex min-h-[58vh] max-w-[720px] flex-col items-center justify-center py-8 text-center">
      <div className="relative grid size-24 place-items-center rounded-full border border-[var(--border)] bg-white shadow-[0_18px_54px_rgba(36,29,22,0.07)]">
        <span className="absolute inset-3 rounded-full bg-[#fff4ed]" />
        <LoaderCircle className="relative size-8 animate-spin text-[#ff6b3d] motion-reduce:animate-none" />
      </div>
      <p className="eyebrow mt-7">Analyzing your funding fit</p>
      <h1 className="type-page-title mt-3" aria-live="polite">
        {stages[activeIndex]}
      </h1>
      <p className="type-body mt-3 max-w-[62ch] text-[var(--text-secondary)]">
        We use only your evidence and make missing proof visible.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {sources.map(({ available, icon: Icon, label }) => (
          <span className={`inline-flex min-h-11 items-center gap-2 rounded-xl border bg-white px-3 text-[13px] font-semibold ${available ? "border-[#246b48]/25 text-[var(--status-positive)]" : "border-[var(--border)] text-[var(--text-secondary)]"}`} key={label}>
            <Icon className="size-3.5" />
            {label} {available ? "added" : "not added"}
          </span>
        ))}
      </div>
      <div className="mt-7 w-full max-w-md">
        <div
          aria-label="Assessment analysis progress"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className="h-1.5 overflow-hidden rounded-full bg-black/8"
          role="progressbar"
        >
          <div className="h-full rounded-full bg-[#ff6b3d] transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-[13px] font-medium text-[var(--text-secondary)]">{progress}%</p>
      </div>
    </div>
  );
}
