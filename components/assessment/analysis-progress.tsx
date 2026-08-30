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
  const [progressPercent, setProgressPercent] = useState(15);
  const [isCompleted, setIsCompleted] = useState(false);
  const startedRef = useRef(false);

  const stages = useMemo(() => [
    "Reading founder context and background signals",
    "Ingesting startup website and positioning claims",
    "Parsing pitch deck structure and slide narrative",
    "Extracting traction claims and timeline evidence",
    "Auditing evidence coverage and detecting contradictions",
    "Evaluating deterministic rubric and scoring dimensions",
    "Synthesizing investor-risk diagnosis and prioritized fixes",
  ], []);

  const sources = useMemo(() => [
    {
      available: Boolean(session.input.linkedInUrl?.trim() || session.input.profileText.trim() || session.artifacts.some((artifact) => artifact.kind === "founder-profile")),
      icon: Linkedin,
      label: "Founder context",
      detail: session.input.founderName ? session.input.founderName : "Added",
    },
    {
      available: Boolean(session.input.websiteUrl.trim()),
      icon: Globe2,
      label: "Startup website",
      detail: session.input.websiteUrl.trim() ? "Ingesting" : "Not provided",
    },
    {
      available: session.artifacts.some((artifact) => artifact.kind === "pitch-deck"),
      icon: FileText,
      label: "Pitch deck",
      detail: session.artifacts.find((a) => a.kind === "pitch-deck")?.name || "Not provided",
    },
  ], [session.artifacts, session.input]);

  // 1. Validation and initial redirection guards
  useEffect(() => {
    if (!hasHydrated) return;
    if (session.report && !isCompleted) {
      setIsCompleted(true);
      setProgressPercent(100);
      const timer = window.setTimeout(() => {
        router.replace("/assessment/result");
      }, 400);
      return () => window.clearTimeout(timer);
    }
    if (!validateIntake(session.input, session.artifacts).valid) {
      router.replace("/assessment");
      return;
    }
  }, [hasHydrated, isCompleted, router, session.artifacts, session.input, session.report]);

  // 2. Start generation immediately on mount
  useEffect(() => {
    if (!hasHydrated || startedRef.current || session.report) return;
    startedRef.current = true;

    // Trigger real backend analysis
    generateReport().catch((err) => console.warn("Analysis progress error:", err));

    // Progress pacing
    const stageInterval = window.setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev + 1;
        if (next < stages.length) {
          setProgressPercent(Math.min(90, Math.round(((next + 1) / (stages.length + 1)) * 100)));
          return next;
        }
        return prev;
      });
    }, 700);

    return () => {
      window.clearInterval(stageInterval);
    };
  }, [generateReport, hasHydrated, session.report, stages.length]);

  // 3. When session.report becomes available, complete smoothly
  useEffect(() => {
    if (session.report && !isCompleted) {
      setIsCompleted(true);
      setProgressPercent(100);
      setActiveIndex(stages.length - 1);
      const navTimer = window.setTimeout(() => {
        router.replace("/assessment/result");
      }, 500);
      return () => window.clearTimeout(navTimer);
    }
  }, [isCompleted, router, session.report, stages.length]);

  const progress = progressPercent;

  return (
    <div className="mx-auto flex min-h-[62vh] max-w-[760px] flex-col items-center justify-center py-10 text-center">
      {/* Animated Glowing Orb / Loader */}
      <div className="relative grid size-28 place-items-center rounded-full border border-[var(--border)] bg-white shadow-[0_20px_60px_rgba(255,107,61,0.12)]">
        <span className="absolute inset-2 animate-pulse rounded-full bg-[#fff4ed] motion-reduce:animate-none" />
        <LoaderCircle className="relative size-10 animate-spin text-[#ff6b3d] motion-reduce:animate-none" />
      </div>

      <p className="eyebrow mt-8">Analyzing your funding fit</p>
      <h1 className="instrument-serif mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]" aria-live="polite">
        {stages[activeIndex]}
      </h1>
      <p className="type-body mt-2 max-w-[62ch] text-[var(--text-secondary)]">
        Evaluating evidence depth, founder-market fit, and the specific claims investors will challenge.
      </p>

      {/* Real Ingested Sources Status */}
      <div className="mt-8 grid w-full max-w-lg gap-2 sm:grid-cols-3">
        {sources.map(({ available, icon: Icon, label, detail }) => (
          <div
            key={label}
            className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
              available
                ? "border-[#246b48]/30 bg-[#f3fbf6] text-[var(--text-primary)] shadow-2xs"
                : "border-[var(--border)] bg-white/70 text-[var(--text-secondary)] opacity-70"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Icon className={`size-3.5 ${available ? "text-[#246b48]" : "text-[var(--text-tertiary)]"}`} />
              <span className="truncate">{label}</span>
            </div>
            <span className="mt-1.5 truncate text-[11px] font-medium text-[var(--text-secondary)]">
              {available ? (detail === "Ingesting" ? "Reading content…" : detail) : "Not added"}
            </span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-8 w-full max-w-md">
        <div
          aria-label="Assessment analysis progress"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className="h-2 overflow-hidden rounded-full bg-black/8"
          role="progressbar"
        >
          <div
            className="h-full rounded-full bg-[#ff6b3d] transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2.5 flex justify-between text-[12px] font-medium text-[var(--text-tertiary)]">
          <span>Processing real evidence</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
