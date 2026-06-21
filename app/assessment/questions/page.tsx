"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";
import { ArrowRight, CheckCircle2, ArrowLeft, Sparkles } from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { useAssessment } from "@/components/assessment/assessment-provider";
import { EASE_OUT } from "@/lib/animations";

/* ─── Question Data ───────────────────────────────────────────── */

interface Question {
  id: number;
  text: string;
  purpose: string;
  options: string[];
}

const questions: Question[] = [
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

/* ─── Animation Variants ──────────────────────────────────────── */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

/* ─── Question Screen ───────────────────────────────────────────── */

export default function AssessmentQuestionsPage() {
  const router = useRouter();
  const { state, setAnswer, getAnswerForQuestion } = useAssessment();
  const shouldReduceMotion = useSafeReducedMotion();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentQuestion = questions[currentStep];
  const totalQuestions = questions.length;
  const progress = ((currentStep + 1) / totalQuestions) * 100;

  // Preload answer if exists
  useEffect(() => {
    const saved = getAnswerForQuestion(currentQuestion.id);
    if (saved) setSelectedOption(saved);
    else setSelectedOption(null);
  }, [currentStep, currentQuestion.id, getAnswerForQuestion]);

  function handleOptionSelect(option: string) {
    setSelectedOption(option);
    setAnswer(currentQuestion.id, option);
  }

  function handleNext() {
    if (!selectedOption) return;
    if (currentStep < totalQuestions - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
      setSelectedOption(null);
    } else {
      // All questions answered, go to analyzing
      router.push("/assessment/analyzing");
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }

  const savedAnswer = getAnswerForQuestion(currentQuestion.id);

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171513]" data-theme="public">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e7ddd0] bg-[#f6f1ea]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-4 sm:px-6 xl:px-8 py-3">
          <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#8b8276]">
            Question {currentStep + 1} of {totalQuestions}
          </div>
          <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#ff6b3d]">
            Fundme Assessment
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-16 sm:px-6">
        <div className="w-full max-w-[640px]">
          {/* Progress bar */}
          <div className="mb-10">
            <div className="h-1 rounded-full bg-[#e7ddd0]">
              <motion.div
                className="h-full rounded-full bg-[#ff6b3d]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-[#8b8276]">
              <span>Funding readiness</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              variants={shouldReduceMotion ? undefined : slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              <div className="mb-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd0] bg-white/92 px-3 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.18em] text-[#8b8276]">
                  <Sparkles className="size-3 text-[#ff6b3d]" />
                  {currentQuestion.purpose}
                </span>
              </div>

              <h2 className="text-[26px] font-semibold leading-[1.2] tracking-[-0.04em] text-[#171513] sm:text-[32px]">
                {currentQuestion.text}
              </h2>

              <div className="mt-8 space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOption === option || savedAnswer === option;
                  return (
                    <motion.button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                      className={`flex w-full items-center gap-4 rounded-[14px] border px-5 py-4 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-[#ff6b3d]/30 bg-[#fff5f0] shadow-[0_4px_20px_rgba(255,107,61,0.08)]"
                          : "border-black/[0.08] bg-white hover:border-[#ff6b3d]/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                      }`}
                    >
                      <div
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          isSelected
                            ? "border-[#ff6b3d] bg-[#ff6b3d]"
                            : "border-[#d9cbbd] bg-white"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="size-3.5 text-white" />}
                      </div>
                      <span className="text-[15px] font-medium text-[#171513]">{option}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[14px] font-medium text-[#6f685f] transition-colors hover:text-[#171513] disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <motion.button
              onClick={handleNext}
              disabled={!selectedOption && !savedAnswer}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#171513] px-7 text-[14px] font-medium text-white shadow-[0_12px_32px_rgba(18,15,11,0.12)] transition-colors hover:bg-[#2a2622] disabled:opacity-40 disabled:pointer-events-none"
            >
              {currentStep === totalQuestions - 1 ? "See my report" : "Next"}
              <ArrowRight className="size-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </main>
  );
}
