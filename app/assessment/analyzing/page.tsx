"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LoaderCircle,
  Globe,
  User,
  Target,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Fingerprint
} from "lucide-react";

import { useAssessment } from "@/components/assessment/assessment-provider";
import { EASE_OUT } from "@/lib/animations";

/* ─── Question Data (Mirrored from questions/page.tsx) ────────── */

interface Question {
  id: number;
  text: string;
  purpose: string;
  options: string[];
}

const assessmentQuestions: Question[] = [
  {
    id: 1,
    text: "Which opportunities have you seriously considered applying to?",
    purpose: "Create familiarity.",
    options: [
      "Y Combinator",
      "Antler",
      "Google for Startups",
      "Government grants",
      "Student founder programs",
      "I do not know where to start",
    ],
  },
  {
    id: 2,
    text: "How many applications have you sent so far?",
    purpose: "Reveal current effort and friction.",
    options: [
      "None yet",
      "1 to 3",
      "4 to 10",
      "More than 10",
      "I have applied, but without a clear system",
    ],
  },
  {
    id: 3,
    text: "Have you been rejected, ignored, or ghosted before?",
    purpose: "Trigger pain without being insulting.",
    options: [
      "Yes, by accelerators",
      "Yes, by investors",
      "Yes, by grants or programs",
      "Not yet, but I am worried",
      "No, I am just starting",
    ],
  },
  {
    id: 4,
    text: "What usually blocks you from applying?",
    purpose: "Identify the user's highest friction point.",
    options: [
      "I do not know where I fit",
      "My deck is not ready",
      "My website does not explain the startup well",
      "I do not know what to write",
      "I do not know what each program wants",
      "I keep rewriting the same story",
    ],
  },
  {
    id: 5,
    text: "What are you least confident about right now?",
    purpose: "Prime the paid fix.",
    options: [
      "Founder profile",
      "Startup idea",
      "Website positioning",
      "Pitch deck",
      "Traction story",
      "Application answers",
    ],
  },
  {
    id: 6,
    text: "Have you raised funding before?",
    purpose: "Segment user maturity.",
    options: [
      "No",
      "Friends and family",
      "Grants or competitions",
      "Angel investors",
      "VC or institutional capital",
      "Revenue funded so far",
    ],
  },
  {
    id: 7,
    text: "What materials do you already have?",
    purpose: "Route assessment products.",
    options: [
      "Website",
      "Pitch deck",
      "LinkedIn profile",
      "Startup memo",
      "Application answers",
      "Nothing clean yet",
    ],
  },
  {
    id: 8,
    text: "How soon do you want funding or program acceptance?",
    purpose: "Measure urgency.",
    options: [
      "This week",
      "This month",
      "Next 3 months",
      "Later this year",
      "I am exploring",
    ],
  },
  {
    id: 9,
    text: "What do you want Fundme to help with first?",
    purpose: "Route next best action.",
    options: [
      "Tell me what is weak",
      "Find the right opportunities",
      "Fix my profile",
      "Improve my deck",
      "Draft applications",
      "Build a fundraising plan",
    ],
  },
  {
    id: 10,
    text: "If Fundme could fix one thing today, what should it be?",
    purpose: "Define conversion CTA.",
    options: [
      "Founder profile",
      "Startup positioning",
      "Website copy",
      "Pitch deck",
      "Application answers",
      "Funding opportunity map",
    ],
  },
];

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
  const { state, generateReport, setAnswer, getAnswerForQuestion } = useAssessment();
  const shouldReduceMotion = useReducedMotion();

  const [elapsed, setElapsed] = useState(0);
  const [currentInsight, setCurrentInsight] = useState(0);
  const TOTAL_DURATION = 15000; // Longer to account for questions

  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const hasGeneratedRef = useRef(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer for progress - pauses when question is active
  useEffect(() => {
    if (isQuestionActive) return;

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
  }, [isQuestionActive]);

  // Logic to trigger questions at specific intervals
  useEffect(() => {
    const progress = (elapsed / TOTAL_DURATION) * 100;
    
    // Trigger questions at 20%, 40%, 60%, 80%, etc.
    // We have 10 questions, let's space them out
    const nextQuestionIndex = Math.floor(progress / 9); // Roughly 10 segments
    
    if (nextQuestionIndex > currentQuestionIndex && nextQuestionIndex <= assessmentQuestions.length) {
      const qIndex = nextQuestionIndex - 1;
      const q = assessmentQuestions[qIndex];
      
      // Check if already answered
      if (!getAnswerForQuestion(q.id)) {
        setIsQuestionActive(true);
        setCurrentQuestionIndex(nextQuestionIndex);
        setSelectedOption(null);
      } else {
        // Skip if already answered
        setCurrentQuestionIndex(nextQuestionIndex);
      }
    }
  }, [elapsed, currentQuestionIndex, getAnswerForQuestion]);

  // Rotating insights
  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentInsight((i) => (i + 1) % microcopy.length);
    }, 2500);

    return () => window.clearInterval(interval);
  }, []);

  // Generate report when finished
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
      if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
    };
  }, [elapsed, state.websiteUrl, state.reportGenerated, router, generateReport]);

  const progressValue = (elapsed / TOTAL_DURATION) * 100;
  const activeStepIndex = Math.min(
    analysisSteps.length - 1,
    Math.floor((elapsed / TOTAL_DURATION) * analysisSteps.length)
  );

  function handleAnswer(option: string) {
    setSelectedOption(option);
    const q = assessmentQuestions[currentQuestionIndex - 1];
    setAnswer(q.id, option);
    
    // Small delay before resuming
    setTimeout(() => {
      setIsQuestionActive(false);
    }, 600);
  }

  const websiteUrl = state.websiteUrl || "yourstartup.com";

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171513]" data-theme="public">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-[640px]">
          
          <AnimatePresence mode="wait">
            {!isQuestionActive ? (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              >
                <div className="mb-10 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd0] bg-white/92 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#ff6b3d]">
                    <LoaderCircle className="size-3 animate-spin" />
                    Deep Scanning...
                  </div>
                  <h1 className="mt-5 text-[32px] font-semibold leading-[1.12] tracking-[-0.04em] text-[#171513] sm:text-[40px]">
                    Fundme is scanning your
                    <br />
                    <span className="text-[#ff6b3d]">startup signature</span>
                  </h1>
                </div>

                <div className="mb-10">
                  <div className="h-1.5 rounded-full bg-[#e7ddd0]">
                    <motion.div
                      className="h-full rounded-full bg-[#ff6b3d]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressValue}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                  <div className="mt-3 flex justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-[#8b8276]">
                    <span>{Math.round(progressValue)}% complete</span>
                    <span className="text-right">{microcopy[currentInsight]}</span>
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
                      <div
                        key={step}
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
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="w-full"
              >
                <div className="rounded-[32px] border border-black/[0.05] bg-white/90 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f1ea] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8b8276]">
                      <BrainCircuit className="size-3 text-[#ff6b3d]" />
                      Refining Diagnosis
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#b5ad9f]">
                      Step {currentQuestionIndex} / 10
                    </div>
                  </div>

                  <h2 className="text-[24px] font-semibold leading-[1.2] tracking-[-0.04em] text-[#171513] sm:text-[28px]">
                    {assessmentQuestions[currentQuestionIndex - 1].text}
                  </h2>
                  <p className="mt-3 text-[14px] text-[#6f685f]">
                    Required to sharpen your funding readiness report.
                  </p>

                  <div className="mt-8 space-y-3">
                    {assessmentQuestions[currentQuestionIndex - 1].options.map((option) => {
                      const isSelected = selectedOption === option;
                      return (
                        <button
                          key={option}
                          onClick={() => handleAnswer(option)}
                          className={`flex w-full items-center justify-between rounded-[16px] border px-5 py-4 transition-all duration-200 ${
                            isSelected
                              ? "border-[#ff6b3d] bg-[#ff6b3d]/5 ring-1 ring-[#ff6b3d]"
                              : "border-black/[0.08] bg-white hover:border-[#ff6b3d]/30"
                          }`}
                        >
                          <span className={`text-[15px] font-medium ${isSelected ? "text-[#171513]" : "text-[#6f685f]"}`}>
                            {option}
                          </span>
                          {isSelected ? (
                            <CheckCircle2 className="size-5 text-[#ff6b3d]" />
                          ) : (
                            <ArrowRight className="size-4 text-[#b5ad9f]" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex items-center gap-3 rounded-2xl bg-black/[0.02] p-4 border border-black/[0.04]">
                    <ShieldCheck className="size-4 text-[#22c55e]" />
                    <span className="text-[11px] font-medium text-[#8b8276] uppercase tracking-wider">
                      Analysis Paused — Interaction required
                    </span>
                  </div>
                </div>

                <div className="mt-12 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="size-5 text-[#ff6b3d]/20" />
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#d9cbbd] to-transparent" />
                    <div className="size-1.5 rounded-full bg-[#ff6b3d]" />
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#d9cbbd] to-transparent" />
                    <Fingerprint className="size-5 text-[#ff6b3d]/20" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </main>
  );
}
