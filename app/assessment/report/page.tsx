"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Lock,
  Sparkles,
  Globe,
  User,
  Lightbulb,
  FileText,
  Eye,
  CheckCircle2,
  Target,
} from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { useAssessment } from "@/components/assessment/assessment-provider";
import { EASE_OUT } from "@/lib/animations";

/* ─── Score Ring Component ────────────────────────────────────── */

function ScoreRing({ score, label, color = "#ff6b3d" }: { score: number; label: string; color?: string }) {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex size-24 items-center justify-center">
        <svg className="size-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#eee3d6" strokeWidth="5" />
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={shouldReduceMotion ? false : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: EASE_OUT, delay: 0.3 }}
          />
        </svg>
        <span className="absolute text-[22px] font-semibold text-[#171513]">{score}</span>
      </div>
      <span className="text-center text-[11px] font-medium uppercase tracking-[0.1em] text-[#8b8276]">
        {label}
      </span>
    </div>
  );
}

/* ─── Weakness Card ───────────────────────────────────────────── */

function WeaknessCard({
  title,
  whyItHurts,
  quickHint,
}: {
  title: string;
  whyItHurts: string;
  quickHint: string;
}) {
  return (
    <div className="rounded-[16px] border border-black/[0.08] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff5f0] text-[#ff6b3d]">
          <Eye className="size-4" />
        </div>
        <div className="flex-1">
          <h4 className="text-[15px] font-semibold text-[#171513]">{title}</h4>
          <p className="mt-1 text-[13px] leading-[1.7] text-[#6f685f]">{whyItHurts}</p>
          <div className="mt-3 rounded-[10px] border border-black/[0.05] bg-[#f6f1ea]/60 px-4 py-3">
            <p className="text-[12px] leading-[1.7] text-[#8b8276]">
              <span className="font-medium text-[#6f685f]">Hint:</span> {quickHint}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Locked Opportunity Preview ───────────────────────────────── */

function LockedMatchPreview({
  name,
  reason,
}: {
  name: string;
  reason: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[16px] border border-black/[0.08] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-[15px] font-semibold text-[#171513]">{name}</h4>
          <p className="mt-1 text-[13px] leading-[1.7] text-[#6f685f]">{reason}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f6f1ea] text-[#8b8276]">
          <Lock className="size-4" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#f6f1ea]/40 backdrop-blur-[1px]">
        <div className="rounded-full border border-black/[0.08] bg-white/80 px-4 py-2 text-[12px] font-medium text-[#6f685f]">
          <Lock className="mr-1.5 inline-block size-3" />
          Unlock to see full details
        </div>
      </div>
    </div>
  );
}

/* ─── Main Report Page ────────────────────────────────────────── */

export default function AssessmentReportPage() {
  const { state } = useAssessment();
  const shouldReduceMotion = useReducedMotion();

  const report = state.report;

  if (!report) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1ea]">
        <div className="text-center">
          <p className="text-[14px] text-[#6f685f]">Report not ready. Complete the assessment first.</p>
        </div>
      </main>
    );
  }

  const { readinessScore, verdict, subscores, weaknesses, founderAssessment, startupAssessment, websiteAssessment, missingProofPoints, opportunityCategories, lockedMatchesPreview } = report;

  return (
    <main className="min-h-screen bg-[#f6f1ea] pb-16 text-[#171513]" data-theme="public">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#e7ddd0] bg-[#f6f1ea]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-4 sm:px-6 xl:px-8 py-3">
          <Link href="/">
            <BrandLockup />
          </Link>
          <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#ff6b3d]">
            Your Report
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[800px] px-4 pt-10 sm:px-6 lg:pt-14">
        {/* Score Hero */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd0] bg-white/92 px-4 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.2em] text-[#8b8276]">
            <Sparkles className="size-3 text-[#ff6b3d]" />
            Funding Readiness Report
          </div>

          {/* Main Score */}
          <div className="mt-8 flex flex-col items-center">
            <div className="relative flex size-40 items-center justify-center">
              <svg className="size-40 -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="68" fill="none" stroke="#eee3d6" strokeWidth="8" />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="none"
                  stroke="#ff6b3d"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 68}
                  initial={shouldReduceMotion ? false : { strokeDashoffset: 2 * Math.PI * 68 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 68 - (readinessScore / 100) * 2 * Math.PI * 68 }}
                  transition={{ duration: 2, ease: EASE_OUT, delay: 0.2 }}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-[48px] font-semibold leading-none tracking-[-0.04em] text-[#171513]">{readinessScore}</span>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#8b8276]">out of 100</p>
              </div>
            </div>
          </div>

          {/* Verdict */}
          <h1 className="mt-6 text-[28px] font-semibold leading-[1.15] tracking-[-0.04em] text-[#171513] sm:text-[34px]">
            {verdict}
          </h1>
        </motion.section>

        {/* Subscores */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="mb-6 text-[18px] font-semibold tracking-[-0.03em] text-[#171513]">Breakdown</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <ScoreRing score={subscores.founderCredibility} label="Founder" />
            <ScoreRing score={subscores.startupClarity} label="Clarity" />
            <ScoreRing score={subscores.tractionProof} label="Traction" />
            <ScoreRing score={subscores.marketFit} label="Market Fit" />
            <ScoreRing score={subscores.applicationReadiness} label="Application" />
            <ScoreRing score={subscores.opportunityFit} label="Opportunity" />
          </div>
        </motion.section>

        {/* Top Weaknesses */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="mb-6 text-[18px] font-semibold tracking-[-0.03em] text-[#171513]">Top Weaknesses</h2>
          <div className="space-y-4">
            {weaknesses.map((w) => (
              <WeaknessCard key={w.title} title={w.title} whyItHurts={w.whyItHurts} quickHint={w.quickHint} />
            ))}
          </div>
        </motion.section>

        {/* Assessments */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.4 }}
          className="mb-12 space-y-4"
        >
          <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-[#171513]">Assessments</h2>

          <div className="rounded-[16px] border border-black/[0.08] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-8 items-center justify-center rounded-[10px] bg-[#f5f0ff] text-[#8b5cf6]">
                <User className="size-4" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#171513]">Founder Assessment</h3>
            </div>
            <p className="text-[14px] leading-[1.8] text-[#6f685f]">{founderAssessment}</p>
          </div>

          <div className="rounded-[16px] border border-black/[0.08] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-8 items-center justify-center rounded-[10px] bg-[#f0f7ff] text-[#60a5fa]">
                <Lightbulb className="size-4" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#171513]">Startup Assessment</h3>
            </div>
            <p className="text-[14px] leading-[1.8] text-[#6f685f]">{startupAssessment}</p>
          </div>

          <div className="rounded-[16px] border border-black/[0.08] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-8 items-center justify-center rounded-[10px] bg-[#f0fff4] text-[#22c55e]">
                <Globe className="size-4" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#171513]">Website Assessment</h3>
            </div>
            <p className="text-[14px] leading-[1.8] text-[#6f685f]">{websiteAssessment}</p>
          </div>
        </motion.section>

        {/* Missing Proof Points */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="mb-6 text-[18px] font-semibold tracking-[-0.03em] text-[#171513]">Missing Proof Points</h2>
          <div className="rounded-[16px] border border-black/[0.08] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <ul className="space-y-3">
              {missingProofPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[14px] text-[#6f685f]">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#fff5f0] text-[#ff6b3d]">
                    <Target className="size-3" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* Opportunity Categories */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.55 }}
          className="mb-12"
        >
          <h2 className="mb-6 text-[18px] font-semibold tracking-[-0.03em] text-[#171513]">Best Opportunity Categories</h2>
          <div className="flex flex-wrap gap-2">
            {opportunityCategories.map((cat) => (
              <span key={cat} className="rounded-full border border-black/[0.08] bg-white px-4 py-2 text-[13px] font-medium text-[#171513]">
                {cat}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Locked Matches Preview */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="mb-6 text-[18px] font-semibold tracking-[-0.03em] text-[#171513]">Matched Opportunities (Locked)</h2>
          <div className="space-y-4">
            {lockedMatchesPreview.map((match) => (
              <LockedMatchPreview key={match.name} name={match.name} reason={match.reason} />
            ))}
          </div>
        </motion.section>

        {/* CTAs */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.7 }}
          className="sticky bottom-6 z-50 mt-12 rounded-[20px] border border-black/[0.08] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <h3 className="text-[16px] font-semibold text-[#171513]">Your diagnosis is ready. The fixes are locked.</h3>
              <p className="mt-1 text-[13px] leading-[1.7] text-[#6f685f]">
                Fundme found the gaps hurting your funding readiness. Unlock the improved profile, website fix prompts, matched opportunities, and application drafts.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3">
              <motion.button
                whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#ff6b3d] px-7 text-[14px] font-medium text-white shadow-[0_12px_32px_rgba(255,107,61,0.24)] transition-colors hover:bg-[#f45d2e]"
              >
                Fix this for me
                <ArrowRight className="size-4" />
              </motion.button>
              <button className="text-[13px] font-medium text-[#6f685f] transition-colors hover:text-[#171513]">
                Continue with free report
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
