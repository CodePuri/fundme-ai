"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  LoaderCircle,
  Globe,
  User,
  Target,
  CheckCircle2,
} from "lucide-react";

import { useAssessment } from "@/components/assessment/assessment-provider";
import { EASE_OUT } from "@/lib/animations";

const analysisSteps = [
  "Reading website positioning",
  "Extracting startup category",
  "Identifying founder signals",
  "Checking traction and proof points",
  "Mapping stage and geography",
  "Comparing against accelerator patterns",
  "Scanning grants, credits, fellowships, and startup programs",
  "Finding weak application signals",
  "Preparing funding readiness report",
];

const microcopy = [
  "Looking for traction signals...",
  "Checking if your homepage explains who this is for...",
  "Mapping your startup against common accelerator criteria...",
  "Scanning for missing proof points...",
  "Checking founder story strength...",
  "Finding opportunity categories that match your stage...",
  "Preparing your application readiness report...",
];

function WebsiteCard({ websiteUrl }: { websiteUrl: string }) {
  const displayUrl = websiteUrl.replace(/^https?:\/\//, "").slice(0, 24);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.1 }}
      className="rounded-[16px] border border-black/[0.08] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-[10px] bg-[#f0f7ff] text-[#60a5fa]">
          <Globe className="size-4" />
        </div>
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8b8276]">Website</div>
          <div className="text-[14px] font-semibold text-[#171513]">{displayUrl}</div>
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#eee3d6]">
        <motion.div
          className="h-full rounded-full bg-[#60a5fa]"
          initial={{ width: 0 }}
          animate={{ width: "65%" }}
          transition={{ duration: 2, ease: EASE_OUT, delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
}

function FounderSignalCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.2 }}
      className="rounded-[16px] border border-black/[0.08] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-[10px] bg-[#f5f0ff] text-[#8b5cf6]">
          <User className="size-4" />
        </div>
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8b8276]">Founder</div>
          <div className="text-[14px] font-semibold text-[#171513]">Signals</div>
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#eee3d6]">
        <motion.div
          className="h-full rounded-full bg-[#8b5cf6]"
          initial={{ width: 0 }}
          animate={{ width: "45%" }}
          transition={{ duration: 2, ease: EASE_OUT, delay: 0.7 }}
        />
      </div>
    </motion.div>
  );
}

function OpportunityCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.3 }}
      className="rounded-[16px] border border-black/[0.08] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-[10px] bg-[#fff5f0] text-[#ff6b3d]">
          <Target className="size-4" />
        </div>
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8b8276]">Opportunity</div>
          <div className="text-[14px] font-semibold text-[#171513]">Matching</div>
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#eee3d6]">
        <motion.div
          className="h-full rounded-full bg-[#ff6b3d]"
          initial={{ width: 0 }}
          animate={{ width: "30%" }}
          transition={{ duration: 2, ease: EASE_OUT, delay: 0.9 }}
        />
      </div>
    </motion.div>
  );
}

export default function AssessmentAnalyzingPage() {
  const router = useRouter();
  const { state, generateReport } = useAssessment();
  const shouldReduceMotion = useReducedMotion();

  const [elapsed, setElapsed] = useState(0);
  const [currentInsight, setCurrentInsight] = useState(0);
  const TOTAL_DURATION = 9000;

  // P0 FIX: Idempotency guard prevents generateReport() from being called
  // multiple times which caused infinite re-render loop
  const hasGeneratedRef = useRef(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer for progress
  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsed((current) => {
        const next = current + 100;
        if (next >= TOTAL_DURATION) {
          window.clearInterval(timer);
          return TOTAL_DURATION;
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, []);

  // Rotating insights
  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentInsight((i) => (i + 1) % microcopy.length);
    }, 2500);

    return () => window.clearInterval(interval);
  }, []);

  // If report is already generated, skip analyzing and redirect immediately
  useEffect(() => {
    if (!state.reportGenerated || !state.report) return;
    if (redirectTimerRef.current) return;
    redirectTimerRef.current = window.setTimeout(() => {
      router.push("/assessment/report");
    }, 500);
    return () => {
      if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
    };
  }, [state.reportGenerated, state.report, router]);

  // Generate report and redirect — runs only once (guarded by ref)
  useEffect(() => {
    if (elapsed < TOTAL_DURATION) return;
    if (hasGeneratedRef.current) return;
    if (!state.websiteUrl) return;
    if (state.reportGenerated) return;

    hasGeneratedRef.current = true;
    generateReport();

    redirectTimerRef.current = window.setTimeout(() => {
      router.push("/assessment/report");
    }, 1000);

    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, [elapsed, state.websiteUrl, state.reportGenerated, router, generateReport]);

  const progress = (elapsed / TOTAL_DURATION) * 100;
  const activeStepIndex = Math.min(
    analysisSteps.length - 1,
    Math.floor((elapsed / TOTAL_DURATION) * analysisSteps.length)
  );

  const websiteUrl = state.websiteUrl || "yourstartup.com";

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171513]" data-theme="public">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-[640px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="mb-10 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd0] bg-white/92 px-4 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.2em] text-[#ff6b3d]">
              <LoaderCircle className="size-3 animate-spin" />
              Analyzing your startup
            </div>
            <h1 className="mt-5 text-[32px] font-semibold leading-[1.12] tracking-[-0.04em] text-[#171513] sm:text-[40px]">
              Fundme is analyzing your
              <br />
              <span className="text-[#ff6b3d]">funding readiness</span>
            </h1>
          </motion.div>

          <div className="mb-10">
            <div className="h-1.5 rounded-full bg-[#e7ddd0]">
              <motion.div
                className="h-full rounded-full bg-[#ff6b3d]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="mt-3 flex justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-[#8b8276]">
              <span>{Math.round(progress)}% complete</span>
              <span>{microcopy[currentInsight]}</span>
            </div>
          </div>

          <div className="mb-10 grid gap-4 sm:grid-cols-3">
            <WebsiteCard websiteUrl={websiteUrl} />
            <FounderSignalCard />
            <OpportunityCard />
          </div>

          <div className="space-y-2.5">
            {analysisSteps.map((step, index) => {
              const isDone = index < activeStepIndex;
              const isActive = index === activeStepIndex;

              return (
                <motion.div
                  key={step}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT, delay: index * 0.05 }}
                  className={`flex items-center gap-4 rounded-[14px] border px-5 py-3.5 transition-all duration-300 ${
                    isDone
                      ? "border-transparent bg-black/[0.02] opacity-60"
                      : isActive
                      ? "border-[#ff6b3d]/20 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                      : "border-black/[0.05] bg-transparent opacity-30"
                  }`}
                >
                  {isDone ? (
                    <div className="flex size-7 items-center justify-center rounded-full bg-[#22c55e] text-white">
                      <CheckCircle2 className="size-3.5" />
                    </div>
                  ) : isActive ? (
                    <div className="flex size-7 items-center justify-center rounded-full border-2 border-[#ff6b3d] border-t-transparent">
                      <LoaderCircle className="size-3.5 animate-spin text-[#ff6b3d]" />
                    </div>
                  ) : (
                    <div className="flex size-7 items-center justify-center rounded-full border border-[#d9cbbd]">
                      <span className="size-1.5 rounded-full bg-[#d9cbbd]" />
                    </div>
                  )}
                  <span className={`text-[14px] font-medium ${isActive ? "text-[#171513]" : "text-[#6f685f]"}`}>
                    {step}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
