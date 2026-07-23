"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Download,
  ExternalLink,
  LockKeyhole,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useDemo } from "@/components/app/demo-provider";
import { useAssessment } from "@/components/assessment/assessment-provider";
import { Button } from "@/components/ui/button";
import {
  getPreviewMatches,
  PREVIEW_MATCH_CATEGORIES,
  PREVIEW_OPPORTUNITY_COUNT,
} from "@/lib/assessment/preview-matches";
import { serializeReport, shareReport } from "@/lib/assessment/share";
import type { DimensionScore } from "@/lib/assessment/types";
import { earliestValidRoute } from "@/lib/assessment/validation";

function ScoreRing({ score }: { score: number }) {
  return (
    <div
      aria-label={`Funding readiness score ${score} out of 100`}
      className="relative grid size-32 shrink-0 place-items-center rounded-full"
      role="img"
      style={{ background: `conic-gradient(#ff6b3d ${score * 3.6}deg, #eee7de 0deg)` }}
    >
      <div className="grid size-[104px] place-items-center rounded-full bg-white text-center">
        <div>
          <strong className="instrument-serif text-[46px] font-normal leading-none">{score}</strong>
          <span className="text-xs text-[#8b8276]">/100</span>
        </div>
      </div>
    </div>
  );
}

function scoreTone(score: number): string {
  if (score >= 70) return "bg-[#2f9b62]";
  if (score >= 50) return "bg-[#e9a12f]";
  return "bg-[#ff6b3d]";
}

function DimensionRow({
  dimension,
  evidenceLabels,
}: {
  dimension: DimensionScore;
  evidenceLabels: string[];
}) {
  return (
    <article className="border-b border-black/8 py-4 last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold">{dimension.label}</h3>
        <span className="font-mono text-sm font-semibold">{dimension.score}</span>
      </div>
      <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eee7de]">
        <div className={`h-full rounded-full ${scoreTone(dimension.score)}`} style={{ width: `${dimension.score}%` }} />
      </div>
      <p className="mt-2 text-xs leading-5 text-[#6f685f]">{dimension.explanation}</p>
      <p className="mt-1.5 text-[11px] leading-4 text-[#91887d]">
        {evidenceLabels.length ? `Evidence: ${evidenceLabels.join(", ")}` : `Missing: ${dimension.missingEvidence[0] ?? "Supporting evidence"}`}
      </p>
    </article>
  );
}

