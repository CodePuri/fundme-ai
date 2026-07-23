"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  BadgeIndianRupee,
  Building2,
  FilePenLine,
  Landmark,
  LockKeyhole,
  Mail,
  Rocket,
  Rows3,
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
  "border-[#ff6b3d]/20 bg-[#fff9f5]",
  "border-[#4f7dac]/20 bg-[#f6f9fc]",
  "border-[#76539f]/20 bg-[#faf8fd]",
  "border-[#2f7d57]/20 bg-[#f5faf7]",
];

export function PreviewDashboard() {
  const { state, hasHydrated } = useDemo();
  const { session } = useAssessment();
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const report = session.report;

  if (!hasHydrated) {
    return <div className="rounded-[24px] border border-[var(--border)] bg-white p-8 text-sm text-[#6f685f]">Opening your Preview workspace…</div>;
  }

  if (!state.isAuthenticated) {
    return (
      <section className="mx-auto max-w-xl rounded-[26px] border border-[var(--border)] bg-white p-6 text-center shadow-[0_24px_70px_rgba(17,17,17,0.06)] sm:p-8">
        {clerkConfigured ? <ClerkIdentityBridge /> : null}
        <LockKeyhole className="mx-auto size-6 text-[#ff6b3d]" />
        <h1 className="instrument-serif mt-3 text-4xl">Save this assessment first.</h1>
        <p className="mt-3 text-sm leading-6 text-[#6f685f]">Return to your result to continue into the Preview workspace.</p>
        <Button className="mt-5" onClick={() => window.location.assign("/assessment/result")}>
          Return to assessment
          <ArrowRight className="size-4" />
        </Button>
      </section>
    );
  }

  if (!report) {
    return (
      <section className="mx-auto max-w-xl rounded-[26px] border border-[var(--border)] bg-white p-6 text-center sm:p-8">
        <h1 className="instrument-serif text-4xl">Start with your assessment.</h1>
        <p className="mt-3 text-sm leading-6 text-[#6f685f]">A funding diagnosis unlocks this workspace.</p>
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
      <header className="flex flex-col gap-4 border-b border-black/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#171513] text-white"><UserRound className="size-4.5" /></span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{founderName}</p>
            <p className="truncate text-xs text-[#8b8276]">{startupName}</p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2f7d57]/20 bg-[#f3fbf6] px-3 py-1.5 text-[11px] font-semibold text-[#2f7d57]"><span className="size-1.5 rounded-full bg-[#2f7d57]" />Saved assessment</span>
      </header>

      <section className="mt-5 grid overflow-hidden rounded-[24px] border border-[var(--border)] bg-white md:grid-cols-[150px_minmax(0,1fr)_220px]">
        <div className="flex items-center gap-4 border-b border-black/8 p-5 md:block md:border-b-0 md:border-r">
          <div className="grid size-20 shrink-0 place-items-center rounded-full bg-[#fff0e8] text-center">
            <span><strong className="instrument-serif text-4xl font-normal">{report.readinessScore}</strong><span className="text-[10px] text-[#8b8276]">/100</span></span>
          </div>
          <div className="md:mt-3"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b8276]">Readiness</p><p className="mt-1 text-xs font-semibold">{report.confidence} confidence</p></div>
        </div>
        <div className="border-b border-black/8 p-5 md:border-b-0 md:border-r">
          <p className="eyebrow">Your diagnosis</p>
          <h1 className="instrument-serif mt-2 text-balance text-3xl leading-tight">{report.verdict}</h1>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#bd4e28]">Biggest weakness</p><p className="mt-1 text-sm font-semibold">{weakest?.label ?? "Evidence unavailable"}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2f7d57]">Next action</p><p className="mt-1 text-sm font-semibold">{nextAction?.title ?? "Add supporting evidence"}</p></div>
          </div>
        </div>
        <div className="flex flex-col justify-center p-5">
          <p className="line-clamp-3 text-xs leading-5 text-[#6f685f]">{nextAction?.detail}</p>
          <Link className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#171513] px-4 text-sm font-semibold text-white hover:bg-[#302d29]" href="/assessment/result">View assessment <ArrowRight className="size-3.5" /></Link>
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-end justify-between gap-4">
          <div><p className="eyebrow">Opportunity overview</p><h2 className="mt-1 text-xl font-semibold">Four ways to fund the next step</h2></div>
          <Link className="hidden text-xs font-semibold hover:text-[#ff6b3d] sm:inline-flex" href="/search">Explore all <ArrowRight className="ml-1 size-3.5" /></Link>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PREVIEW_MATCH_CATEGORIES.map((category, index) => (
            <Link className={`group rounded-[17px] border p-4 transition-transform hover:-translate-y-0.5 motion-reduce:transition-none ${MATCH_TONES[index]}`} href="/search" key={category.label}>
              <div className="flex items-center justify-between gap-3"><span className="grid size-9 place-items-center rounded-xl bg-white"><CategoryIcon label={category.label} /></span><ArrowRight className="size-3.5 text-[#8b8276] transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" /></div>
              <p className="mt-3 text-sm font-semibold">{category.label.replace(" and VC firms", "")}</p>
              <p className="mt-1 text-xs text-[#8b8276]">{category.count} Preview paths</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div><p className="eyebrow">Top opportunities</p><h2 className="mt-1 text-xl font-semibold">A first look at possible paths</h2></div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {matches.slice(0, 4).map((match, index) => (
            <article className={`rounded-[19px] border p-4 ${MATCH_TONES[index]}`} key={match.id}>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm"><CategoryIcon label={match.category} /></span>
                <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b8276]">{match.category}</p><h3 className="mt-1 font-semibold">{match.name}</h3></div>
                <span className="rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-[#6f685f]">Preview example</span>
              </div>
              <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#6f685f]">{match.reason}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-[#6f685f]"><span className="rounded-full bg-white/80 px-2 py-1">{match.stage}</span><span className="rounded-full bg-white/80 px-2 py-1">{match.geography}</span><span className="rounded-full bg-white/80 px-2 py-1">{match.value}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[24px] bg-[#171513] p-5 text-white sm:p-6">
        <div className="flex items-center justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">What unlocks next</p><h2 className="mt-2 text-2xl font-semibold">Turn the diagnosis into momentum.</h2></div><Sparkles className="size-5 shrink-0 text-[#ff8c67]" /></div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {LOCKED_MODULES.map(({ capabilities, description, icon: Icon, title }) => (
            <article className="rounded-[17px] border border-white/10 bg-white/[0.05] p-4" key={title}>
              <div className="flex items-center justify-between gap-3"><span className="grid size-9 place-items-center rounded-xl bg-white/10"><Icon className="size-4 text-[#ff9c7c]" /></span><span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-white/60"><LockKeyhole className="size-2.5" />Early access</span></div>
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-white/55">{description}</p>
              <ul className="mt-3 space-y-1.5 text-xs text-white/75">{capabilities.map((item) => <li className="flex items-center gap-2" key={item}><span className="size-1 rounded-full bg-[#ff8c67]" />{item}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <details className="mx-auto mt-4 max-w-2xl px-3 py-2 text-center text-[11px] leading-5 text-[#8b8276]">
        <summary className="cursor-pointer rounded-md font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b3d]">About this Preview</summary>
        <p className="mt-2">Opportunity examples illustrate the future experience and are not live ranked recommendations.</p>
      </details>
    </div>
  );
}
