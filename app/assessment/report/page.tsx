"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Lock,
  Sparkles,
  Globe,
  User,
  Lightbulb,
  FileText,
  CheckCircle2,
  X,
  Zap,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Brain,
  Coins,
  ChevronRight,
  RefreshCw,
  Layout,
  Search,
  Target,
  CircleDot,
  BarChart3,
  Shield
} from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { Button } from "@/components/ui/button";
import { useAssessment } from "@/components/assessment/assessment-provider";
import { EASE_OUT } from "@/lib/animations";

/* ─── Score interpretation ── */

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Strong signal", color: "#22c55e" };
  if (score >= 60) return { label: "Promising, needs sharpening", color: "#f59e0b" };
  if (score >= 40) return { label: "Weak application signal", color: "#f97316" };
  return { label: "Not ready yet", color: "#9ca3af" };
}

/* ─── Signal Detail ── */

const signalMeta: Record<string, { label: string; icon: any; explain: string }> = {
  founderCredibility: { label: "Founder", icon: User, explain: "Founder narrative strength and domain credibility" },
  startupClarity: { label: "Clarity", icon: Lightbulb, explain: "How clearly the problem and solution are framed" },
  tractionProof: { label: "Traction", icon: TrendingUp, explain: "Strength of growth metrics and proof points" },
  marketFit: { label: "Market", icon: Target, explain: "Market opportunity and product-market alignment" },
  applicationReadiness: { label: "App State", icon: FileText, explain: "Preparedness of application materials" },
  opportunityFit: { label: "Opp Fit", icon: Search, explain: "How well your startup fits target programs" },
};

/* ─── Credit Meter ── */

function CreditMeter({ credits }: { credits: number }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/80 border border-black/[0.05] pl-3 pr-4 py-1.5 shadow-sm backdrop-blur-sm">
      <div className="flex size-6 items-center justify-center rounded-full bg-[#ff6b3d]/10 text-[#ff6b3d]">
        <Coins className="size-3.5" />
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#8b8276] leading-none">Credits</span>
        <span className="text-[12px] font-bold text-[#171513]">{credits}</span>
      </div>
    </div>
  );
}

/* ─── Locked Fix Card ── */

