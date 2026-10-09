"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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
import { forOwner, localReportForViewer } from "@/lib/assessment/owner-scoped";
import { loadSession, PENDING_ASSESSMENT_SAVE_KEY } from "@/lib/assessment/persistence";
import type { FundingReadinessReport, GrillSession } from "@/lib/assessment/types";
import type { ReferralStats } from "@/lib/analytics/referrals";

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
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const isSignedIn = Boolean(clerkSignedIn);
  const { state, signIn, hasHydrated: demoHydrated } = useDemo();
  const { session, hasHydrated: assessmentHydrated, finalizeAnonymousSessionSave } = useAssessment();
  const searchParams = useSearchParams();

  const [serverRecord, setServerRecord] = useState<{
    ownerId: string;
    assessment: any;
    founder: any;
    startup: any;
  } | null>(null);
  const activeServerRecord = forOwner(serverRecord, user?.id);
  const serverAssessment = activeServerRecord?.assessment ?? null;
  const serverFounder = activeServerRecord?.founder ?? null;
  const serverStartup = activeServerRecord?.startup ?? null;
  const [loadingServer, setLoadingServer] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const syncRequestRef = useRef(0);
  const completedSaveRef = useRef<string | null>(null);
  const urlClaimToken = searchParams.get("claim_token");
  const sessionPayload = useMemo(() => session.report ? JSON.stringify(session) : null, [session]);
  const [shareRecord, setShareRecord] = useState<{ ownerId: string; url: string } | null>(null);
  const shareUrl = forOwner(shareRecord, user?.id)?.url ?? null;
  const [copiedShare, setCopiedShare] = useState(false);
  const [referralRecord, setReferralRecord] = useState<{ ownerId: string; stats: ReferralStats } | null>(null);
  const referralStats = forOwner(referralRecord, user?.id)?.stats ?? null;
  const [copiedRef, setCopiedRef] = useState(false);

  // Account data is fetched only for the current Clerk identity.
  useEffect(() => {
    if (!isSignedIn || !user?.id) return;
    const ownerId = user.id;
    let active = true;

    fetch("/api/referrals/stats", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (active && data.ok && data.stats) setReferralRecord({ ownerId, stats: data.stats });
      })
      .catch(() => {});

    if (serverAssessment?.id) {
      fetch("/api/assessment/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId: serverAssessment.id }),
      })
        .then(res => res.json())
        .then(data => {
          if (active && data.ok && data.shareUrl) {
            const fullUrl = `${window.location.origin}${data.shareUrl}`;
            setShareRecord({ ownerId, url: fullUrl });
          }
        })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [isSignedIn, user?.id, serverAssessment?.id]);

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

  // A claim token alone never authorizes a server save or an account lookup.
  useEffect(() => {
    if (!clerkLoaded || !isSignedIn || !user?.id || !assessmentHydrated) return;

    let localClaimToken: string | null = null;
    try {
      localClaimToken = window.localStorage.getItem("fundme-claim-token");
    } catch {}

    let pendingSession: GrillSession | null = null;
    let pendingClaimToken: string | null = null;
    let pendingSaveMissing = false;
    try {
      const rawIntent = window.sessionStorage.getItem(PENDING_ASSESSMENT_SAVE_KEY);
      if (rawIntent) {
        const intent = JSON.parse(rawIntent) as { generatedAt?: string; claimToken?: string };
        const candidate = loadSession(window.localStorage);
        if (candidate.report?.generatedAt === intent.generatedAt && !candidate.reportOwnerId
          && intent.claimToken && /^[a-zA-Z0-9-]{20,128}$/.test(intent.claimToken)) {
          pendingSession = candidate;
          pendingClaimToken = intent.claimToken;
        } else {
          pendingSaveMissing = true;
        }
      }
    } catch {
      pendingSaveMissing = true;
    }
    const ownedLocalToken = pendingClaimToken || (
      session.report && session.claimToken === localClaimToken
        && session.reportOwnerId === user.id ? localClaimToken : null
    );
    const claimToken = pendingClaimToken || urlClaimToken || ownedLocalToken;
    const ownerId = user.id;
    const saveKey = `${ownerId}:${claimToken || pendingSession?.report?.generatedAt || ""}`;
    const requestId = ++syncRequestRef.current;
    const isCurrentRequest = () => syncRequestRef.current === requestId;

    async function syncAndFetch() {
      setLoadingServer(true);
      setSaveError(null);
      if (pendingSaveMissing && isCurrentRequest()) {
        setSaveError("Your browser assessment could not be recovered. If you downloaded it, keep that copy.");
      }
      if ((claimToken || pendingSession) && completedSaveRef.current !== saveKey) {
        setSaveStatus("Saving assessment to your account...");
        try {
          const saveResponse = await fetch("/api/assessment/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              claimToken: claimToken || undefined,
              session: pendingSession || (sessionPayload && session.claimToken === claimToken
                && session.reportOwnerId === ownerId ? JSON.parse(sessionPayload) : undefined),
            }),
          });
          if (!saveResponse.ok || !(await saveResponse.json()).ok) {
            throw new Error("Assessment save was not confirmed");
          }
          if (isCurrentRequest()) {
            completedSaveRef.current = saveKey;
            try {
              window.localStorage.removeItem("fundme-claim-token");
              window.sessionStorage.removeItem(PENDING_ASSESSMENT_SAVE_KEY);
            } catch {}
            if (pendingSession) finalizeAnonymousSessionSave(pendingSession);
          }
        } catch {
          if (isCurrentRequest()) setSaveError("We could not attach this browser assessment to your account.");
        } finally {
          if (isCurrentRequest()) setSaveStatus(null);
        }
      }

      try {
        const response = await fetch("/api/assessment/latest", { cache: "no-store" });
        if (response.status === 404) {
          if (isCurrentRequest()) setServerRecord({ ownerId, assessment: null, founder: null, startup: null });
          return;
        }
        if (!response.ok) throw new Error("Assessment lookup failed");
        const data = await response.json();
        if (!data.ok) throw new Error("Assessment lookup was not confirmed");
        if (isCurrentRequest()) {
          setServerRecord({
            ownerId,
            assessment: data.hasAssessment ? data.assessment : null,
            founder: data.hasAssessment ? data.founder : null,
            startup: data.hasAssessment ? data.startup : null,
          });
        }
      } catch {
        if (isCurrentRequest()) setSaveError("We could not load your saved assessment. Refresh this page to retry.");
      } finally {
        if (isCurrentRequest()) setLoadingServer(false);
      }
    }

    void syncAndFetch();
    return () => {
      if (isCurrentRequest()) syncRequestRef.current += 1;
    };
  }, [finalizeAnonymousSessionSave, assessmentHydrated, clerkLoaded, isSignedIn, session.claimToken, session.report, session.reportOwnerId, sessionPayload, urlClaimToken, user?.id]);

  if (!demoHydrated || (clerkConfigured && !clerkLoaded) || (isSignedIn && !assessmentHydrated)
    || (isSignedIn && loadingServer && !serverAssessment)) {
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
  } : localReportForViewer(session.report, isSignedIn, session.reportOwnerId);

  const founderName = serverFounder?.name
    || serverAssessment?.founder_name
    || user?.fullName
    || user?.firstName
    || (!isSignedIn ? session.input.founderName.trim() : "")
    || "Founder";

  const startupName = serverStartup?.startup_name
    || serverAssessment?.startup_name
    || (!isSignedIn ? session.input.startupName.trim() : "")
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
        {saveError ? <p className="mt-3 text-sm text-[var(--status-critical)]" role="alert">{saveError}</p> : null}
        <Button className="mt-5" onClick={() => window.location.assign("/assessment")}>Start assessment <ArrowRight className="size-4" /></Button>
      </section>
    );
  }

  const matches = getPreviewMatches();
  const weakest = report.dimensions.find((dimension) => dimension.id === report.weakestDimension);
  const nextAction = report.actions[0];

  return (
    <div className="mx-auto max-w-[1080px] space-y-6">
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
            {serverAssessment ? "Saved to account" : "Preview assessment (this browser)"}
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
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 flex items-center gap-2">
          <RefreshCw className="size-4 animate-spin" />
          {saveStatus}
        </div>
      ) : null}
      {saveError ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900" role="alert">{saveError}</p> : null}

      {/* 1. Core Diagnosis Status */}
      <section className="premium-card grid overflow-hidden md:grid-cols-[170px_minmax(0,1fr)_240px]">
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
          <Link className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#171513] px-4 text-sm font-semibold text-white hover:bg-[#302d29]" href="#diagnostic">View assessment <ArrowRight className="size-3.5" /></Link>
        </div>
      </section>

      {/* 2. Top 3 Highest-Leverage Fixes Checklist */}
      <section className="premium-card p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5">
          <div>
            <p className="eyebrow">Priority Fixes</p>
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">What to improve before talking to investors</h2>
          </div>
          <Link href="#diagnostic" className="text-xs font-semibold text-[#a64626] hover:underline">
            Full diagnostic report →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {report.actions.slice(0, 3).map((action, idx) => (
            <div key={idx} className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid size-6 place-items-center rounded-full bg-[#171513] text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="rounded-full bg-white border border-black/8 px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)] capitalize">
                    {action.horizon.replace("-", " ")}
                  </span>
                </div>
                <h3 className="mt-2.5 text-[13px] font-semibold text-[var(--text-primary)]">{action.title}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">{action.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="premium-card scroll-mt-24 p-5 sm:p-6" id="diagnostic">
        <p className="eyebrow">Full diagnostic report</p>
        <h2 className="type-section-title mt-1">Your evidence and next steps</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{report.conciseVerdict}</p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[var(--surface-elevated)] p-3"><dt className="text-xs text-[var(--text-secondary)]">Evidence coverage</dt><dd className="mt-1 font-semibold">{report.evidenceCoverage}%</dd></div>
          <div className="rounded-xl bg-[var(--surface-elevated)] p-3"><dt className="text-xs text-[var(--text-secondary)]">Confidence</dt><dd className="mt-1 font-semibold capitalize">{report.confidence}</dd></div>
          <div className="rounded-xl bg-[var(--surface-elevated)] p-3"><dt className="text-xs text-[var(--text-secondary)]">Assessment</dt><dd className="mt-1 font-semibold capitalize">{report.completionState}</dd></div>
        </dl>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <h3 className="font-semibold">Scoring dimensions</h3>
            <div className="mt-2 divide-y divide-[var(--border)]">
              {report.dimensions.map((dimension) => (
                <details className="py-2" key={dimension.id}>
                  <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm font-medium"><span>{dimension.label}</span><span>{dimension.score}/100</span></summary>
                  <p className="pb-2 text-sm text-[var(--text-secondary)]">{dimension.explanation}</p>
                </details>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Evidence and findings</h3>
            <ul className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
              {report.evidence.map((item) => <li key={item.id}><span className="font-medium text-[var(--text-primary)]">{item.label}:</span> {item.state === "missing" ? "Not provided" : item.value}</li>)}
            </ul>
            <ul className="mt-4 space-y-3 text-sm">
              {report.findings.map((finding) => <li className="rounded-xl bg-[var(--surface-elevated)] p-3" key={finding.id}><p>{finding.explanation}</p><p className="mt-1 text-[var(--text-secondary)]">Next: {finding.action}</p></li>)}
            </ul>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] p-4"><h3 className="font-semibold">Founder</h3>{Object.values(report.founderReview).filter(Boolean).map((detail, index) => <p className="mt-2 text-sm text-[var(--text-secondary)]" key={index}>{detail}</p>)}</div>
          <div className="rounded-xl border border-[var(--border)] p-4"><h3 className="font-semibold">Startup</h3>{Object.values(report.startupReview).filter(Boolean).map((detail, index) => <p className="mt-2 text-sm text-[var(--text-secondary)]" key={index}>{detail}</p>)}</div>
          <div className="rounded-xl border border-[var(--border)] p-4"><h3 className="font-semibold">Pitch deck</h3><p className="mt-2 text-sm text-[var(--text-secondary)]">{report.deckReview.summary}</p>{report.deckReview.findings.map((finding, index) => <p className="mt-2 text-sm text-[var(--text-secondary)]" key={index}>{finding}</p>)}</div>
        </div>
        <h3 className="mt-5 font-semibold">Action plan</h3>
        <ol className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
          {report.actions.map((action, index) => <li key={`${action.horizon}-${index}`}><span className="font-medium text-[var(--text-primary)]">{action.title}:</span> {action.detail}</li>)}
        </ol>
      </section>

      {/* 3. Public Share & Referral Waitlist Loop */}
      <section className="grid gap-4 md:grid-cols-2">
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

      <section className="premium-card mt-6 scroll-mt-24 overflow-hidden p-5 sm:p-6" id="unlock-options">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><span className="inline-flex items-center gap-2 rounded-full border border-[#ff6b3d]/25 bg-[#fff8f4] px-3 py-1.5 text-[13px] font-semibold text-[#963b1a]"><Sparkles aria-hidden="true" className="size-3.5" />Early access</span><h2 className="type-section-title mt-3">Turn the diagnosis into momentum.</h2></div>
          <Link className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#171513] px-5 text-[15px] font-semibold text-white hover:bg-[#302d29] sm:w-auto" href="#unlock-grid">Review unlock options <ArrowRight className="size-4" /></Link>
        </div>
        <div className="mt-5 grid scroll-mt-24 gap-3 md:grid-cols-3" id="unlock-grid">
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
