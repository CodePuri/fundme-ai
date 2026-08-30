"use client";

import { useEffect, useState, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  ArrowRight,
  BadgeIndianRupee,
  Building2,
  Check,
  FilePenLine,
  Landmark,
  LockKeyhole,
  LogOut,
  Mail,
  RefreshCw,
  Rocket,
  Rows3,
  ShieldCheck,
  Sparkles,
  UserRound,
  Share2,
  Copy,
  Users,
  Trophy,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useDemo } from "@/components/app/demo-provider";
import { useAssessment } from "@/components/assessment/assessment-provider";
import { Button } from "@/components/ui/button";
import { getPreviewMatches, PREVIEW_MATCH_CATEGORIES } from "@/lib/assessment/preview-matches";
import type { FundingReadinessReport } from "@/lib/assessment/types";

function CategoryIcon({ label }: { label: string }) {
  const className = "size-4";
  if (label.includes("Accelerator")) return <Rocket className={className} />;
  if (label.includes("Incubator")) return <Building2 className={className} />;
  if (label.includes("Grant")) return <Landmark className={className} />;
  return <BadgeIndianRupee className={className} />;
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
  const { isLoaded: clerkLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { state, signIn, hasHydrated: demoHydrated } = useDemo();
  const { session } = useAssessment();
  const searchParams = useSearchParams();
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const [serverAssessment, setServerAssessment] = useState<any>(null);
  const [serverFounder, setServerFounder] = useState<any>(null);
  const [serverStartup, setServerStartup] = useState<any>(null);
  const [loadingServer, setLoadingServer] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const claimedRef = useRef(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [referralStats, setReferralStats] = useState<{
    referralCode: string;
    referralCount: number;
    priorityRank: number;
    priorityTier: string;
    referralLink: string;
  } | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Load public share token and referral stats
  useEffect(() => {
    const claimToken = searchParams.get("claim_token") || (typeof window !== "undefined" ? window.localStorage.getItem("fundme-claim-token") : null);
    const userId = user?.id || "preview-founder";

    // 1. Fetch referral stats
    fetch(`/api/referrals/stats?clerkUserId=${encodeURIComponent(userId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.stats) setReferralStats(data.stats);
      })
      .catch(() => {});

    // 2. Fetch or create public share
    if (claimToken || serverAssessment?.id) {
      fetch("/api/assessment/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: serverAssessment?.id,
          claimToken: claimToken || undefined,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.shareUrl) {
            const fullUrl = `${window.location.origin}${data.shareUrl}`;
            setShareUrl(fullUrl);
          }
        })
        .catch(() => {});
    }
  }, [user?.id, searchParams, serverAssessment?.id]);

  const copyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {}
  };

  const copyReferralLink = async () => {
    if (!referralStats?.referralLink) return;
    try {
      await navigator.clipboard.writeText(referralStats.referralLink);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch {}
  };


  // Auto-sync Clerk sign-in state to Demo state
  useEffect(() => {
    if (clerkLoaded && isSignedIn && !state.isAuthenticated) {
      signIn();
    }
  }, [clerkLoaded, isSignedIn, signIn, state.isAuthenticated]);

  // Load from server on Clerk authentication
  useEffect(() => {
    if (!clerkLoaded || !isSignedIn || claimedRef.current) return;

    claimedRef.current = true;
    const urlClaimToken = searchParams.get("claim_token");
    let localClaimToken: string | null = null;
    try {
      localClaimToken = window.localStorage.getItem("fundme-claim-token");
    } catch {}

    const claimToken = urlClaimToken || localClaimToken || session.claimToken;

    async function syncAndFetch() {
      setLoadingServer(true);
      try {
        // 1. If we have a claim token or local session, save/claim to server
        if (claimToken || (session.report && session.input.founderName)) {
          setSaveStatus("Saving assessment to your account...");
          await fetch("/api/assessment/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              claimToken: claimToken || undefined,
              session: session.report ? session : undefined,
            }),
          });
          try {
            window.localStorage.removeItem("fundme-claim-token");
          } catch {}
          setSaveStatus(null);
        }

        // 2. Fetch latest saved assessment from server
        const res = await fetch("/api/assessment/latest");
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.hasAssessment) {
            setServerAssessment(data.assessment);
            setServerFounder(data.founder);
            setServerStartup(data.startup);
          }
        }
      } catch (err) {
        console.warn("Error syncing or loading assessment from server:", err);
      } finally {
        setLoadingServer(false);
      }
    }

    syncAndFetch();
  }, [clerkLoaded, isSignedIn, searchParams, session]);

  if (!demoHydrated || (isSignedIn && loadingServer && !serverAssessment)) {
    return <div className="premium-card p-8 text-[15px] text-[var(--text-secondary)]">Opening your saved assessment workspace…</div>;
  }

  // Determine active report and names
  const report: FundingReadinessReport | null = serverAssessment ? {
    rubricVersion: serverAssessment.rubric_version || "fundme-demo-rubric@1",
    generatedAt: serverAssessment.created_at,
    readinessScore: serverAssessment.readiness_score,
    verdict: serverAssessment.verdict,
    conciseVerdict: serverAssessment.concise_verdict || serverAssessment.verdict,
    evidenceCoverage: serverAssessment.evidence_coverage,
    confidence: serverAssessment.confidence,
    completionState: serverAssessment.completion_state,
    tractionState: serverAssessment.traction_state,
    strongestDimension: serverAssessment.strongest_dimension,
    weakestDimension: serverAssessment.weakest_dimension,
    dimensions: serverAssessment.dimensions || [],
    evidence: serverAssessment.evidence || [],
    findings: serverAssessment.findings || [],
    founderReview: serverAssessment.founder_review || { credibility: "", founderMarketFit: "", profilePositioning: "" },
    startupReview: serverAssessment.startup_review || { problem: "", solution: "", market: "", differentiation: "", traction: "", fundingNarrative: "" },
    deckReview: serverAssessment.deck_review || { status: "not-provided", summary: "", findings: [] },
    actions: serverAssessment.actions || [],
  } : session.report;

  const founderName = serverFounder?.name
    || serverAssessment?.founder_name
    || user?.fullName
    || user?.firstName
    || session.input.founderName.trim()
    || "Founder";

  const startupName = serverStartup?.startup_name
    || serverAssessment?.startup_name
    || session.input.startupName.trim()
    || "Your startup";

  const isAuthenticated = state.isAuthenticated || isSignedIn;

  if (!isAuthenticated && !serverAssessment) {
    return (
      <section className="premium-card mx-auto max-w-xl p-6 text-center sm:p-8">
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
        <div className="flex items-center gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#246b48]/20 bg-[#f3fbf6] px-3 py-1.5 text-[13px] font-semibold text-[var(--status-positive)]">
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            {serverAssessment ? "Saved to account" : "Saved assessment"}
          </span>
          {isSignedIn ? (
            <button
              onClick={() => signOut({ redirectUrl: "/" })}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 text-[13px] font-medium text-[var(--text-secondary)] hover:bg-black/5"
              type="button"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          ) : null}
        </div>
      </header>

      {saveStatus ? (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 flex items-center gap-2">
          <RefreshCw className="size-4 animate-spin" />
          {saveStatus}
        </div>
      ) : null}

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
      {/* Public Share & Referral Waitlist Loop */}
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Public Share Card */}
        <div className="premium-card flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-orange-100 text-[#ff6b3d]">
                  <Share2 className="size-4" />
                </span>
                <h2 className="text-[15px] font-semibold text-[var(--foreground)]">Public Shareable Diagnosis</h2>
              </div>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">Privacy-Safe</span>
            </div>
            <p className="mt-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Share a clean, verified preview of your funding fit score without exposing private pitch decks or contact details.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-medium" onClick={copyShareLink} disabled={!shareUrl}>
              {copiedShare ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              {copiedShare ? "Link copied!" : "Copy public link"}
            </Button>
            {shareUrl ? (
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-1 rounded-md px-3 text-xs font-medium text-[var(--text-secondary)] hover:bg-black/5"
              >
                Open preview <ExternalLink className="size-3" />
              </a>
            ) : null}
          </div>
        </div>

        {/* Waitlist Priority & Referral Card */}
        <div className="premium-card flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-emerald-100 text-[#246b48]">
                  <Trophy className="size-4" />
                </span>
                <h2 className="text-[15px] font-semibold text-[var(--foreground)]">Early Access Priority</h2>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                {referralStats?.priorityTier || "Standard Waitlist"}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                #{referralStats?.priorityRank || 100}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {referralStats?.referralCount || 0} founders referred
              </span>
            </div>
            <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
              Each founder who assesses their startup via your link moves your workspace forward on the waitlist.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-medium" onClick={copyReferralLink} disabled={!referralStats?.referralLink}>
              {copiedRef ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              {copiedRef ? "Referral link copied!" : "Copy referral invite"}
            </Button>
          </div>
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
