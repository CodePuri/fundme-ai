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
  Fingerprint,
  Lightbulb,
  Shield,
  Zap,
  Layout,
  Search,
  Lock,
  LineChart,
  Terminal,
  Activity,
  ArrowLeft,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  CircleDot,
  X
} from "lucide-react";

import { useAssessment } from "@/components/assessment/assessment-provider";
import { EASE_OUT } from "@/lib/animations";

/* ─── Question Data ────────── */

interface Question {
  id: number;
  text: string;
  purpose: string;
  icon: any;
  options: string[];
}

const assessmentQuestions: Question[] = [
  {
    id: 1,
    text: "Which opportunities have you seriously considered applying to?",
    purpose: "Create familiarity.",
    icon: Search,
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
    purpose: "Reveal current effort.",
    icon: BarChart3,
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
    icon: AlertTriangle,
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
    purpose: "Identify the highest friction point.",
    icon: Lock,
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
    icon: Target,
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
    icon: TrendingUp,
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
    icon: Layout,
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
    icon: Zap,
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
    icon: BrainCircuit,
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
    icon: Sparkles,
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

const scanSteps = [
  { id: "read", label: "Reading website", icon: Globe },
  { id: "position", label: "Mapping position", icon: Target },
  { id: "signal", label: "Founder signal", icon: User },
  { id: "readiness", label: "Startup clarity", icon: Lightbulb },
  { id: "matching", label: "Opportunity fit", icon: Search },
];

/* ─── Sharper Founder Psychology Cards ── */

const founderCards = [
  {
    id: "A",
    title: "Most founders do not get rejected because the idea is bad.",
    body: "They get ignored because the signal is unclear. Programs scan 200+ applications per batch. If your positioning is ambiguous, they move on in under 15 seconds.",
    cta: "Check my signal",
    icon: Shield,
  },
  {
    id: "B",
    title: "Your website is usually the first interview.",
    body: "If the story is unclear, the deck may never get opened. Accelerators spend an average of 45 seconds on your homepage before deciding to read further.",
    cta: "Scan my positioning",
    icon: Layout,
  },
  {
    id: "C",
    title: "A good startup can still apply to the wrong program.",
    body: "Fit matters before effort. A pre-seed SaaS applying for a deep-tech grant wastes the same energy as a grant-ready startup pitching a VC. We find where you actually belong.",
    cta: "Find my fit",
    icon: Target,
  },
  {
    id: "D",
    title: "Your report will show what to fix before you apply again.",
    body: "The diagnosis is not the end. It is the starting line. We surface the gaps so you stop guessing and start fixing what actually matters for your next application.",
    cta: "Show my diagnosis",
    icon: BrainCircuit,
  },
];

/* ─── Progress Header ── */

function ProgressHeader({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[60] px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-[600px]">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/40 border border-black/[0.03] shadow-sm">
          <motion.div
            className="absolute inset-y-0 left-0 bg-[#ff6b3d] shadow-[0_0_12px_rgba(255,107,61,0.4)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Scan Status with Meaningful States ── */

const diagnosisStates = [
  { type: "strong", label: "Strong", color: "#22c55e", bg: "bg-[#22c55e]" },
  { type: "needsWork", label: "Needs work", color: "#f59e0b", bg: "bg-[#f59e0b]" },
  { type: "weak", label: "Weak", color: "#f97316", bg: "bg-[#f97316]" },
  { type: "missing", label: "Missing", color: "#9ca3af", bg: "bg-[#9ca3af]" },
];

function ScanStatus({ activeId, scanResults }: { activeId: string; scanResults: Record<string, string> }) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-10">
      {scanSteps.map((step) => {
        const Icon = step.icon;
        const isActive = step.id === activeId;
        const result = scanResults[step.id];

        return (
          <div key={step.id} className="flex flex-col items-center gap-2">
            <div className={`flex size-10 items-center justify-center rounded-xl transition-all duration-500 ${
              isActive ? "bg-[#ff6b3d] text-white shadow-lg scale-110" :
              result === "strong" ? "bg-[#22c55e] text-white" :
              result === "needsWork" ? "bg-[#f59e0b] text-white" :
              result === "weak" ? "bg-[#f97316] text-white" :
              result === "missing" ? "bg-[#9ca3af] text-white" :
              "bg-white/60 text-[#b5ad9f] border border-black/[0.05]"
            }`}>
              <Icon className="size-5" />
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest text-center leading-tight ${isActive ? "text-[#171513]" : "text-[#b5ad9f]"}`}>
              {step.label}
            </span>
            {result && (
              <span className="text-[8px] font-bold uppercase tracking-wider"
                style={{
                  color: result === "strong" ? "#22c55e" :
                         result === "needsWork" ? "#f59e0b" :
                         result === "weak" ? "#f97316" : "#9ca3af"
                }}
              >
                {result === "strong" ? "Strong" :
                 result === "needsWork" ? "Needs work" :
                 result === "weak" ? "Weak" : "Missing"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Page ── */

export default function AssessmentAnalyzingPage() {
  const router = useRouter();
  const { state, generateReport, setAnswer, getAnswerForQuestion } = useAssessment();
  const shouldReduceMotion = useReducedMotion();

  const [progress, setProgress] = useState(0);
  const [activeScanId, setActiveScanId] = useState("read");
  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [isRealityActive, setIsRealityActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<Record<string, string>>({});

  const hasGeneratedRef = useRef(false);
  const totalSteps = 16;

  useEffect(() => {
    if (progress < 20) setActiveScanId("read");
    else if (progress < 40) setActiveScanId("position");
    else if (progress < 60) setActiveScanId("signal");
    else if (progress < 80) setActiveScanId("readiness");
    else setActiveScanId("matching");
  }, [progress]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStepIndex === 0) {
        handleNextStep();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  const handleNextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;

    if (nextIndex > totalSteps - 1) {
      if (!hasGeneratedRef.current && state.websiteUrl) {
        hasGeneratedRef.current = true;
        generateReport();
        setIsComplete(true);
        setTimeout(() => router.push("/assessment/report"), 2500);
      }
      return;
    }

    setCurrentStepIndex(nextIndex);
    setProgress((nextIndex / (totalSteps - 1)) * 100);

    // Final synthesis
    if (nextIndex === totalSteps - 1) {
      setIsQuestionActive(false);
      setIsRealityActive(false);
      if (!hasGeneratedRef.current && state.websiteUrl) {
        hasGeneratedRef.current = true;
        generateReport();
        setIsComplete(true);
        setTimeout(() => router.push("/assessment/report"), 2500);
      }
      return;
    }

    // Reality check
    const realityIndexes = [1, 4, 7, 11];
    if (realityIndexes.includes(nextIndex)) {
      setIsRealityActive(true);
      return;
    }

    // Question
    const questionSequence = [2, 3, 5, 6, 8, 9, 10, 12, 13, 14];
    if (questionSequence.includes(nextIndex)) {
      setIsQuestionActive(true);
      setSelectedOption(null);
    } else {
      // Auto-progress with scan results
      const scanStepsForResult = [1, 3, 5, 7, 9];
      if (scanStepsForResult.includes(nextIndex)) {
        const results = ["strong", "needsWork", "weak", "missing"];
        const scanId = scanSteps[Math.floor((nextIndex - 1) / 2)]?.id;
        if (scanId) {
          setScanResults(prev => ({
            ...prev,
            [scanId]: results[Math.floor(Math.random() * results.length)]
          }));
        }
      }
      setTimeout(handleNextStep, 2000);
    }
  }, [currentStepIndex, router, state.websiteUrl, generateReport, totalSteps]);

  function handleAnswer(option: string) {
    setSelectedOption(option);
    const questionSequence = [2, 3, 5, 6, 8, 9, 10, 12, 13, 14];
    const questionId = questionSequence.indexOf(currentStepIndex) + 1;
    setAnswer(questionId, option);

    setTimeout(() => {
      setIsQuestionActive(false);
      handleNextStep();
    }, 400);
  }

  function handleRealityContinue() {
    setIsRealityActive(false);
    handleNextStep();
  }

  function handleBack() {
    const questionSequence = [2, 3, 5, 6, 8, 9, 10, 12, 13, 14];
    const prevIndex = currentStepIndex - 1;
    if (prevIndex > 0 && questionSequence.includes(prevIndex)) {
      setCurrentStepIndex(prevIndex);
      setProgress((prevIndex / (totalSteps - 1)) * 100);
      setSelectedOption(null);
      setIsQuestionActive(true);
    }
  }

  const questionSequence = [2, 3, 5, 6, 8, 9, 10, 12, 13, 14];
  const currentQuestionId = questionSequence.indexOf(currentStepIndex) + 1;
  const currentQuestion = currentQuestionId > 0 ? assessmentQuestions[currentQuestionId - 1] : null;
  const currentCard = founderCards[questionSequence.indexOf(currentStepIndex)];

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171513] overflow-x-hidden" data-theme="public">
      <ProgressHeader progress={progress} />

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-20 sm:px-6">
        <div className="w-full max-w-[520px]">

          <AnimatePresence mode="wait">
            {isQuestionActive && currentQuestion ? (
              <motion.div
                key={`q-${currentQuestion.id}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className="w-full"
              >
                {/* Back + counter */}
                <div className="mb-6 flex items-center justify-between">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-[#8b8276] hover:text-[#171513] transition-colors"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </button>
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#b5ad9f]">
                    {currentQuestionId} / 10
                  </span>
                </div>

                {/* Icon badge */}
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-[#fff5f0] text-[#ff6b3d]">
                    {currentQuestion.icon && <currentQuestion.icon className="size-4.5" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#ff6b3d]">
                    {currentQuestion.purpose}
                  </span>
                </div>

                <h2 className="text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-[#171513] mb-8 sm:text-[26px]">
                  {currentQuestion.text}
                </h2>

                <div className="space-y-2.5 mb-24">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedOption === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswer(option)}
                        className={`group flex w-full items-center gap-3 rounded-2xl border p-4 transition-all duration-200 ${
                          isSelected
                            ? "border-[#ff6b3d] bg-white shadow-[0_8px_24px_rgba(255,107,61,0.08)] ring-1 ring-[#ff6b3d]"
                            : "border-black/[0.06] bg-white/60 hover:bg-white hover:border-black/[0.12]"
                        }`}
                      >
                        <div className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                          isSelected ? "border-[#ff6b3d] bg-[#ff6b3d]" : "border-black/[0.15]"
                        }`}>
                          {isSelected && <CheckCircle2 className="size-3 text-white" />}
                        </div>
                        <span className={`text-left text-[14px] leading-snug transition-colors ${
                          isSelected ? "text-[#171513] font-semibold" : "text-[#6f685f] font-medium"
                        }`}>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Sticky bottom CTA - appears after selection */}
                <AnimatePresence>
                  {selectedOption && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.05] bg-[#f6f1ea]/92 backdrop-blur-xl px-4 py-4 sm:px-6"
                    >
                      <div className="mx-auto max-w-[520px]">
                        <button
                          onClick={() => {
                            setIsQuestionActive(false);
                            handleNextStep();
                          }}
                          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#171513] text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(0,0,0,0.12)] transition-all hover:bg-black active:scale-[0.98]"
                        >
                          Continue
                          <ArrowRight className="size-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

            ) : isRealityActive && currentCard ? (
              <motion.div
                key={`r-${currentCard.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="w-full"
              >
                <div className="rounded-[32px] border border-black/[0.05] bg-white p-8 sm:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.05)]">
                  <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-[#fff5f0] text-[#ff6b3d]">
                    {currentCard.icon && <currentCard.icon className="size-7" />}
                  </div>

                  <h2 className="text-[24px] font-bold leading-[1.15] tracking-[-0.03em] text-[#171513] mb-4 sm:text-[28px]">
                    {currentCard.title}
                  </h2>

                  <p className="text-[15px] leading-relaxed text-[#6f685f] mb-8">
                    {currentCard.body}
                  </p>

                  <button
                    onClick={handleRealityContinue}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#171513] text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(0,0,0,0.12)] transition-all hover:bg-black active:scale-[0.98]"
                  >
                    {currentCard.cta}
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </motion.div>

            ) : (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full text-center"
              >
                {isComplete ? (
                  /* ─── COMPLETE STATE ── */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: EASE_OUT }}
                  >
                    <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-full bg-[#22c55e]/10 border-2 border-[#22c55e]/20">
                      <CheckCircle2 className="size-10 text-[#22c55e]" />
                    </div>
                    <h2 className="text-[28px] font-bold leading-tight text-[#171513] mb-4 sm:text-[32px]">
                      Your funding profile is ready.
                    </h2>
                    <p className="text-[15px] text-[#6f685f] mb-8">
                      Redirecting to your diagnosis report...
                    </p>
                    <div className="flex justify-center">
                      <LoaderCircle className="size-6 animate-spin text-[#ff6b3d]" />
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <ScanStatus activeId={activeScanId} scanResults={scanResults} />

                    <div className="space-y-5">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd0] bg-white/92 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6b3d]">
                        <Activity className="size-3.5 animate-pulse" />
                        Diagnosis Engine
                      </div>

                      <h1 className="instrument-serif text-[32px] italic leading-[1.1] text-[#171513] sm:text-[40px]">
                        {progress < 15 ? "Reading your website..." :
                         progress < 25 ? "Deconstructing signals..." :
                         progress < 35 ? "Analyzing positioning..." :
                         progress < 50 ? "Scanning founder fit..." :
                         progress < 65 ? "Evaluating clarity..." :
                         progress < 80 ? "Identifying opportunities..." :
                         progress < 90 ? "Matching programs..." : "Synthesizing verdict..."}
                      </h1>

                      <div className="mt-10 flex justify-center">
                        <div className="relative flex size-20 items-center justify-center">
                          <motion.div className="absolute inset-0 rounded-full border-2 border-black/[0.05]" />
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-t-[#ff6b3d] border-r-transparent border-b-transparent border-l-transparent"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          />
                          <BrainCircuit className="size-8 text-[#ff6b3d]/40" />
                        </div>
                      </div>

                      <p className="text-[13px] font-medium text-[#8b8276] uppercase tracking-[0.12em]">
                        Building your founder signature profile...
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </main>
  );
}