function reportDisplayName(
  startupName: string,
  websiteUrl: string,
  deckName?: string,
): string {
  if (startupName.trim()) return startupName.trim();
  if (deckName) return deckName.replace(/\.pdf$/i, "");
  if (websiteUrl.trim()) {
    try {
      const normalized = /^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`;
      return new URL(normalized).hostname.replace(/^www\./, "");
    } catch {
      return websiteUrl.trim();
    }
  }
  return "Your startup";
}

export function FundingReadinessReport() {
  const router = useRouter();
  const { signIn } = useDemo();
  const { session, hasHydrated } = useAssessment();
  const report = session.report;
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const authTriggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const googleButtonRef = useRef<HTMLAnchorElement>(null);
  const previewButtonRef = useRef<HTMLButtonElement>(null);
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  useEffect(() => {
    if (!hasHydrated || report) return;
    router.replace(earliestValidRoute(session));
  }, [hasHydrated, report, router, session]);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    window.requestAnimationFrame(() => {
      (previousFocusRef.current ?? authTriggerRef.current)?.focus();
    });
  }, []);

  useEffect(() => {
    if (!authOpen) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : authTriggerRef.current;
    (clerkConfigured ? googleButtonRef.current : previewButtonRef.current)?.focus();
    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");
    const handleDialogKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAuth();
        return;
      }
      if (event.key !== "Tab") return;
      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelectors) ?? [],
      ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
      if (!focusableElements.length) {
        event.preventDefault();
        return;
      }
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleDialogKeydown);
    return () => window.removeEventListener("keydown", handleDialogKeydown);
  }, [authOpen, clerkConfigured, closeAuth]);

  const evidenceLabelsById = useMemo(
    () => new Map(report?.evidence.map((item) => [item.id, item.label]) ?? []),
    [report],
  );

  if (!report) {
    return (
      <div className="mx-auto max-w-xl rounded-[24px] border border-[var(--border)] bg-white p-8 text-center">
        <p className="font-semibold">Recovering your assessment…</p>
        <p className="mt-2 text-sm text-[#8b8276]">You’ll return to the earliest valid funnel step.</p>
      </div>
    );
  }

  const portableReport = serializeReport(report);
  const deck = session.artifacts.find((artifact) => artifact.kind === "pitch-deck");
  const displayName = reportDisplayName(session.input.startupName, session.input.websiteUrl, deck?.name);
  const matches = getPreviewMatches();
  const strongest = report.dimensions.find((item) => item.id === report.strongestDimension);
  const weakest = report.dimensions.find((item) => item.id === report.weakestDimension);
  const missingItems = report.findings
    .filter((finding) => finding.type !== "strength")
    .slice(0, 4);

  function download() {
    const blob = new Blob([portableReport], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `fundme-readiness-${displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "report"}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function share() {
    try {
      const result = await shareReport({
        title: `FundMe readiness — ${displayName}`,
        text: portableReport,
        share: navigator.share ? (data) => navigator.share(data) : undefined,
        writeText: (text) => navigator.clipboard.writeText(text),
      });
      setShareStatus(result === "shared" ? "Shared." : "Copied to clipboard.");
    } catch {
      setShareStatus("Sharing is unavailable in this browser. Download the text report instead.");
    }
  }

  function continueWithPreviewProfile() {
    signIn();
    router.push("/app/preview");
  }

  return (
    <>
    <div
      aria-hidden={authOpen ? true : undefined}
      className="mx-auto max-w-[1080px]"
      inert={authOpen}
    >
      <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-[0_24px_70px_rgba(17,17,17,0.06)]">
        <div className="grid gap-7 p-5 sm:p-8 lg:grid-cols-[140px_minmax(0,1fr)_220px] lg:items-center">
          <ScoreRing score={report.readinessScore} />
          <div className="min-w-0">
            <p className="eyebrow">Funding Readiness Score · {displayName}</p>
            <h1 className="instrument-serif mt-2 text-[42px] leading-[0.98] tracking-[-0.03em] sm:text-5xl">{report.verdict}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f685f]">{report.conciseVerdict}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
              <span className="rounded-full bg-[#f6f1ea] px-3 py-1.5">{report.completionState === "complete" ? "Complete assessment" : "Partial assessment"}</span>
              <span className="rounded-full bg-[#f6f1ea] px-3 py-1.5">Evidence {report.evidenceCoverage}%</span>
              <span className="rounded-full bg-[#f6f1ea] px-3 py-1.5">{report.confidence} confidence</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div className="rounded-[16px] bg-[#f3fbf6] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#2f7d57]">Strongest</p>
              <p className="mt-1 text-sm font-semibold">{strongest?.label ?? "Unavailable"}</p>
            </div>
            <div className="rounded-[16px] bg-[#fff4ed] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#bd4e28]">Weakest</p>
              <p className="mt-1 text-sm font-semibold">{weakest?.label ?? "Unavailable"}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[#faf7f2] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="flex items-start gap-2 text-[11px] leading-5 text-[#8b8276]">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#2f7d57]" />
            Founder-supplied text and attachment metadata only; not an investment decision.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={download} size="sm" variant="secondary"><Download className="size-3.5" />Download</Button>
            <Button onClick={share} size="sm" variant="secondary"><Share2 className="size-3.5" />Share</Button>
          </div>
          {shareStatus ? <span className="text-xs font-medium" role="status">{shareStatus}</span> : null}
        </div>
      </section>

      <section className="mt-5 rounded-[26px] border border-[var(--border)] bg-white px-5 py-2 sm:px-7">
        <div className="border-b border-black/8 py-5">
          <p className="eyebrow">Ten-dimension diagnosis</p>
          <h2 className="instrument-serif mt-2 text-3xl">What the submitted evidence supports.</h2>
        </div>
        <div className="grid gap-x-8 md:grid-cols-2">
          {report.dimensions.map((dimension) => (
            <DimensionRow
              dimension={dimension}
              evidenceLabels={dimension.evidenceUsed.map((id) => evidenceLabelsById.get(id) ?? id)}
              key={dimension.id}
            />
          ))}
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-[26px] border border-[var(--border)] bg-white">
        <div className="grid border-b border-black/8 bg-[#faf7f2] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#756d63] sm:grid-cols-2 sm:px-7">
          <span>What is missing</span>
          <span className="hidden sm:block">How to improve it</span>
        </div>
        {missingItems.length ? missingItems.map((finding, index) => (
          <article className="grid gap-2 border-b border-black/8 px-5 py-4 last:border-b-0 sm:grid-cols-2 sm:gap-8 sm:px-7" key={finding.id}>
            <div className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#fff0e8] text-xs font-semibold text-[#bd4e28]">{index + 1}</span>
              <p className="text-sm leading-6">{finding.explanation}</p>
            </div>
            <div className="flex gap-2 text-sm leading-6 text-[#5f584f]">
              <ArrowRight className="mt-1.5 hidden size-3.5 shrink-0 text-[#ff6b3d] sm:block" />
              <div><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b8276] sm:hidden">How to improve it</span>{finding.action}</div>
            </div>
          </article>
        )) : (
          <p className="px-5 py-5 text-sm text-[#6f685f]">No missing-evidence items were generated from this submission.</p>
        )}
      </section>

      <section className="mt-5 grid overflow-hidden rounded-[26px] border border-[var(--border)] bg-white lg:grid-cols-3">
        <article className="border-b border-black/8 p-5 lg:border-b-0 lg:border-r">
          <p className="eyebrow">Founder</p>
          <h2 className="mt-2 font-semibold">Credibility and fit</h2>
          <p className="mt-2 text-sm leading-6 text-[#6f685f]">{report.founderReview.credibility} {report.founderReview.founderMarketFit}</p>
        </article>
        <article className="border-b border-black/8 p-5 lg:border-b-0 lg:border-r">
          <p className="eyebrow">Startup</p>
          <h2 className="mt-2 font-semibold">Problem and proof</h2>
          <p className="mt-2 text-sm leading-6 text-[#6f685f]">{report.startupReview.problem} {report.startupReview.traction}</p>
        </article>
        <article className="p-5">
          <p className="eyebrow">Deck state</p>
          <h2 className="mt-2 font-semibold">{report.deckReview.status === "not-provided" ? "No deck provided" : "File received; contents unavailable"}</h2>
          <p className="mt-2 text-sm leading-6 text-[#6f685f]">{report.deckReview.summary}</p>
        </article>
      </section>

      <section className="mt-5 rounded-[28px] border border-[#ff6b3d]/25 bg-[#fffaf6] p-5 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">FundMe opportunity preview</p>
            <h2 className="instrument-serif mt-2 text-4xl leading-tight">
              {PREVIEW_OPPORTUNITY_COUNT} illustrative Preview opportunities across four funding paths
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f685f]">Deterministic Preview fixtures show the future matching shape. They are not live, personalized, or verified opportunities.</p>
          </div>
          <span className="w-fit rounded-full border border-[#ff6b3d]/25 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#a64626]">Preview data</span>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PREVIEW_MATCH_CATEGORIES.map((category) => (
            <div className="rounded-[16px] border border-black/8 bg-white p-3" key={category.label}>
              <p className="text-sm font-semibold">{category.label}</p>
              <p className="mt-1 text-xs text-[#8b8276]">{category.count} illustrative opportunities</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {matches.map((match) => (
            <article className="rounded-[18px] border border-black/8 bg-white p-4" key={match.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b8276]">{match.category}</p>
                  <h3 className="mt-1 font-semibold">{match.name}</h3>
                </div>
                <span className="max-w-32 rounded-full bg-[#f1f8f3] px-2.5 py-1 text-right text-[10px] font-semibold leading-4 text-[#2f7d57]">{match.previewSignal}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#6f685f]">{match.reason}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-[#777066]">
                <span className="rounded-full bg-[#f6f1ea] px-2 py-1">{match.stage}</span>
                <span className="rounded-full bg-[#f6f1ea] px-2 py-1">{match.geography}</span>
                <span className="rounded-full bg-[#f6f1ea] px-2 py-1">{match.value}</span>
              </div>
              <p className="mt-3 text-[10px] text-[#9a9186]">{match.sourceStatus} · {match.deadline}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-[20px] bg-[#171513] p-5 text-white sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-sm font-semibold">Keep the diagnosis and unlock the limited Preview workspace.</p>
            <p className="mt-1 text-xs leading-5 text-white/60">Authentication comes after value. No Production Supabase write or payment occurs.</p>
          </div>
          <Button ref={authTriggerRef} className="mt-4 min-h-12 shrink-0 border-white bg-white text-[#171513] hover:border-white hover:bg-[#f6f1ea] sm:mt-0" onClick={() => setAuthOpen(true)} size="lg">
            Save my assessment and see my matches
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs">
        <Link className="font-semibold text-[#6f685f] hover:text-[#171513]" href="/assessment">Start another assessment</Link>
        <Link className="inline-flex items-center gap-1.5 font-semibold text-[#6f685f] hover:text-[#171513]" href="/search">Open public Explore <ExternalLink className="size-3" /></Link>
      </div>
    </div>

      {authOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-0 sm:place-items-center sm:p-4" onMouseDown={(event) => { if (event.currentTarget === event.target) closeAuth(); }}>
          <section
            ref={dialogRef}
            aria-describedby="auth-handoff-description"
            aria-labelledby="auth-handoff-title"
            aria-modal="true"
            className="w-full max-w-md rounded-t-[28px] bg-white p-5 shadow-2xl sm:rounded-[28px] sm:p-7"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="eyebrow">Save after value</p>
                <h2 className="instrument-serif mt-2 text-4xl" id="auth-handoff-title">Keep your diagnosis.</h2>
              </div>
              <button aria-label="Close authentication handoff" className="grid size-10 place-items-center rounded-full border border-black/8 hover:bg-black/[0.03]" onClick={closeAuth} type="button"><X className="size-4" /></button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6f685f]" id="auth-handoff-description">
              {session.persistenceWarning
                ? "Your assessment remains available in this tab, but browser persistence was not confirmed. Choose how to enter the limited workspace."
                : "Your assessment is saved in this browser’s local Preview storage. Choose how to enter the limited workspace."}
            </p>
            {session.persistenceWarning ? (
              <p className="mt-3 rounded-[14px] border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950" role="alert">
                Browser storage failed. Keep this tab open or download the report before continuing.
              </p>
            ) : null}

            {clerkConfigured ? (
              <Link
                ref={googleButtonRef}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-5 text-sm font-medium text-[var(--button-primary-text)] transition-colors hover:border-[var(--button-primary-border-hover)] hover:bg-[var(--button-primary-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2"
                href="/sign-in?redirect_url=%2Fapp%2Fpreview"
              >
                Continue with Google
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <div className="mt-5 rounded-[16px] border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
                <p className="flex items-start gap-2 font-semibold"><AlertCircle className="mt-0.5 size-3.5 shrink-0" />Continue with Google is unavailable in this branch Preview.</p>
                <p className="mt-1 pl-5">No Clerk publishable key is configured, and FundMe will not imitate a Google sign-in.</p>
              </div>
            )}

            <Button
              ref={previewButtonRef}
              className="mt-3 min-h-12 w-full"
              onClick={continueWithPreviewProfile}
              variant={clerkConfigured ? "secondary" : "primary"}
            >
              Continue with Preview profile
              <Sparkles className="size-4" />
            </Button>
            <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-[#8b8276]"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" />The Preview profile is a tab-local demo identity, not Google authentication or a durable account.</p>
          </section>
        </div>
      ) : null}
    </>
  );
}
