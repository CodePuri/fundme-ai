"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  Check,
  ExternalLink,
  LockKeyhole,
  Share2,
  Sparkles,
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

const LOCKED_ACTIONS = [
  "Optimize founder profile",
  "Optimize startup narrative",
  "Improve pitch deck",
  "Draft outreach message",
  "Message or apply",
  "View complete match list",
  "Track applications",
];

export function PreviewDashboard() {
  const { state, hasHydrated } = useDemo();
  const { session } = useAssessment();
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const report = session.report;

  if (!hasHydrated) {
    return <div className="rounded-[24px] border border-[var(--border)] bg-white p-8 text-sm text-[#6f685f]">Opening the browser-local Preview workspace…</div>;
  }

  if (!state.isAuthenticated) {
    return (
      <section className="mx-auto max-w-xl rounded-[26px] border border-[var(--border)] bg-white p-6 text-center shadow-[0_24px_70px_rgba(17,17,17,0.06)] sm:p-8">
        {clerkConfigured ? <ClerkIdentityBridge /> : null}
        <LockKeyhole className="mx-auto size-6 text-[#ff6b3d]" />
        <h1 className="instrument-serif mt-3 text-4xl">Complete the Preview handoff.</h1>
        <p className="mt-3 text-sm leading-6 text-[#6f685f]">
          This route contains only browser-local assessment data and deterministic fixtures. Return to your diagnosis to activate a Preview profile.
        </p>
        <Button className="mt-5" onClick={() => window.location.assign("/assessment/result")}>
          Return to diagnosis
          <ArrowRight className="size-4" />
        </Button>
      </section>
    );
  }

  if (!report) {
    return (
      <section className="mx-auto max-w-xl rounded-[26px] border border-[var(--border)] bg-white p-6 text-center sm:p-8">
        <h1 className="instrument-serif text-4xl">No saved assessment yet.</h1>
        <p className="mt-3 text-sm leading-6 text-[#6f685f]">Run the free diagnosis first. The resulting Preview report will be stored in this browser.</p>
        <Button className="mt-5" onClick={() => window.location.assign("/assessment")}>Start assessment <ArrowRight className="size-4" /></Button>
      </section>
    );
  }

  const matches = getPreviewMatches();
  const weakest = report.dimensions.find((dimension) => dimension.id === report.weakestDimension);
  const nextAction = report.actions[0];

  return (
    <div className="mx-auto max-w-[1080px]">
      <div className="flex flex-col gap-3 border-b border-black/8 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Tab-local Preview workspace</p>
          <h1 className="instrument-serif mt-2 text-4xl leading-tight sm:text-5xl">Your funding path, in one view.</h1>
          <p className="mt-2 text-sm text-[#6f685f]">Assessment state and deterministic fixtures only. Browser persistence is not guaranteed; no Production persistence or live matching occurs.</p>
        </div>
        <span className="w-fit rounded-full border border-[#ff6b3d]/25 bg-[#fff4ed] px-3 py-1.5 text-[11px] font-semibold text-[#a64626]">Preview profile active</span>
      </div>

      <section className="mt-5 grid overflow-hidden rounded-[26px] border border-[var(--border)] bg-white md:grid-cols-[180px_1fr_1fr]">
        <div className="border-b border-black/8 bg-[#171513] p-5 text-white md:border-b-0 md:border-r">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">Saved assessment</p>
          <p className="instrument-serif mt-3 text-6xl">{report.readinessScore}</p>
          <p className="mt-1 text-xs text-white/55">out of 100 · {report.confidence} confidence</p>
        </div>
        <div className="border-b border-black/8 p-5 md:border-b-0 md:border-r">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8b8276]">Key weakness</p>
          <h2 className="mt-2 font-semibold">{weakest?.label ?? "Evidence unavailable"}</h2>
          <p className="mt-2 text-sm leading-6 text-[#6f685f]">{weakest?.explanation}</p>
        </div>
        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8b8276]">Next action</p>
          <h2 className="mt-2 font-semibold">{nextAction?.title ?? "Add supporting evidence"}</h2>
          <p className="mt-2 text-sm leading-6 text-[#6f685f]">{nextAction?.detail}</p>
        </div>
      </section>

      <section className="mt-5">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Opportunity map</p>
            <h2 className="instrument-serif mt-2 text-3xl">Four paths, limited Preview visibility.</h2>
          </div>
          <Link className="hidden items-center gap-1.5 text-sm font-semibold hover:text-[#ff6b3d] sm:inline-flex" href="/search">Open public Explore <ExternalLink className="size-3.5" /></Link>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PREVIEW_MATCH_CATEGORIES.map((category) => (
            <div className="rounded-[16px] border border-[var(--border)] bg-white p-4" key={category.label}>
              <p className="text-sm font-semibold">{category.label.replace(" and VC firms", "")}</p>
              <p className="mt-1 text-xs text-[#8b8276]">{category.count} Preview fixtures</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-[26px] border border-[var(--border)] bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Limited Preview matches</p>
            <h2 className="instrument-serif mt-2 text-3xl">A small sample, not a live ranked list.</h2>
          </div>
          <span className="w-fit rounded-full bg-[#f6f1ea] px-3 py-1.5 text-[11px] font-semibold">Verification pending</span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {matches.slice(0, 4).map((match) => (
            <article className="rounded-[18px] border border-black/8 bg-[#fbf8f4] p-4" key={match.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b8276]">{match.category}</p>
                  <h3 className="mt-1 font-semibold">{match.name}</h3>
                </div>
                <span className="max-w-32 rounded-full bg-white px-2.5 py-1 text-right text-[10px] font-semibold leading-4 text-[#2f7d57]">{match.previewSignal}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#6f685f]">{match.reason}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div><dt className="text-[#9a9186]">Stage</dt><dd className="mt-0.5 font-medium">{match.stage}</dd></div>
                <div><dt className="text-[#9a9186]">Geography</dt><dd className="mt-0.5 font-medium">{match.geography}</dd></div>
                <div><dt className="text-[#9a9186]">Value</dt><dd className="mt-0.5 font-medium">{match.value}</dd></div>
                <div><dt className="text-[#9a9186]">Deadline</dt><dd className="mt-0.5 font-medium">{match.deadline}</dd></div>
              </dl>
              <p className="mt-3 text-[10px] text-[#9a9186]">{match.sourceStatus}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-[24px] border border-[var(--border)] bg-white p-5">
          <p className="eyebrow">Free actions</p>
          <div className="mt-4 grid gap-2">
            <Link className="flex min-h-11 items-center justify-between rounded-xl border border-black/8 px-3 text-sm font-semibold hover:border-black/20" href="/assessment/result">View saved assessment <ArrowRight className="size-3.5" /></Link>
            <Link className="flex min-h-11 items-center justify-between rounded-xl border border-black/8 px-3 text-sm font-semibold hover:border-black/20" href="/search">Open public Explore <ExternalLink className="size-3.5" /></Link>
            <Link className="flex min-h-11 items-center justify-between rounded-xl border border-black/8 px-3 text-sm font-semibold hover:border-black/20" href="/assessment/result">Share assessment <Share2 className="size-3.5" /></Link>
          </div>
        </div>

        <div className="rounded-[24px] border border-[var(--border)] bg-[#171513] p-5 text-white">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">Optimization workspace</p><h2 className="instrument-serif mt-2 text-3xl">Build the stronger version next.</h2></div>
            <Sparkles className="size-5 text-[#ff8c67]" />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {LOCKED_ACTIONS.map((action) => (
              <div className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-xs" key={action}>
                <span>{action}</span>
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white/60">Early access</span>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-white/55"><Check className="mt-0.5 size-3.5 shrink-0 text-[#7ed6a4]" />No payment flow is implemented in this Preview. Locked actions do not mutate private data.</p>
        </div>
      </section>
    </div>
  );
}
