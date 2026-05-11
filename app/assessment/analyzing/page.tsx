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
  Activity
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

const scanSteps = [
  { id: "read", label: "Reading website", icon: Globe },
  { id: "position", label: "Mapping position", icon: Target },
  { id: "signal", label: "Founder signal", icon: User },
  { id: "readiness", label: "Startup clarity", icon: Lightbulb },
  { id: "matching", label: "Opportunity fit", icon: Search },
];

const realityChecks = [
  {
    id: "A",
    title: "Founders often fail before they even hit 'Submit'.",
    body: "Most rejections happen because of 'mismatched signal'. You apply for a growth grant with a seed deck, or a tech accelerator with a services website.",
    insight: "We're scanning your materials to ensure your signal matches the stage.",
    icon: Shield,
    triggerAt: 3, // After question 2
  },
  {
    id: "B",
    title: "Your website is your first interview.",
    body: "Accelerators spend an average of 45 seconds on your homepage before deciding to read your deck. If they don't get it in 15, they're already leaning towards 'No'.",
    insight: "Identifying the core friction in your current positioning.",
    icon: Layout,
    triggerAt: 5, // After question 4
  },
  {
    id: "C",
    title: "The 'Traction' trap.",
    body: "Investors don't just want numbers; they want a story of inevitability. Even low-traction startups win when they demonstrate a clear, compounding path to growth.",
    insight: "Mapping your current proof points to the 'Inevitability Scale'.",
    icon: LineChart,
    triggerAt: 8, // After question 7
  },
  {
    id: "D",
    title: "The Intelligence layer is almost complete.",
    body: "We've mapped your startup against the criteria of 1,200+ active programs. Your final report is being synthesized with a specific focus on your highest-probability matches.",
    insight: "Finalizing your verdict and funding readiness score.",
    icon: BrainCircuit,
    triggerAt: 11, // After question 10
  }
];

