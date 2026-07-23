"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  BadgeIndianRupee,
  Building2,
  Check,
  FilePenLine,
  Landmark,
  LockKeyhole,
  Mail,
  Rocket,
  Rows3,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { useDemo } from "@/components/app/demo-provider";
import { useAssessment } from "@/components/assessment/assessment-provider";
import { Button } from "@/components/ui/button";
import { getPreviewMatches, PREVIEW_MATCH_CATEGORIES } from "@/lib/assessment/preview-matches";

function ClerkIdentityBridge() {
  const { isLoaded, isSignedIn } = useUser();
  const { state, signIn } = useDemo();

  useEffect(() => {
    if (isLoaded && isSignedIn && !state.isAuthenticated) signIn();
  }, [isLoaded, isSignedIn, signIn, state.isAuthenticated]);

  return null;
}

function CategoryIcon({ label }: { label: string }) {
  if (label.includes("Accelerator")) return <Rocket className="size-4" />;
  if (label.includes("Incubator")) return <Building2 className="size-4" />;
  if (label.includes("Grant")) return <Landmark className="size-4" />;
  return <BadgeIndianRupee className="size-4" />;
}

function opportunityReasonSummary(reason: string): string {
  const [firstSentence] = reason.split(/(?<=\.)\s+/);
  return firstSentence ?? reason;
}

const LOCKED_MODULES = [
  {
    capabilities: ["Founder profile", "Startup narrative", "Pitch deck"],
    description: "Turn weak evidence into a fundable story.",
    icon: FilePenLine,
    title: "Optimize",
  },
  {
    capabilities: ["Draft outreach", "Message or apply"],
    description: "Move from fit to a credible first contact.",
    icon: Mail,
    title: "Reach",
  },
  {
    capabilities: ["Full matches", "Application tracking"],
    description: "Keep every opportunity and next step visible.",
    icon: Rows3,
    title: "Manage",
  },
];

const MATCH_TONES = [
  "border-t-[#ff6b3d]",
  "border-t-[#315f8b]",
  "border-t-[#65448f]",
  "border-t-[#246b48]",
];

