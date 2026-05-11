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
  CheckCircle2,
  X,
  Zap,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Brain as BrainCircuit,
  Coins,
  ChevronRight,
  RefreshCw,
  Layout,
  Search,
  Target,
  ChevronLeft
} from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { useAssessment } from "@/components/assessment/assessment-provider";
import { EASE_OUT } from "@/lib/animations";

/* ─── Shared Components ───────────────────────────────────────── */

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

function LockedFixCard({ title, whyItHurts, onUnlock }: { title: string; whyItHurts: string; onUnlock: () => void }) {
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
        <p className="text-[13px] leading-[1.6] text-[#6f685f] mb-6">{whyItHurts}</p>
        <div className="relative mt-4 h-24 overflow-hidden rounded-xl bg-[#f6f1ea]/30 p-4 border border-black/[0.03]">
          <div className="space-y-2 blur-[6px] select-none opacity-50">
            <div className="h-3 w-3/4 rounded-full bg-[#8b8276]/30" />
            <div className="h-3 w-1/2 rounded-full bg-[#8b8276]/20" />
            <div className="h-3 w-2/3 rounded-full bg-[#8b8276]/30" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px]">
             <Button onClick={onUnlock} variant="outline" className="h-9 px-4 rounded-full border-[#ff6b3d] text-[#ff6b3d] text-[11px] font-bold uppercase tracking-wider bg-white shadow-sm hover:bg-[#ff6b3d] hover:text-white transition-all">
               View Fix
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LockedMatchPreview({ name, reason, type, onUnlock }: { name: string; reason: string; type: string; onUnlock: () => void }) {
  return (
    <div onClick={onUnlock} className="group relative cursor-pointer overflow-hidden rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all hover:border-[#ff6b3d]/30">
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

function PaywallModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isCheckoutState, setIsCheckoutState] = useState(false);
  useEffect(() => { if (!isOpen) { const timer = setTimeout(() => setIsCheckoutState(false), 300); return () => clearTimeout(timer); } }, [isOpen]);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md px-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} transition={{ duration: 0.5, ease: EASE_OUT }} className="relative w-full max-w-[540px] overflow-hidden rounded-[40px] border border-white/20 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.4)]" onClick={(e) => e.stopPropagation()}>
            <div className="h-2 w-full bg-gradient-to-r from-[#ff6b3d] via-[#ff9068] to-[#ff6b3d]" />
            <button onClick={onClose} className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-full bg-black/[0.03] text-[#6f685f] transition-colors hover:bg-black/[0.08] hover:text-[#171513]"><X className="size-5" /></button>
            <div className="p-8 sm:p-12">
              {!isCheckoutState ? (
                <>
                  <div className="text-center mb-8">
                    <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-[#fff5f0] shadow-inner"><ShieldCheck className="size-10 text-[#ff6b3d]" /></div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f1ea] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8b8276] mb-4">Intelligence Unlock</div>
                    <h2 className="text-[32px] font-bold leading-[1.05] tracking-[-0.03em] text-[#171513]">Your Diagnosis is Ready.<br /><span className="text-[#ff6b3d]">The Fixes are Locked.</span></h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 mb-10">
                    {[{ icon: User, label: "Founder profile fixes" }, { icon: Layout, label: "Website positioning" }, { icon: FileText, label: "Pitch deck roadmap" }, { icon: Search, label: "Matched opportunities" }, { icon: BrainCircuit, label: "Application draft support" }, { icon: RefreshCw, label: "Weekly opportunity refresh" }].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-2xl bg-[#f6f1ea]/50 p-3.5 border border-black/[0.02]">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-white text-[#ff6b3d] shadow-sm"><item.icon className="size-4" /></div>
                        <span className="text-[13px] font-bold text-[#6f685f]">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <button onClick={() => setIsCheckoutState(true)} className="w-full flex h-16 items-center justify-center gap-3 rounded-full bg-[#171513] text-[16px] font-bold text-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:bg-black transition-all transform hover:scale-[1.02]">Unlock my funding plan <ArrowRight className="size-5" /></button>
                    <button className="w-full h-12 text-[14px] font-bold text-[#8b8276] hover:text-[#171513] transition-colors" onClick={onClose}>Continue with free report</button>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                   <div className="mx-auto mb-8 flex size-24 items-center justify-center rounded-full bg-[#f6f1ea] border-2 border-dashed border-[#ff6b3d]/30"><Zap className="size-10 text-[#ff6b3d]" /></div>
                  <h2 className="text-[28px] font-bold leading-tight tracking-tight text-[#171513] mb-4">Early Access Coming Soon</h2>
                  <p className="text-[15px] leading-[1.6] text-[#6f685f] mb-10 max-w-[320px] mx-auto">We're finalizing our AI matching engine. You'll be notified the moment your personalized funding plan is ready to unlock.</p>
                  <button onClick={onClose} className="w-full h-14 rounded-full bg-[#ff6b3d] text-[15px] font-bold text-white shadow-lg hover:bg-[#f45d2e] transition-all">Got it, thanks</button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Dashboard Assessment View ────────────────────────────────── */

export function AssessmentReportView() {
  const { state } = useAssessment();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const report = state.report;

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-[24px] bg-white border border-black/[0.05] shadow-sm">
          <FileText className="size-10 text-[#b5ad9f]" />
        </div>
        <h2 className="text-[24px] font-bold text-[#171513] mb-3">No diagnosis yet.</h2>
        <p className="text-[15px] text-[#6f685f] leading-relaxed mb-8 max-w-[320px] mx-auto">
          Start your assessment to generate your founder readiness report.
        </p>
        <Link href="/assessment">
          <Button className="h-12 rounded-full px-8 font-bold gap-2 bg-[#171513] text-white hover:bg-black">
            Start Assessment
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const readinessScore = Number.isFinite(report.readinessScore) ? report.readinessScore : 0;

  return (
    <PageShell className="space-y-12 pb-20">
      <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />

      {/* Header Info */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd0] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ff6b3d] mb-4">
            <Sparkles className="size-3" />
            Diagnosis Active
          </div>
          <h1 className="text-[32px] font-bold tracking-tight text-[#171513] leading-[1.1] max-w-[600px]">
            {report.verdict}
          </h1>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2.5 rounded-full bg-white border border-black/[0.05] pl-3 pr-4 py-1.5 shadow-sm">
            <Coins className="size-3.5 text-[#ff6b3d]" />
            <span className="text-[12px] font-bold text-[#171513]">{state.creditsRemaining} Credits</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Score Card */}
        <div className="col-span-full lg:col-span-1 rounded-[32px] border border-black/[0.05] bg-white p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#ff6b3d]" />
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b8276] mb-4">Readiness Score</div>
          <div className="flex items-baseline gap-2">
            <span className="text-[64px] font-bold tracking-tighter text-[#171513] leading-none">
              {readinessScore}
            </span>
            <span className="text-[18px] font-bold text-[#b5ad9f]">/ 100</span>
          </div>
          
          <div className="mt-8 space-y-4">
             <div className="flex items-center justify-between text-[13px]">
               <span className="text-[#6f685f] font-medium">Status</span>
               <span className="text-[#ff6b3d] font-bold">Strong Signal</span>
             </div>
             <div className="h-1.5 w-full bg-[#f6f1ea] rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${readinessScore}%` }}
                 transition={{ duration: 1, ease: EASE_OUT }}
                 className="h-full bg-[#ff6b3d]"
               />
             </div>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="col-span-full lg:col-span-2 rounded-[32px] border border-black/[0.05] bg-white p-8 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b8276] mb-8">Signal Breakdown</div>
          <div className="grid grid-cols-3 gap-6 sm:grid-cols-6">
            <ScoreRing score={report.subscores.founderCredibility} label="Founder" />
            <ScoreRing score={report.subscores.startupClarity} label="Clarity" />
            <ScoreRing score={report.subscores.tractionProof} label="Traction" />
            <ScoreRing score={report.subscores.marketFit} label="Market" />
            <ScoreRing score={report.subscores.applicationReadiness} label="App State" />
            <ScoreRing score={report.subscores.opportunityFit} label="Opp Fit" />
          </div>
        </div>
      </div>

      {/* Fixes Section */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-[24px] font-bold tracking-tight text-[#171513]">Priority Fixes</h2>
          <div className="h-px flex-1 bg-black/[0.05]" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <LockedFixCard title="Founder Narrative Fix" whyItHurts="Your current profile lacks a 'Why You' hook. We'll rewrite it to highlight domain unfair advantages." onUnlock={() => setPaywallOpen(true)} />
          <LockedFixCard title="Website Positioning" whyItHurts="Your landing page copy is too technical. We'll generate 3 editorial headlines for 2x clarity." onUnlock={() => setPaywallOpen(true)} />
          <LockedFixCard title="Traction Proof Points" whyItHurts="Missing specific growth metrics. We'll draft the exact missing proof points needed for top tier apps." onUnlock={() => setPaywallOpen(true)} />
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
         {/* Analysis Column */}
         <div className="space-y-12">
            <div className="rounded-[32px] border border-black/[0.06] bg-white p-10 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#fff5f0] text-[#ff6b3d]">
                  <BrainCircuit className="size-6" />
                </div>
                <h3 className="text-[20px] font-bold text-[#171513]">Intelligence Summary</h3>
              </div>
              <div className="space-y-6 text-[16px] leading-[1.8] text-[#6f685f]">
                <p>{report.founderAssessment}</p>
                <p>{report.startupAssessment}</p>
              </div>
            </div>

            <section>
               <div className="flex items-center justify-between mb-8">
                <h2 className="text-[20px] font-bold tracking-tight text-[#171513]">Opportunity Radar</h2>
                <button onClick={() => setPaywallOpen(true)} className="text-[12px] font-bold text-[#ff6b3d] hover:underline flex items-center gap-1.5">Unlock All <ChevronRight className="size-3.5" /></button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <LockedMatchPreview name="Y Combinator W26" type="Accelerator" reason="Strong stage fit. Needs sharpened traction story." onUnlock={() => setPaywallOpen(true)} />
                <LockedMatchPreview name="Antler India" type="Venture Builder" reason="High market opportunity fit. Missing team proof." onUnlock={() => setPaywallOpen(true)} />
              </div>
            </section>
         </div>

         {/* Sidebar Actions Column */}
         <div className="space-y-8">
            <div className="rounded-[32px] bg-[#171513] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 size-24 bg-white/5 rounded-full group-hover:scale-110 transition-transform" />
              <div className="flex items-center gap-2 mb-4">
                <Zap className="size-4 text-[#ff6b3d]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b3d]">Next Best Action</span>
              </div>
              <h4 className="text-[20px] font-bold leading-tight mb-4">Finalize your funding plan.</h4>
              <p className="text-[13px] text-white/60 mb-8 leading-relaxed">
                The intelligence engine has identified exactly where your application will fail. View the specific rewrites now.
              </p>
              <Button onClick={() => setPaywallOpen(true)} className="w-full h-14 rounded-full bg-[#ff6b3d] text-white hover:bg-[#f45d2e] gap-2 font-bold shadow-lg transition-all transform hover:scale-[1.02]">
                Unlock Fixes
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <div className="rounded-[32px] border border-black/[0.06] bg-white p-8">
              <div className="flex items-center gap-3 mb-6">
                <Target className="size-5 text-[#ff6b3d]" />
                <h3 className="font-bold text-[#171513]">Missing Signals</h3>
              </div>
              <ul className="space-y-4">
                {report.missingProofPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] text-[#6f685f] leading-relaxed">
                    <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#ff6b3d]" />
                    {point}
                  </li>
                ))}
              </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