function ProgressHeader({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[60] px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-[600px]">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/40 border border-black/[0.03] shadow-sm">
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

function ScanStatus({ activeId }: { activeId: string }) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-12">
      {scanSteps.map((step) => {
        const Icon = step.icon;
        const isActive = step.id === activeId;
        const isDone = scanSteps.findIndex(s => s.id === step.id) < scanSteps.findIndex(s => s.id === activeId);
        
        return (
          <div key={step.id} className="flex flex-col items-center gap-2">
            <div className={`flex size-10 items-center justify-center rounded-xl transition-all duration-500 ${
              isActive ? "bg-[#ff6b3d] text-white shadow-lg scale-110" : 
              isDone ? "bg-[#22c55e] text-white" : "bg-white/60 text-[#b5ad9f] border border-black/[0.05]"
            }`}>
              <Icon className="size-5" />
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest text-center whitespace-nowrap ${isActive ? "text-[#171513]" : "text-[#b5ad9f]"}`}>
              {step.label.split(" ")[1] || step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AssessmentAnalyzingPage() {
  const router = useRouter();
  const { state, generateReport, setAnswer, getAnswerForQuestion } = useAssessment();
  const shouldReduceMotion = useReducedMotion();

  const [progress, setProgress] = useState(0);
  const [activeScanId, setActiveScanId] = useState("read");
  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [isRealityActive, setIsRealityActive] = useState(false);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // Total steps: 1 (start) + 10 questions + 4 reality + 1 final = 16 steps
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const hasGeneratedRef = useRef(false);
  const totalSteps = 16;

  // Sync scan ID with progress
  useEffect(() => {
    if (progress < 20) setActiveScanId("read");
    else if (progress < 40) setActiveScanId("position");
    else if (progress < 60) setActiveScanId("signal");
    else if (progress < 80) setActiveScanId("readiness");
    else setActiveScanId("matching");
  }, [progress]);

  // Initial scan start
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
    
    // Safety check to prevent going past final synthesis
    if (nextIndex > totalSteps - 1) {
      if (!hasGeneratedRef.current && state.websiteUrl) {
        hasGeneratedRef.current = true;
        generateReport();
        setTimeout(() => router.push("/assessment/report"), 1500);
      }
      return;
    }

    setCurrentStepIndex(nextIndex);
    setProgress((nextIndex / (totalSteps - 1)) * 100);

    // Final synthesis step logic
    if (nextIndex === totalSteps - 1) {
      // Stay on scanning view for synthesis
      setIsQuestionActive(false);
      setIsRealityActive(false);
      
      if (!hasGeneratedRef.current && state.websiteUrl) {
        hasGeneratedRef.current = true;
        generateReport();
        setTimeout(() => router.push("/assessment/report"), 2000);
      }
      return;
    }

    // Check for Reality Check
    const reality = realityChecks.find(r => r.triggerAt === nextIndex);
    if (reality) {
      setIsRealityActive(true);
      return;
    }

    // Check for Question
    const questionSequence = [1, 2, 4, 6, 7, 9, 10, 12, 13, 14];
    const questionIdIndex = questionSequence.indexOf(nextIndex);
    
    if (questionIdIndex !== -1) {
      setIsQuestionActive(true);
      setSelectedOption(null);
    } else {
      // Auto-progress system steps
      setTimeout(handleNextStep, 2000);
    }
  }, [currentStepIndex, router, state.websiteUrl, generateReport, totalSteps]);

  function handleAnswer(option: string) {
    setSelectedOption(option);
    const questionSequence = [1, 2, 4, 6, 7, 9, 10, 12, 13, 14];
    const questionId = questionSequence.indexOf(currentStepIndex) + 1;
    setAnswer(questionId, option);
    
    setTimeout(() => {
      setIsQuestionActive(false);
      handleNextStep();
    }, 600);
  }

  function handleRealityContinue() {
    setIsRealityActive(false);
    handleNextStep();
  }

  const currentQuestionId = [1, 2, 4, 6, 7, 9, 10, 12, 13, 14].indexOf(currentStepIndex) + 1;
  const currentReality = realityChecks.find(r => r.triggerAt === currentStepIndex);

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171513] overflow-x-hidden" data-theme="public">
      <ProgressHeader progress={progress} />

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-20 sm:px-6">
        <div className="w-full max-w-[540px]">
          
          <AnimatePresence mode="wait">
            {isQuestionActive ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="w-full"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6b3d]">
                    <Terminal className="size-3.5" />
                    System Input Required
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b5ad9f]">
                    {currentQuestionId} / 10
                  </div>
                </div>

                <h2 className="instrument-serif text-[32px] italic leading-[1.15] text-[#171513] sm:text-[40px] mb-8">
                  {assessmentQuestions[currentQuestionId - 1].text}
                </h2>

                <div className="space-y-3">
                  {assessmentQuestions[currentQuestionId - 1].options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`group flex w-full items-center justify-between rounded-[24px] border p-6 transition-all duration-300 ${
                        selectedOption === option
                          ? "border-[#ff6b3d] bg-white shadow-[0_12px_32px_rgba(255,107,61,0.08)] ring-1 ring-[#ff6b3d]"
                          : "border-black/[0.06] bg-white/60 hover:bg-white hover:border-black/[0.12]"
                      }`}
                    >
                      <span className={`text-[17px] font-medium transition-colors ${selectedOption === option ? "text-[#171513]" : "text-[#6f685f]"}`}>
                        {option}
                      </span>
                      <div className={`flex size-6 items-center justify-center rounded-full border transition-all ${
                        selectedOption === option ? "border-[#ff6b3d] bg-[#ff6b3d] text-white" : "border-black/[0.1] group-hover:border-black/[0.2]"
                      }`}>
                        {selectedOption === option ? <CheckCircle2 className="size-3.5" /> : <ArrowRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : isRealityActive ? (
              <motion.div
                key="reality"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
                className="w-full"
              >
                <div className="rounded-[40px] border border-black/[0.05] bg-white p-8 sm:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.06)] text-center">
                  <div className="mx-auto mb-8 flex size-16 items-center justify-center rounded-2xl bg-[#f6f1ea] text-[#ff6b3d]">
                    {currentReality && <currentReality.icon className="size-8" />}
                  </div>

                  <h2 className="instrument-serif text-[28px] italic leading-[1.2] text-[#171513] sm:text-[36px] mb-6">
                    {currentReality?.title}
                  </h2>
                  
                  <p className="text-[17px] leading-relaxed text-[#6f685f] mb-8">
                    {currentReality?.body}
                  </p>

                  <div className="mb-10 rounded-2xl bg-[#ff6b3d]/[0.03] border border-[#ff6b3d]/10 p-5">
                    <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#ff6b3d] mb-2">
                      <Zap className="size-3.5" />
                      Scan Insight
                    </div>
                    <p className="text-[14px] font-medium text-[#171513]">
                      {currentReality?.insight}
                    </p>
                  </div>

                  <button
                    onClick={handleRealityContinue}
                    className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#171513] px-10 text-[16px] font-bold text-white shadow-xl transition-all hover:bg-black active:scale-95"
                  >
                    I understand
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
                <ScanStatus activeId={activeScanId} />

                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd0] bg-white/92 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6b3d]">
                    <Activity className="size-3.5 animate-pulse" />
                    Intelligent Analysis
                  </div>
                  
                  <h1 className="instrument-serif text-[36px] italic leading-[1.1] text-[#171513] sm:text-[48px]">
                    {progress < 30 ? "Initializing environment..." : 
                     progress < 60 ? "Deconstructing signals..." :
                     progress < 90 ? "Identifying opportunity..." : "Synthesizing verdict..."}
                  </h1>

                  <div className="mt-12 flex justify-center">
                    <div className="relative flex size-24 items-center justify-center">
                      <motion.div 
                        className="absolute inset-0 rounded-full border-2 border-black/[0.05]" 
                      />
                      <motion.div 
                        className="absolute inset-0 rounded-full border-2 border-t-[#ff6b3d] border-r-transparent border-b-transparent border-l-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                      <BrainCircuit className="size-10 text-[#ff6b3d]/40" />
                    </div>
                  </div>

                  <p className="mt-8 text-[15px] font-medium text-[#8b8276] uppercase tracking-[0.15em]">
                    Compiling your founder signature...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </main>
  );
}