export function PreviewDashboard() {
  const { state, hasHydrated } = useDemo();
  const { session } = useAssessment();
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const report = session.report;

  if (!hasHydrated) {
    return <div className="premium-card p-8 text-[15px] text-[var(--text-secondary)]">Opening your Preview workspace…</div>;
  }

  if (!state.isAuthenticated) {
    return (
      <section className="premium-card mx-auto max-w-xl p-6 text-center sm:p-8">
        {clerkConfigured ? <ClerkIdentityBridge /> : null}
        <LockKeyhole className="mx-auto size-6 text-[#ff6b3d]" />
        <h1 className="type-section-title mt-3">Save this assessment first.</h1>
        <p className="mt-3 text-[15px] leading-6 text-[var(--text-secondary)]">Return to your result to continue into the Preview workspace.</p>
        <Button className="mt-5" onClick={() => window.location.assign("/assessment/result")}>
          Return to assessment
          <ArrowRight className="size-4" />
        </Button>
      </section>
    );
  }

  if (!report) {
    return (
      <section className="premium-card mx-auto max-w-xl p-6 text-center sm:p-8">
        <h1 className="type-section-title">Start with your assessment.</h1>
        <p className="mt-3 text-[15px] leading-6 text-[var(--text-secondary)]">A funding diagnosis unlocks this workspace.</p>
        <Button className="mt-5" onClick={() => window.location.assign("/assessment")}>Start assessment <ArrowRight className="size-4" /></Button>
      </section>
    );
  }

  const matches = getPreviewMatches();
  const weakest = report.dimensions.find((dimension) => dimension.id === report.weakestDimension);
  const nextAction = report.actions[0];
  const founderName = session.input.founderName.trim() || "Founder";
  const startupName = session.input.startupName.trim() || "Your startup";

  return (
    <div className="mx-auto max-w-[1080px]">
      <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#171513] text-white"><UserRound className="size-4.5" /></span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold">{founderName}</p>
            <p className="truncate text-[13px] text-[var(--text-secondary)]">{startupName}</p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#246b48]/20 bg-[#f3fbf6] px-3 py-1.5 text-[13px] font-semibold text-[var(--status-positive)]"><ShieldCheck aria-hidden="true" className="size-3.5" />Saved assessment</span>
      </header>

      <section className="premium-card mt-5 grid overflow-hidden md:grid-cols-[170px_minmax(0,1fr)_240px]">
        <div className="flex items-center gap-4 border-b border-[var(--border)] p-5 md:block md:border-b-0 md:border-r">
          <div>
            <span className="type-score">{report.readinessScore}</span>
            <span className="ml-1 text-[13px] font-medium text-[var(--text-secondary)]">/100</span>
          </div>
          <div className="md:mt-3"><p className="text-[13px] font-semibold text-[var(--text-secondary)]">Funding readiness</p><p className="mt-1 text-[13px] font-medium">{report.confidence} confidence</p></div>
        </div>
        <div className="border-b border-[var(--border)] p-5 md:border-b-0 md:border-r">
          <p className="eyebrow">Your diagnosis</p>
          <h1 className="type-card-title mt-2 text-balance">{report.verdict}</h1>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div><p className="text-[13px] font-semibold text-[var(--status-critical)]">Biggest weakness</p><p className="mt-1 text-[15px] font-semibold">{weakest?.label ?? "Evidence unavailable"}</p></div>
            <div><p className="text-[13px] font-semibold text-[var(--status-positive)]">Next action</p><p className="mt-1 text-[15px] font-semibold">{nextAction?.title ?? "Add supporting evidence"}</p></div>
          </div>
        </div>
        <div className="flex flex-col justify-center p-5">
          <p className="line-clamp-3 text-[13px] leading-5 text-[var(--text-secondary)]">{nextAction?.detail}</p>
          <Link className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#171513] px-4 text-sm font-semibold text-white hover:bg-[#302d29]" href="/assessment/result">View assessment <ArrowRight className="size-3.5" /></Link>
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-end justify-between gap-4">
          <div><p className="eyebrow">Opportunity overview</p><h2 className="type-section-title mt-1">Four paths worth exploring</h2></div>
          <Link className="hidden min-h-11 items-center text-[13px] font-semibold hover:text-[#963b1a] sm:inline-flex" href="/search">Explore all <ArrowRight className="ml-1 size-3.5" /></Link>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PREVIEW_MATCH_CATEGORIES.map((category, index) => (
            <Link className={`premium-card premium-card-interactive group border-t-[3px] p-4 ${MATCH_TONES[index]}`} href="/search" key={category.label}>
              <div className="flex items-center justify-between gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[var(--surface-elevated)]"><CategoryIcon label={category.label} /></span><ArrowRight className="size-4 text-[var(--text-secondary)] transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" /></div>
              <p className="mt-3 text-[15px] font-semibold">{category.label.replace(" and VC firms", "")}</p>
              <p className="mt-1 text-[13px] text-[var(--text-secondary)]">{category.count} possible paths</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Top opportunities</p><h2 className="type-section-title mt-1">A focused first look</h2></div><p className="text-[13px] text-[var(--text-secondary)]">Preview examples · not live recommendations</p></div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {matches.slice(0, 4).map((match, index) => (
            <article className={`flex min-h-[220px] flex-col rounded-[18px] border border-[var(--border)] border-t-[3px] bg-white p-5 ${MATCH_TONES[index]}`} key={match.id}>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-elevated)]"><CategoryIcon label={match.category} /></span>
                <div className="min-w-0 flex-1"><p className="type-metadata text-[var(--text-secondary)]">{match.category}</p><h3 className="type-card-title mt-1">{match.name}</h3></div>
              </div>
              <p className="mt-3 text-[15px] leading-6 text-[var(--text-secondary)]">{opportunityReasonSummary(match.reason)}</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                <div><dt className="text-[var(--text-secondary)]">Stage</dt><dd className="mt-0.5 font-semibold">{match.stage}</dd></div>
                <div><dt className="text-[var(--text-secondary)]">Geography</dt><dd className="mt-0.5 font-semibold">{match.geography}</dd></div>
                <div className="col-span-2"><dt className="text-[var(--text-secondary)]">Range / benefit</dt><dd className="mt-0.5 font-semibold">{match.value}</dd></div>
              </dl>
              <Link className="mt-auto inline-flex min-h-11 items-end gap-1.5 pt-4 text-[13px] font-semibold text-[#963b1a] hover:text-[#6f2712]" href="/search">View public details <ArrowRight className="size-3.5" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="premium-card mt-6 overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><span className="inline-flex items-center gap-2 rounded-full border border-[#ff6b3d]/25 bg-[#fff8f4] px-3 py-1.5 text-[13px] font-semibold text-[#963b1a]"><Sparkles aria-hidden="true" className="size-3.5" />Early access</span><h2 className="type-section-title mt-3">Turn the diagnosis into momentum.</h2></div>
          <Link className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#171513] px-5 text-[15px] font-semibold text-white hover:bg-[#302d29] sm:w-auto" href="/assessment/result">Review unlock options <ArrowRight className="size-4" /></Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {LOCKED_MODULES.map(({ capabilities, description, icon: Icon, title }) => (
            <article className="rounded-[17px] border border-[var(--border)] bg-[var(--surface-elevated)] p-4" key={title}>
              <span className="grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-white text-[#a64626]"><Icon aria-hidden="true" className="size-4" /></span>
              <h3 className="type-card-title mt-3">{title}</h3>
              <p className="mt-1 text-[15px] leading-6 text-[var(--text-secondary)]">{description}</p>
              <ul className="mt-3 space-y-2 text-[13px] text-[var(--text-secondary)]">{capabilities.map((item) => <li className="flex items-center gap-2" key={item}><Check aria-hidden="true" className="size-3.5 text-[var(--status-positive)]" />{item}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <details className="mx-auto mt-4 max-w-2xl px-3 py-2 text-center text-[13px] leading-5 text-[var(--text-secondary)]">
        <summary className="flex min-h-11 cursor-pointer items-center justify-center rounded-md font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">About this Preview</summary>
        <p className="mt-2">Opportunity examples illustrate the future experience and are not live ranked recommendations.</p>
      </details>
    </div>
  );
}
