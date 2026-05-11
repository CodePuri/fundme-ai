"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
  X,
  Zap,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Brain as BrainCircuit
} from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { Button } from "@/components/ui/button";
import { useAssessment } from "@/components/assessment/assessment-provider";
import { EASE_OUT } from "@/lib/animations";

/* ─── Score Ring Component ────────────────────────────────────── */

function ScoreRing({ score, label, color = "#ff6b3d" }: { score: number; label: string; color?: string }) {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex size-20 items-center justify-center">
        <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#eee3d6" strokeWidth="4" />
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={shouldReduceMotion ? false : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: EASE_OUT, delay: 0.3 }}
          />
        </svg>
        <span className="absolute text-[18px] font-bold text-[#171513]">{score}</span>
      </div>
      <span className="text-center text-[10px] font-bold uppercase tracking-[0.1em] text-[#8b8276]">
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
    <div className="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fff5f0] text-[#ff6b3d]">
          <AlertCircle className="size-4.5" />
        </div>
        <div className="flex-1">
          <h4 className="text-[15px] font-bold text-[#171513]">{title}</h4>
          <p className="mt-1 text-[13px] leading-[1.6] text-[#6f685f]">{whyItHurts}</p>
          <div className="mt-3 rounded-[12px] border border-black/[0.04] bg-[#f6f1ea]/40 px-4 py-3">
            <p className="text-[12px] leading-[1.6] text-[#8b8276]">
              <span className="font-bold text-[#ff6b3d] uppercase tracking-wider text-[10px] mr-2">Action:</span> {quickHint}
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
    <div className="relative overflow-hidden rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-[15px] font-bold text-[#171513]">{name}</h4>
          <p className="mt-1 text-[13px] leading-[1.6] text-[#6f685f]">{reason}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f6f1ea] text-[#8b8276]">
          <Lock className="size-4" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
        <div className="rounded-full border border-black/[0.08] bg-white px-4 py-2 text-[11px] font-bold text-[#8b8276] uppercase tracking-wider shadow-sm">
          <Lock className="mr-1.5 inline-block size-3" />
          Locked
        </div>
      </div>
    </div>
  );
}

/* ─── Mock Paywall Modal ──────────────────────────────────────── */

function PaywallModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="relative w-full max-w-[500px] overflow-hidden rounded-[40px] border border-white/20 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Decoration */}
            <div className="h-2 w-full bg-gradient-to-r from-[#ff6b3d] via-[#ff9068] to-[#ff6b3d]" />
            
            <button
              onClick={onClose}
              className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-full bg-black/[0.03] text-[#6f685f] transition-colors hover:bg-black/[0.08] hover:text-[#171513]"
            >
              <X className="size-5" />
            </button>

            <div className="p-10 text-center">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-[#fff5f0] shadow-inner">
                <ShieldCheck className="size-10 text-[#ff6b3d]" />
              </div>
              
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f1ea] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8b8276] mb-4">
                Unlock Full Intelligence
              </div>
              
              <h2 className="text-[28px] font-bold leading-[1.1] tracking-[-0.03em] text-[#171513]">
                Your Verdict is Ready.
                <br />
                The Fixes are Locked.
              </h2>
              
              <p className="mt-4 text-[15px] leading-[1.6] text-[#6f685f]">
                Get the improved founder profile, tailored website copy, matched opportunities, and direct application drafts based on your diagnosis.
              </p>

              <div className="mt-10 space-y-4">
                <button 
                  className="w-full flex h-16 items-center justify-center gap-3 rounded-full bg-[#ff6b3d] text-[16px] font-bold text-white shadow-[0_20px_40px_rgba(255,107,61,0.25)] hover:bg-[#f45d2e] transition-all transform hover:scale-[1.02]"
                >
                  Fix this for me
                  <ArrowRight className="size-5" />
                </button>
                <Button 
                  className="w-full h-12 text-[14px] font-bold text-[#8b8276] hover:text-[#171513] transition-colors"
                  onClick={onClose}
                >
                  Continue with free report
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 border-t border-black/[0.05] pt-6 text-[11px] font-bold uppercase tracking-widest text-[#b5ad9f]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3 text-[#22c55e]" />
                  Full Report
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3 text-[#22c55e]" />
                  VC Matches
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3 text-[#22c55e]" />
                  AI Drafts
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Report Page ────────────────────────────────────────── */

export default function AssessmentReportPage() {
  const { state } = useAssessment();
  const shouldReduceMotion = useReducedMotion();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const report = state.report;

  if (!report) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6f1ea] px-4 text-center">
        <div className="size-24 mb-6 flex items-center justify-center rounded-full bg-white border border-black/[0.05] shadow-sm">
          <FileText className="size-10 text-[#b5ad9f]" />
        </div>
        <h2 className="text-[24px] font-bold text-[#171513] mb-3">No Diagnosis Found</h2>
        <p className="text-[15px] text-[#6f685f] leading-relaxed mb-8 max-w-[320px]">
          We couldn't find a recent assessment. Let's start one to see your funding readiness.
        </p>
        <Link href="/assessment">
          <button className="inline-flex h-12 items-center gap-2 rounded-full bg-[#171513] px-8 text-[14px] font-bold text-white shadow-xl transition-all hover:bg-black">
            Start Diagnosis
            <ArrowRight className="size-4" />
          </button>
        </Link>
      </main>
    );
  }

  const readinessScore = Number.isFinite(report.readinessScore) ? report.readinessScore : 0;
  const {
    verdict = "No verdict available",
    weaknesses = [],
    founderAssessment = "",
    startupAssessment = "",
    websiteAssessment = "",
    missingProofPoints = [],
    opportunityCategories = [],
    lockedMatchesPreview = [],
    subscores: rawSubscores = {},
  } = report;
  
  const subscores = {
    founderCredibility: Number.isFinite(rawSubscores.founderCredibility) ? rawSubscores.founderCredibility : 0,
    startupClarity: Number.isFinite(rawSubscores.startupClarity) ? rawSubscores.startupClarity : 0,
    tractionProof: Number.isFinite(rawSubscores.tractionProof) ? rawSubscores.tractionProof : 0,
    marketFit: Number.isFinite(rawSubscores.marketFit) ? rawSubscores.marketFit : 0,
    applicationReadiness: Number.isFinite(rawSubscores.applicationReadiness) ? rawSubscores.applicationReadiness : 0,
    opportunityFit: Number.isFinite(rawSubscores.opportunityFit) ? rawSubscores.opportunityFit : 0,
  };

  return (
    <main className="min-h-screen bg-[#f6f1ea] pb-32 text-[#171513]" data-theme="public">
      <header className={`fixed inset-x-0 top-0 z-[60] transition-all duration-300 ${scrolled ? "border-b border-[#e7ddd0] bg-[#f6f1ea]/92 backdrop-blur-xl py-3" : "bg-transparent py-5"}`}>
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 sm:px-6 xl:px-8">
          <Link href="/">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-4">
             <div className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b8276]">
              Founder: {state.startupName || "Anonymous"}
            </div>
            <button 
              onClick={() => setPaywallOpen(true)}
              className="h-10 rounded-full bg-[#171513] px-5 text-[12px] font-bold text-white shadow-lg transition-all hover:bg-black"
            >
              Unlock Fixes
            </button>
          </div>
        </div>
      </header>

      <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />

      <div className="mx-auto max-w-[840px] px-4 pt-32 sm:px-6 lg:pt-40">
        
        {/* Verdict Hero */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="mb-16"
        >
          <div className="grid gap-10 md:grid-cols-[1fr_240px] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd0] bg-white/92 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff6b3d] mb-6">
                <Sparkles className="size-3" />
                Intelligence Verdict
              </div>
              <h1 className="text-[42px] font-bold leading-[1] tracking-[-0.05em] text-[#171513] sm:text-[54px] mb-6">
                {verdict}
              </h1>
              <p className="text-[18px] leading-[1.6] text-[#6f685f] max-w-[480px]">
                We've analyzed your materials against our proprietary funding signals database. Here is your current readiness state.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-8 rounded-[40px] bg-white border border-black/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#ff6b3d]" />
              <div className="relative z-10 text-center">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b8276] mb-2">Readiness Score</div>
                <div className="text-[72px] font-bold leading-none tracking-[-0.06em] text-[#171513] mb-2">{readinessScore}</div>
                <div className="h-1.5 w-full bg-[#f6f1ea] rounded-full overflow-hidden mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${readinessScore}%` }}
                    transition={{ duration: 1.5, ease: EASE_OUT, delay: 0.5 }}
                    className="h-full bg-[#ff6b3d] rounded-full"
                  />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b3d] flex items-center justify-center gap-1.5">
                  <TrendingUp className="size-3" />
                  Top 15% Percentile
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Core Signals Breakdown */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.15em] text-[#171513]">Core Signals Breakdown</h2>
            <div className="h-px flex-1 bg-black/[0.05] ml-6" />
          </div>
          <div className="grid grid-cols-2 gap-y-10 gap-x-4 sm:grid-cols-3 lg:grid-cols-6">
            <ScoreRing score={subscores.founderCredibility} label="Founder" />
            <ScoreRing score={subscores.startupClarity} label="Clarity" />
            <ScoreRing score={subscores.tractionProof} label="Traction" />
            <ScoreRing score={subscores.marketFit} label="Market" />
            <ScoreRing score={subscores.applicationReadiness} label="App State" />
            <ScoreRing score={subscores.opportunityFit} label="Opp Fit" />
          </div>
        </motion.section>

        {/* High Prominence Fix CTA */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-20 rounded-[40px] bg-[#171513] p-10 text-white shadow-[0_30px_70px_rgba(0,0,0,0.15)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="size-40" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80 mb-6">
              AI Powered Correction
            </div>
            <h3 className="text-[32px] font-bold leading-[1.1] tracking-[-0.04em] mb-4">
              Fix your funding gaps in 5 minutes.
            </h3>
            <p className="text-[16px] text-white/60 mb-10 max-w-[480px]">
              Unlock your tailored action plan. We'll rewrite your positioning, suggest missing proof points, and generate direct applications to the programs you match.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <button 
                onClick={() => setPaywallOpen(true)}
                className="w-full sm:w-auto h-16 px-10 rounded-full bg-[#ff6b3d] text-[16px] font-bold text-white shadow-[0_15px_30px_rgba(255,107,61,0.3)] transition-all transform hover:scale-[1.05] hover:bg-[#f45d2e] flex items-center justify-center gap-3"
              >
                Fix this for me
                <ArrowRight className="size-5" />
              </button>
              <div className="text-[12px] font-bold uppercase tracking-widest text-white/40">
                142 Founders fixed today
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
          {/* Main Analysis Column */}
          <div className="space-y-16">
            {/* Top Weaknesses */}
            <section>
              <h2 className="mb-8 text-[14px] font-bold uppercase tracking-[0.15em] text-[#171513] flex items-center gap-3">
                <AlertCircle className="size-4 text-[#ff6b3d]" />
                Critical Weaknesses
              </h2>
              <div className="space-y-4">
                {weaknesses.map((w) => (
                  <WeaknessCard key={w.title} title={w.title} whyItHurts={w.whyItHurts} quickHint={w.quickHint} />
                ))}
              </div>
            </section>

            {/* Qualitative Assessments */}
            <section className="space-y-8">
               <h2 className="text-[14px] font-bold uppercase tracking-[0.15em] text-[#171513] flex items-center gap-3">
                <BrainCircuit className="size-4 text-[#8b5cf6]" />
                Intelligence Modules
              </h2>

              <div className="rounded-[24px] border border-black/[0.06] bg-white p-8 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex size-10 items-center justify-center rounded-[12px] bg-[#f5f0ff] text-[#8b5cf6]">
                    <User className="size-5" />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#171513]">Founder Profile Scan</h3>
                </div>
                <p className="text-[15px] leading-[1.8] text-[#6f685f]">{founderAssessment}</p>
              </div>

              <div className="rounded-[24px] border border-black/[0.06] bg-white p-8 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex size-10 items-center justify-center rounded-[12px] bg-[#f0f7ff] text-[#60a5fa]">
                    <Lightbulb className="size-5" />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#171513]">Startup Clarity Analysis</h3>
                </div>
                <p className="text-[15px] leading-[1.8] text-[#6f685f]">{startupAssessment}</p>
              </div>

              <div className="rounded-[24px] border border-black/[0.06] bg-white p-8 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex size-10 items-center justify-center rounded-[12px] bg-[#f0fff4] text-[#22c55e]">
                    <Globe className="size-5" />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#171513]">Positioning Audit</h3>
                </div>
                <p className="text-[15px] leading-[1.8] text-[#6f685f]">{websiteAssessment}</p>
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-12">
            {/* Missing Proof Points */}
            <section>
              <h2 className="mb-6 text-[12px] font-bold uppercase tracking-[0.15em] text-[#171513]">Missing Proof Points</h2>
              <div className="rounded-[24px] border border-black/[0.06] bg-white p-6 shadow-sm">
                <ul className="space-y-5">
                  {missingProofPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[13px] leading-[1.5] text-[#6f685f]">
                      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#fff5f0] text-[#ff6b3d]">
                        <CheckCircle2 className="size-3" />
                      </div>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Opportunity Radar */}
            <section>
              <h2 className="mb-6 text-[12px] font-bold uppercase tracking-[0.15em] text-[#171513]">Opportunity Radar</h2>
              <div className="flex flex-wrap gap-2 mb-8">
                {opportunityCategories.map((cat) => (
                  <span key={cat} className="rounded-full bg-[#f6f1ea] px-4 py-2 text-[11px] font-bold text-[#8b8276] uppercase tracking-wider">
                    {cat}
                  </span>
                ))}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[12px] font-bold uppercase tracking-widest text-[#b5ad9f]">Matches</span>
                  <button 
                    onClick={() => setPaywallOpen(true)}
                    className="text-[11px] font-bold text-[#ff6b3d] hover:underline"
                  >
                    Unlock All
                  </button>
                </div>
                {lockedMatchesPreview.map((match) => (
                  <LockedMatchPreview key={match.name} name={match.name} reason={match.reason} />
                ))}
              </div>
            </section>
            
            {/* Sticky Secondary CTA */}
            <div className="sticky top-28 p-6 rounded-[32px] border border-dashed border-[#d9cbbd] text-center">
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-[#f6f1ea] mb-4">
                <TrendingUp className="size-6 text-[#ff6b3d]" />
              </div>
              <h4 className="text-[14px] font-bold text-[#171513] mb-2">Ready to improve?</h4>
              <p className="text-[12px] text-[#8b8276] mb-6">
                Our AI will rebuild your profile to hit these missing signals.
              </p>
              <button 
                onClick={() => setPaywallOpen(true)}
                className="w-full h-11 rounded-full bg-[#171513] text-[12px] font-bold text-white shadow-md hover:bg-black transition-all"
              >
                Start Fixing
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Secondary Actions */}
      <footer className="mt-20 border-t border-black/[0.05] pt-12 text-center">
        <button 
          className="text-[13px] font-bold text-[#8b8276] hover:text-[#171513] transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Back to Top
        </button>
      </footer>
    </main>
  );
}
