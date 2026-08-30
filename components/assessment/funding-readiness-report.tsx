"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeIndianRupee,
  Building2,
  Check,
  Download,
  FileText,
  Globe2,
  Landmark,
  Rocket,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRound,
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

export function ScoreRing({ score }: { score: number }) {
  return (
    <div
      aria-label={`Funding readiness score ${score} out of 100`}
      className="relative grid size-[132px] shrink-0 place-items-center rounded-full"
      role="img"
      style={{ background: `conic-gradient(#ff6b3d ${score * 3.6}deg, #e9e1d7 0deg)` }}
    >
      <div className="grid size-[108px] place-items-center rounded-full bg-white text-center">
        <div>
          <strong className="type-score">{score}</strong>
          <span className="ml-1 text-[13px] font-medium text-[var(--text-secondary)]">/100</span>
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
    <details className="group border-b border-[var(--border)] py-4 last:border-b-0">
      <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <h3 className="min-w-0 text-[15px] font-semibold">{dimension.label}</h3>
              <span className="text-[15px] font-semibold tabular-nums">{dimension.score}</span>
            </div>
            <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eee7de]">
              <div className={`h-full rounded-full ${scoreTone(dimension.score)}`} style={{ width: `${dimension.score}%` }} />
            </div>
          </div>
          <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
        </div>
      </summary>
      <div className="mt-3 rounded-xl bg-[var(--surface-elevated)] p-4 text-[13px] leading-5 text-[var(--text-secondary)]">
        <p>{dimension.explanation}</p>
        <p className="mt-2 flex items-start gap-2 text-[var(--text-secondary)]">
          {evidenceLabels.length ? <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[var(--status-positive)]" /> : <ShieldAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[var(--status-critical)]" />}
          {evidenceLabels.length ? `Evidence: ${evidenceLabels.join(", ")}` : `Missing: ${dimension.missingEvidence[0] ?? "Supporting evidence"}`}
        </p>
      </div>
    </details>
  );
}