function LockedFixCard({
  title,
  whyItHurts,
  previewText,
  onUnlock,
}: {
  title: string;
  whyItHurts: string;
  previewText: string;
  onUnlock: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#fff5f0] text-[#ff6b3d]">
            <Zap className="size-5" />
          </div>
          <span className="rounded-full bg-[#f6f1ea] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#8b8276]">Locked Fix</span>
        </div>
        <h4 className="text-[16px] font-bold text-[#171513] mb-2">{title}</h4>
        <p className="text-[13px] leading-[1.6] text-[#6f685f] mb-4">{whyItHurts}</p>

        <p className="mb-3 text-[11px] font-bold text-[#ff6b3d] uppercase tracking-wider">Preview</p>

        <div className="relative overflow-hidden rounded-xl bg-[#f6f1ea]/40 p-4 border border-black/[0.03]">
          <p className="blur-[5px] select-none text-[13px] text-[#171513] leading-relaxed opacity-40">
            {previewText}
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px]">
            <Button
              onClick={onUnlock}
              variant="outline"
              className="h-9 px-4 rounded-full border-[#ff6b3d] text-[#ff6b3d] text-[11px] font-bold uppercase tracking-wider bg-white shadow-sm hover:bg-[#ff6b3d] hover:text-white transition-all"
            >
              Unlock fix
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Locked Match Preview ── */

function LockedMatchPreview({
  name,
  reason,
  type,
  onUnlock,
}: {
  name: string;
  reason: string;
  type: string;
  onUnlock: () => void;
}) {
  return (
    <div
      onClick={onUnlock}
      className="group relative cursor-pointer overflow-hidden rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all hover:border-[#ff6b3d]/30"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#ff6b3d]">{type}</span>
            <div className="size-1 rounded-full bg-[#b5ad9f]" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#8b8276]">High Fit</span>
          </div>
          <h4 className="text-[15px] font-bold text-[#171513] blur-[3px] group-hover:blur-0 transition-all duration-500">{name}</h4>
          <p className="mt-1 text-[13px] leading-[1.6] text-[#6f685f] line-clamp-1">{reason}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f6f1ea] text-[#8b8276] group-hover:bg-[#ff6b3d] group-hover:text-white transition-colors">
          <Lock className="size-4" />
        </div>
      </div>
    </div>
  );
}

/* ─── Unlock Modal ── */

const issuesSummary = [
  "Your founder story lacks a clear edge.",
  "Your website positioning is unclear.",
  "Your opportunity fit needs sharpening.",
];

function PaywallModal({ isOpen, onClose, onAuth }: { isOpen: boolean; onClose: () => void; onAuth: () => void }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="relative w-full max-w-[500px] overflow-hidden rounded-[40px] border border-white/20 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 w-full bg-gradient-to-r from-[#ff6b3d] via-[#ff9068] to-[#ff6b3d]" />

            <button
              onClick={onClose}
              className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-full bg-black/[0.03] text-[#6f685f] transition-colors hover:bg-black/[0.08] hover:text-[#171513]"
            >
              <X className="size-5" />
            </button>

            <div className="p-8 sm:p-10">
              <div className="text-center mb-8">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-[#fff5f0] shadow-inner">
                  <ShieldCheck className="size-8 text-[#ff6b3d]" />
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f1ea] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8b8276] mb-4">
                  Diagnosis Ready
                </div>

                <h2 className="text-[28px] font-bold leading-[1.05] tracking-[-0.03em] text-[#171513]">
                  Your diagnosis is ready.
                  <br />
                  <span className="text-[#ff6b3d]">The fixes are locked.</span>
                </h2>
              </div>

              {/* Top 3 issues summary */}
              <div className="mb-8 space-y-3">
                {issuesSummary.map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-2xl bg-[#f6f1ea]/60 p-4 border border-black/[0.03]">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#fff5f0] text-[#ff6b3d] text-[11px] font-bold">
                      {i + 1}
                    </div>
                    <span className="text-[14px] font-medium text-[#6f685f] leading-snug pt-0.5">{issue}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <button
                  onClick={onAuth}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#171513] text-[15px] font-bold text-white shadow-[0_16px_32px_rgba(0,0,0,0.1)] transition-all hover:bg-black transform hover:scale-[1.02]"
                >
                  Unlock improvement plan
                  <ArrowRight className="size-5" />
                </button>
                <button
                  className="w-full h-12 text-[13px] font-bold text-[#8b8276] hover:text-[#171513] transition-colors"
                  onClick={onClose}
                >
                  Continue with free report
                </button>
              </div>

              <p className="mt-6 text-center text-[12px] text-[#b5ad9f] leading-relaxed">
                Built to help founders stop applying blind.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Report Page ── */

export default function AssessmentReportPage() {
  const { state } = useAssessment();
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasTimedModal, setHasTimedModal] = useState(false);

  const report = state.report;

  // Track scroll to trigger paywall
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (!hasTimedModal && window.scrollY > 400 && report) {
        setHasTimedModal(true);
        setPaywallOpen(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasTimedModal, report]);

  // Auto trigger paywall after 5 seconds
  useEffect(() => {
    if (report && !hasTimedModal) {
      const timer = setTimeout(() => {
        setHasTimedModal(true);
        setPaywallOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [report, hasTimedModal]);

  function handleAuth() {
    window.location.href = "/sign-up";
  }

  if (!report) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6f1ea] px-4 text-center">
        <div className="size-24 mb-6 flex items-center justify-center rounded-full bg-white border border-black/[0.05] shadow-sm">
          <FileText className="size-10 text-[#b5ad9f]" />
        </div>
        <h2 className="text-[24px] font-bold text-[#171513] mb-3">No Diagnosis Found</h2>
        <p className="text-[15px] text-[#6f685f] leading-relaxed mb-8 max-w-[320px]">
          We couldn&apos;t find a recent assessment. Let&apos;s start one to see your funding readiness.
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
  const { label: scoreLabel, color: scoreColor } = getScoreLabel(readinessScore);
  const {
    verdict = "No verdict available",
    weaknesses = [],
    founderAssessment = "",
    startupAssessment = "",
    missingProofPoints = [],
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
      <header className={`fixed inset-x-0 top-0 z-[60] transition-all duration-300 ${scrolled ? "border-b border-[#e7ddd0] bg-[#f6f1ea]/92 backdrop-blur-xl py-3" : "bg-transparent py-4"}`}>
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 sm:px-6 xl:px-8">
          <Link href="/">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-3">
            <CreditMeter credits={state.creditsRemaining} />
            <button
              onClick={() => setPaywallOpen(true)}
              className="h-9 rounded-full bg-[#171513] px-5 text-[11px] font-bold text-white shadow-lg transition-all hover:bg-black"
            >
              <span className="hidden sm:inline">Unlock Improvement Plan</span>
              <span className="sm:hidden">Unlock Plan</span>
            </button>
          </div>
        </div>
      </header>

      <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} onAuth={handleAuth} />

      <div className="mx-auto max-w-[940px] px-4 pt-32 sm:px-6 lg:pt-40">

        {/* ─── 1. Verdict ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="mb-16"
        >
          <div className="grid gap-10 md:grid-cols-[1fr_260px] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd0] bg-white/92 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff6b3d] mb-6">
                <Sparkles className="size-3" />
                Diagnosis Complete
              </div>
              <h1 className="text-[40px] font-bold leading-[0.95] tracking-[-0.05em] text-[#171513] sm:text-[56px] mb-6">
                {verdict}
              </h1>
              <p className="text-[17px] leading-[1.6] text-[#6f685f] max-w-[480px]">
                We&apos;ve scanned your startup signals. Here&apos;s what we found.
              </p>
            </div>

            {/* Score Card */}
            <div className="flex flex-col items-center justify-center p-8 rounded-[40px] bg-white border border-black/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.05)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#ff6b3d] to-[#ff9068]" />
              <div className="relative z-10 text-center">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b8276] mb-3">Readiness</div>
                <div className="text-[72px] font-bold leading-none tracking-[-0.06em] text-[#171513] mb-3">{readinessScore}</div>
                <div className="h-1.5 w-36 bg-[#f6f1ea] rounded-full overflow-hidden mb-4 mx-auto">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${readinessScore}%` }}
                    transition={{ duration: 1.5, ease: EASE_OUT, delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: scoreColor }}
                  />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5"
                  style={{ color: scoreColor }}>
                  <CircleDot className="size-3" />
                  {scoreLabel}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ─── 2. What This Score Means ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="rounded-[28px] border border-black/[0.05] bg-white p-8 shadow-sm">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.15em] text-[#8b8276] mb-4">Score Interpretation</h2>
            <p className="text-[16px] leading-relaxed text-[#6f685f]">
              {readinessScore >= 80
                ? "Your startup presents a strong signal. Programs will take notice, but sharpening specific areas can turn interest into acceptance."
                : readinessScore >= 60
                ? "You have the foundations, but your application story needs sharper framing. The gaps are fixable—and we know exactly where to start."
                : readinessScore >= 40
                ? "Your application signal is weak. The good news: each weak point has a clear fix. The diagnosis points straight to what matters most."
                : "Your startup is early-stage or the signal is too fragmented to assess confidently. Let us help you build the foundation before you apply."}
            </p>
          </div>
        </motion.section>

        {/* ─── Dashboard CTA ── */}
        <div className="mb-16 flex items-center justify-between rounded-[28px] border border-black/[0.05] bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-[16px] font-bold text-[#171513]">Save report to dashboard</h3>
            <p className="mt-1 text-[13px] text-[#6f685f]">Keep your diagnosis in your personal workspace.</p>
          </div>
          <button
            onClick={() => {
              if (isSignedIn) {
                router.push("/app/report");
              } else {
                router.push("/sign-up");
              }
            }}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#171513] px-5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-black"
          >
            Save to Dashboard
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* ─── 3. Top 3 Issues ── */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.15em] text-[#171513]">Top Issues</h2>
            <div className="h-px flex-1 bg-black/[0.05]" />
          </div>
          <div className="grid gap-4">
            {weaknesses.slice(0, 3).map((w, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl border border-black/[0.05] bg-white p-5 shadow-sm">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff5f0] text-[#ff6b3d] text-[13px] font-bold">
                  {i + 1}
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#171513]">{w.title}</h4>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#6f685f]">{w.whyItHurts}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 4. Core Signals ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.15em] text-[#171513]">Core Signal Analysis</h2>
            <div className="h-px flex-1 bg-black/[0.05] ml-6" />
          </div>
          <div className="grid gap-4">
            {Object.entries(signalMeta).map(([key, meta]) => {
              const score = subscores[key as keyof typeof subscores] || 0;
              const sigLabel = getScoreLabel(score);
              const Icon = meta.icon;
              return (
                <div key={key} className="flex items-center gap-4 rounded-2xl border border-black/[0.05] bg-white p-5 shadow-sm">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#f6f1ea] text-[#8b8276]">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[15px] font-bold text-[#171513]">{meta.label}</span>
                      <span className="text-[20px] font-bold text-[#171513]">{score}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-[12px] text-[#6f685f] truncate">{meta.explain}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider shrink-0" style={{ color: sigLabel.color }}>
                        {sigLabel.label}
                      </span>
                    </div>
                    <div className="mt-2 h-1 w-full bg-[#f6f1ea] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: EASE_OUT, delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: sigLabel.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── 5. What Fundme Can Fix ── */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.15em] text-[#171513]">What Fundme Can Fix</h2>
            <div className="h-px flex-1 bg-black/[0.05]" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <LockedFixCard
              title="Founder Narrative Fix"
              whyItHurts="Your current profile lacks a 'Why You' hook."
              previewText="Rewrite your founder narrative around your domain edge. Highlight your unfair advantage and past wins to build a compelling founder story that selection committees remember."
              onUnlock={() => setPaywallOpen(true)}
            />
            <LockedFixCard
              title="Website Positioning"
              whyItHurts="Your landing page copy is too technical."
              previewText="Sharpen homepage positioning for accelerators and grants. Replace jargon with clear value propositions that communicate your startup's purpose in under 8 seconds."
              onUnlock={() => setPaywallOpen(true)}
            />
            <LockedFixCard
              title="Traction Proof Points"
              whyItHurts="Missing specific growth metrics."
              previewText="Reframe traction proof using your strongest metric. Surface growth signals that demonstrate momentum, even at early stage, to make your application stand out."
              onUnlock={() => setPaywallOpen(true)}
            />
          </div>
        </section>

        <div className="grid gap-16 lg:grid-cols-[1fr_300px]">
          {/* Main Analysis Column */}
          <div className="space-y-16">

            {/* ─── 6. Full Signal Analysis ── */}
            <section className="space-y-8">
              <h2 className="text-[14px] font-bold uppercase tracking-[0.15em] text-[#171513] flex items-center gap-3">
                <Brain className="size-4 text-[#ff6b3d]" />
                Full Signal Analysis
              </h2>

              <div className="rounded-[28px] border border-black/[0.06] bg-white p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                  <User className="size-28" />
                </div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[#fff5f0] text-[#ff6b3d]">
                    <User className="size-5" />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#171513]">Founder Signal</h3>
                </div>
                <p className="text-[15px] leading-[1.8] text-[#6f685f]">{founderAssessment}</p>
              </div>

              <div className="rounded-[28px] border border-black/[0.06] bg-white p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                  <Lightbulb className="size-28" />
                </div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[#f0f7ff] text-[#60a5fa]">
                    <Lightbulb className="size-5" />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#171513]">Startup Clarity</h3>
                </div>
                <p className="text-[15px] leading-[1.8] text-[#6f685f]">{startupAssessment}</p>
              </div>
            </section>

            {/* ─── 7. Opportunity Radar ── */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[14px] font-bold uppercase tracking-[0.15em] text-[#171513] flex items-center gap-3">
                  <Target className="size-4 text-[#ff6b3d]" />
                  Opportunity Radar
                </h2>
                <button
                  onClick={() => setPaywallOpen(true)}
                  className="text-[11px] font-bold text-[#ff6b3d] hover:underline flex items-center gap-1.5"
                >
                  Unlock All Matches
                  <ChevronRight className="size-3.5" />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <LockedMatchPreview
                  name="Y Combinator W26"
                  type="Accelerator"
                  reason="Strong stage fit. Needs sharpened traction story."
                  onUnlock={() => setPaywallOpen(true)}
                />
                <LockedMatchPreview
                  name="Antler India"
                  type="Venture Builder"
                  reason="Founder background matches portfolio signals."
                  onUnlock={() => setPaywallOpen(true)}
                />
                <LockedMatchPreview
                  name="Google for Startups"
                  type="Grant / Support"
                  reason="Matches tech vertical. Requires positioning fix."
                  onUnlock={() => setPaywallOpen(true)}
                />
                <LockedMatchPreview
                  name="Sequoia Surge"
                  type="Seed Program"
                  reason="High market opportunity fit. Missing team proof."
                  onUnlock={() => setPaywallOpen(true)}
                />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-12">
            {/* Sticky CTA */}
            <div className="sticky top-28 space-y-6">
              <div className="rounded-[32px] bg-[#171513] p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 size-20 bg-white/5 rounded-full group-hover:scale-110 transition-transform" />
                <h4 className="text-[20px] font-bold leading-tight mb-3">Fix your funding gaps now.</h4>
                <p className="text-[13px] text-white/60 mb-6 leading-relaxed">
                  Free report shows diagnosis. Paid unlock gives you the exact fixes and direct drafts.
                </p>
                <button
                  onClick={() => setPaywallOpen(true)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff6b3d] text-[14px] font-bold text-white shadow-lg transition-all hover:bg-[#f45d2e] transform hover:scale-[1.02]"
                >
                  <span className="hidden sm:inline">Unlock Improvement Plan</span>
                  <span className="sm:hidden">Unlock Plan</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>

              {/* Missing Signals */}
              <div className="rounded-[28px] border border-black/[0.06] bg-white p-6">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b8276] mb-5">Missing Signals</h3>
                <ul className="space-y-4">
                  {missingProofPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[12px] leading-[1.5] text-[#6f685f]">
                      <div className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#f6f1ea] text-[#b5ad9f]">
                        <div className="size-1.5 rounded-full bg-[#ff6b3d]" />
                      </div>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-32 border-t border-black/[0.05] py-16 text-center">
        <button
          className="text-[12px] font-bold text-[#8b8276] hover:text-[#171513] transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Back to Top
        </button>
      </footer>
    </main>
  );
}
