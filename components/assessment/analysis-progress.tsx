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
    <div className="mx-auto flex min-h-[62vh] max-w-[760px] flex-col items-center justify-center py-8 text-center">
      <div className="relative grid size-32 place-items-center rounded-full bg-white shadow-[0_24px_70px_rgba(17,17,17,0.08)]">
        <span className="absolute inset-2 rounded-full border border-[#ff6b3d]/20" />
        <span className="absolute inset-5 rounded-full bg-[#fff4ed]" />
        <LoaderCircle className="relative size-8 animate-spin text-[#ff6b3d] motion-reduce:animate-none" />
      </div>
      <p className="eyebrow mt-7">Analyzing your funding fit</p>
      <h1 className="instrument-serif mt-3 text-[42px] leading-none tracking-[-0.035em] sm:text-6xl">
        {stages[activeIndex]}
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--text-muted)]">
        We use only the evidence you supplied and make missing proof visible.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {sources.map(({ available, icon: Icon, label }) => (
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${available ? "border-[#2f7d57]/20 bg-[#f3fbf6] text-[#2f7d57]" : "border-black/8 bg-white text-[#8b8276]"}`} key={label}>
            <Icon className="size-3.5" />
            {label}
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
        <p aria-live="polite" className="mt-3 text-xs font-medium text-[#8b8276]">{progress}%</p>
      </div>
    </div>
  );
}
