"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

import { useAssessment } from "@/components/assessment/assessment-provider";
import { BrandLockup } from "@/components/ui/brand-lockup";
import { Button } from "@/components/ui/button";
type AssessmentShellStage = "intake" | "analyzing" | "result";

const STEPS: Array<{ stage: AssessmentShellStage; label: string }> = [
  { stage: "intake", label: "Context" },
  { stage: "analyzing", label: "Analysis" },
  { stage: "result", label: "Result" },
];

export function AssessmentShell({
  activeStage,
  children,
}: {
  activeStage: AssessmentShellStage;
  children: React.ReactNode;
}) {
  const { restart } = useAssessment();
  const currentIndex = STEPS.findIndex((step) => step.stage === activeStage);

  function handleRestart() {
    if (window.confirm("Restart this Preview assessment? Your locally saved progress will be cleared.")) {
      restart();
      window.location.assign("/assessment");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]" data-theme="public">
      <a className="sr-only z-50 rounded-md bg-white px-4 py-3 font-semibold focus:not-sr-only focus:fixed focus:left-4 focus:top-4" href="#assessment-content">
        Skip to assessment
      </a>
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[#f7f3ed]/94 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[var(--content-max)] items-center justify-between gap-4 px-4 sm:h-[76px] sm:px-6 lg:px-10">
          <Link aria-label="FundMe home" href="/"><BrandLockup size="sm" /></Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-[13px] font-medium text-[var(--text-secondary)] sm:inline">Preview assessment</span>
            <Button aria-label="Restart assessment" onClick={handleRestart} size="sm" variant="ghost">
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Restart</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[var(--content-max)] px-4 pb-20 pt-5 sm:px-6 sm:pt-7 lg:px-10" id="assessment-content">
        <nav aria-label="Assessment progress" className="mb-7 grid grid-cols-3 gap-2">
          {STEPS.map((step, index) => (
            <div key={step.stage} className="min-w-0">
              <div className={`h-1 rounded-full ${index <= currentIndex ? "bg-[#ff6b3d]" : "bg-black/10"}`} />
              <span className={`mt-2 block truncate text-[13px] font-medium ${index === currentIndex ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </nav>
        {children}
      </div>
    </main>
  );
}