function reportDisplayName(startupName: string, websiteUrl: string, deckName?: string): string {
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

const MATCH_TONES = [
  "border-t-[#ff6b3d]",
  "border-t-[#315f8b]",
  "border-t-[#65448f]",
  "border-t-[#246b48]",
];

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
        <p className="mt-2 text-[15px] text-[var(--text-secondary)]">You’ll return to the earliest valid step.</p>
      </div>
    );
  }

  const portableReport = serializeReport(report);
  const deck = session.artifacts.find((artifact) => artifact.kind === "pitch-deck");
  const founderProfile = session.artifacts.find((artifact) => artifact.kind === "founder-profile");
  const displayName = reportDisplayName(session.input.startupName, session.input.websiteUrl, deck?.name);
  const matches = getPreviewMatches();
  const strongest = report.dimensions.find((item) => item.id === report.strongestDimension);
  const weakest = report.dimensions.find((item) => item.id === report.weakestDimension);
  const missingItems = report.findings.filter((finding) => finding.type !== "strength").slice(0, 4);

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
      setShareStatus("Sharing is unavailable. Download the report instead.");
    }
  }

  function continueWithPreviewProfile() {
    signIn();
    router.push("/app/preview");
  }

  return (
    <>
      <div aria-hidden={authOpen ? true : undefined} className="mx-auto max-w-[1080px]" inert={authOpen}>
        <section className="premium-card overflow-hidden">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[132px_minmax(0,1fr)_260px] lg:items-center">
            <ScoreRing score={report.readinessScore} />
            <div className="min-w-0">
              <p className="type-metadata break-words font-semibold text-[var(--text-secondary)]">{displayName} · Funding readiness</p>
              <h1 className="instrument-serif mt-2 max-w-[18ch] text-balance text-[40px] leading-[1.04] tracking-[-0.025em] sm:text-[50px]">{report.verdict}</h1>
              <p className="type-body mt-3 max-w-[65ch] text-[var(--text-secondary)]">{report.conciseVerdict}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button ref={authTriggerRef} className="min-h-12 px-5" onClick={() => setAuthOpen(true)} size="lg">
                  Save assessment &amp; see matches
                  <ArrowRight className="size-4" />
                </Button>
                <Button className="min-h-12" onClick={download} variant="secondary"><Download className="size-4" />Download assessment</Button>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              <div className="rounded-[14px] border border-[#246b48]/20 bg-[#f4faf6] p-3">
                <dt className="flex items-center gap-2 text-[13px] font-semibold text-[var(--status-positive)]"><ShieldCheck aria-hidden="true" className="size-3.5" />Strongest signal</dt>
                <dd className="mt-1 text-[15px] font-semibold">{strongest?.label ?? "Unavailable"}</dd>
              </div>
              <div className="rounded-[14px] border border-[#a33b1d]/20 bg-[#fff6f1] p-3">
                <dt className="flex items-center gap-2 text-[13px] font-semibold text-[var(--status-critical)]"><ShieldAlert aria-hidden="true" className="size-3.5" />Biggest risk</dt>
                <dd className="mt-1 text-[15px] font-semibold">{weakest?.label ?? "Unavailable"}</dd>
              </div>
              <div className="col-span-2 rounded-[14px] border border-[var(--border)] bg-[var(--surface-elevated)] p-3 lg:col-span-1">
                <dt className="flex items-center justify-between gap-3 text-[13px] font-semibold text-[var(--text-secondary)]"><span>Evidence coverage</span><span className="tabular-nums">{report.evidenceCoverage}%</span></dt>
                <dd className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><span className="block h-full rounded-full bg-[#ff6b3d]" style={{ width: `${report.evidenceCoverage}%` }} /></dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-3 text-[13px] text-[var(--text-secondary)] sm:px-7">
            <span>{report.completionState === "complete" ? "Complete assessment" : "Partial assessment"} · {report.confidence} confidence</span>
            <div className="flex items-center gap-3">
              <button className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-1 font-semibold hover:text-[#171513] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" onClick={share} type="button"><Share2 className="size-3.5" />Share</button>
              {shareStatus ? <span role="status">{shareStatus}</span> : null}
            </div>
          </div>
        </section>

        <details className="mx-auto mt-3 max-w-3xl rounded-xl px-3 py-2 text-[13px] leading-5 text-[var(--text-secondary)]">
          <summary className="flex min-h-11 cursor-pointer items-center justify-center rounded-md text-center font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">Preview methodology</summary>
          <p className="mt-2 text-center">Based on founder-supplied text and attachment metadata. Deck contents and opportunity examples are not independently verified.</p>
        </details>

        <section className="premium-card mt-5 px-5 py-1 sm:px-7">
          <div className="border-b border-[var(--border)] py-5">
            <p className="eyebrow">Funding signals</p>
            <h2 className="type-section-title mt-1">What your evidence supports</h2>
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

        <section className="premium-card mt-5 overflow-hidden">
          <div className="grid border-b border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-3 text-[13px] font-semibold text-[var(--text-secondary)] sm:grid-cols-2 sm:px-7">
            <span>Missing proof</span>
            <span className="hidden sm:block">Best next move</span>
          </div>
          {missingItems.length ? missingItems.map((finding, index) => (
            <article className="grid gap-3 border-b border-[var(--border)] px-5 py-4 last:border-b-0 sm:grid-cols-2 sm:gap-8 sm:px-7" key={finding.id}>
              <div className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#fff0e8] text-[13px] font-semibold text-[var(--status-critical)]">{index + 1}</span>
                <p className="text-[15px] leading-6">{finding.explanation}</p>
              </div>
              <div className="flex gap-2 text-[15px] leading-6 text-[var(--text-secondary)]">
                <ArrowRight className="mt-1 hidden size-3.5 shrink-0 text-[#ff6b3d] sm:block" />
                <div><span className="mb-1 block text-[13px] font-semibold text-[var(--text-secondary)] sm:hidden">Best next move</span>{finding.action}</div>
              </div>
            </article>
          )) : (
            <p className="px-5 py-5 text-[15px] text-[var(--text-secondary)]">No missing-evidence items were generated.</p>
          )}
        </section>

        <section className="mt-5 grid gap-2 sm:grid-cols-3">
          {[
            { icon: UserRound, label: "Founder", value: founderProfile || session.input.linkedInUrl?.trim() || session.input.profileText.trim() ? "Evidence added" : "Evidence missing" },
            { icon: Globe2, label: "Startup", value: session.input.websiteUrl.trim() ? "Website added" : "Description only" },
            { icon: FileText, label: "Pitch deck", value: deck ? "File received" : "Not provided" },
          ].map(({ icon: Icon, label, value }) => (
            <div className="flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-white p-3" key={label}>
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-elevated)]"><Icon className="size-4 text-[var(--text-secondary)]" /></span>
              <div><p className="text-[13px] font-semibold">{label}</p><p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">{value}</p></div>
            </div>
          ))}
        </section>

        <section className="premium-card mt-5 p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Opportunity preview</p>
              <h2 className="type-section-title mt-2">{PREVIEW_OPPORTUNITY_COUNT} paths across four categories</h2>
            </div>
            <span className="w-fit rounded-full border border-[#ff6b3d]/25 bg-[#fff8f4] px-3 py-1.5 text-[13px] font-semibold text-[#963b1a]">Preview sample</span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {PREVIEW_MATCH_CATEGORIES.map((category) => (
              <div className="flex items-center gap-3 rounded-[15px] border border-[var(--border)] bg-[var(--surface-elevated)] p-3" key={category.label}>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-white text-[#a64626]"><CategoryIcon label={category.label} /></span>
                <div><p className="text-[13px] font-semibold">{category.label.replace(" and VC firms", "")}</p><p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">{category.count} examples</p></div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {matches.slice(0, 4).map((match, index) => (
              <article className={`flex min-h-[220px] flex-col rounded-[18px] border border-[var(--border)] border-t-[3px] bg-white p-5 ${MATCH_TONES[index % MATCH_TONES.length]}`} key={match.id}>
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]"><CategoryIcon label={match.category} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="type-metadata text-[var(--text-secondary)]">{match.category}</p>
                    <h3 className="type-card-title mt-1">{match.name}</h3>
                  </div>
                </div>
                <p className="mt-3 text-[15px] leading-6 text-[var(--text-secondary)]">{opportunityReasonSummary(match.reason)}</p>
                <div className="mt-4 grid gap-1 text-[13px] text-[var(--text-secondary)]">
                  <span><strong className="font-semibold text-[var(--text-primary)]">Stage:</strong> {match.stage}</span>
                  <span><strong className="font-semibold text-[var(--text-primary)]">Location:</strong> {match.geography}</span>
                  <span><strong className="font-semibold text-[var(--text-primary)]">Value:</strong> {match.value}</span>
                </div>
                <Link className="mt-auto inline-flex min-h-11 items-end gap-1.5 pt-4 text-[13px] font-semibold text-[#963b1a] hover:text-[#6f2712]" href="/search">Explore category <ArrowRight className="size-3.5" /></Link>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-[18px] bg-[#171513] p-4 text-white sm:flex-row">
            <div><p className="text-[15px] font-semibold">See every funding path in one workspace.</p><p className="mt-1 text-[13px] text-white/75">Save this diagnosis to continue.</p></div>
            <Button className="min-h-11 shrink-0 border-white bg-white text-[#171513] hover:border-white hover:bg-[#f6f1ea]" onClick={() => setAuthOpen(true)}>
              Unlock Preview paths
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[13px]">
          <Link className="min-h-11 rounded-md py-3 font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]" href="/assessment">Start another assessment</Link>
          <Link className="min-h-11 rounded-md py-3 font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]" href="/search">Explore public programs</Link>
        </div>
      </div>

      {authOpen ? (
        <div className="fixed inset-0 z-50 grid overscroll-contain place-items-end bg-black/45 p-0 sm:place-items-center sm:p-4" onMouseDown={(event) => { if (event.currentTarget === event.target) closeAuth(); }}>
          <section
            ref={dialogRef}
            aria-describedby="auth-handoff-description"
            aria-labelledby="auth-handoff-title"
            aria-modal="true"
            className="w-full max-w-md rounded-t-[24px] bg-white p-5 shadow-2xl sm:rounded-[24px] sm:p-7"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <span className="grid size-10 place-items-center rounded-xl bg-[#fff0e8] text-[var(--status-critical)]"><Sparkles aria-hidden="true" className="size-4.5" /></span>
                <h2 className="type-section-title mt-3" id="auth-handoff-title">Save your assessment</h2>
              </div>
              <button aria-label="Close authentication handoff" className="grid size-11 place-items-center rounded-full border border-black/8 hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" onClick={closeAuth} type="button"><X className="size-4" /></button>
            </div>
            <p className="mt-3 text-[15px] leading-6 text-[var(--text-secondary)]" id="auth-handoff-description">
              Keep this result and open your Preview matches.
            </p>
            {session.persistenceWarning ? (
              <p className="mt-3 rounded-[14px] border border-amber-200 bg-amber-50 p-3 text-[13px] leading-5 text-amber-950" role="alert">
                Browser persistence was not confirmed. Keep this tab open or download the report.
              </p>
            ) : null}

            {clerkConfigured ? (
              <Link
                ref={googleButtonRef}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-5 text-sm font-medium text-[var(--button-primary-text)] transition-colors hover:border-[var(--button-primary-border-hover)] hover:bg-[var(--button-primary-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2"
                href={session.claimToken ? `/sign-in?redirect_url=${encodeURIComponent(`/app/preview?claim_token=${session.claimToken}`)}` : "/sign-in?redirect_url=%2Fapp%2Fpreview"}
                onClick={() => {
                  if (session.claimToken) {
                    try { window.localStorage.setItem("fundme-claim-token", session.claimToken); } catch {}
                  }
                }}
              >
                Continue with Google
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <div className="mt-5 rounded-[14px] border border-amber-200 bg-amber-50 p-3 text-[13px] leading-5 text-amber-950">
                <p className="flex items-start gap-2 font-semibold"><AlertCircle className="mt-0.5 size-3.5 shrink-0" />Google sign-in isn’t configured for this Preview.</p>
              </div>
            )}

            <Button ref={previewButtonRef} className="mt-3 min-h-12 w-full" onClick={continueWithPreviewProfile} variant={clerkConfigured ? "secondary" : "primary"}>
              Continue with Preview profile
              <ArrowRight className="size-4" />
            </Button>
            <p className="mt-4 flex items-start gap-2 text-[13px] leading-5 text-[var(--text-secondary)]"><ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[var(--status-positive)]" />Your assessment is not shared or published.</p>
          </section>
        </div>
      ) : null}
    </>
  );
}
