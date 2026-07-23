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

function ScoreRing({ score }: { score: number }) {
  return (
    <div
      aria-label={`Funding readiness score ${score} out of 100`}
      className="relative grid size-[116px] shrink-0 place-items-center rounded-full"
      role="img"
      style={{ background: `conic-gradient(#ff6b3d ${score * 3.6}deg, #eee7de 0deg)` }}
    >
      <div className="grid size-[94px] place-items-center rounded-full bg-white text-center">
        <div>
          <strong className="instrument-serif text-[42px] font-normal leading-none tabular-nums">{score}</strong>
          <span className="text-[11px] text-[#8b8276]">/100</span>
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
    <details className="group border-b border-black/8 py-3.5 last:border-b-0">
      <summary className="cursor-pointer list-none rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b3d]">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <h3 className="truncate text-sm font-semibold">{dimension.label}</h3>
              <span className="font-mono text-sm font-semibold">{dimension.score}</span>
            </div>
            <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eee7de]">
              <div className={`h-full rounded-full ${scoreTone(dimension.score)}`} style={{ width: `${dimension.score}%` }} />
            </div>
          </div>
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-black/8 text-[#8b8276] transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
        </div>
        <p className="mt-2 line-clamp-1 pr-11 text-xs leading-5 text-[#6f685f]">{dimension.explanation}</p>
      </summary>
      <div className="mt-3 rounded-xl bg-[#faf7f2] p-3 text-xs leading-5 text-[#6f685f]">
        <p>{dimension.explanation}</p>
        <p className="mt-2 flex items-start gap-2 text-[#7a7167]">
          {evidenceLabels.length ? <Check className="mt-0.5 size-3.5 shrink-0 text-[#2f7d57]" /> : <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-[#bd4e28]" />}
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

const MATCH_TONES = [
  "border-[#ff6b3d]/20 bg-[#fff9f5]",
  "border-[#4f7dac]/20 bg-[#f6f9fc]",
  "border-[#76539f]/20 bg-[#faf8fd]",
  "border-[#2f7d57]/20 bg-[#f5faf7]",
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
        <p className="mt-2 text-sm text-[#8b8276]">You’ll return to the earliest valid step.</p>
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
        <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-[0_24px_70px_rgba(17,17,17,0.06)]">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[116px_minmax(0,1fr)_252px] lg:items-center">
            <ScoreRing score={report.readinessScore} />
            <div className="min-w-0">
              <p className="eyebrow break-words">Funding Readiness Score · {displayName}</p>
              <h1 className="instrument-serif mt-2 text-balance text-[40px] leading-[0.98] tracking-[-0.03em] sm:text-[50px]">{report.verdict}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f685f]">{report.conciseVerdict}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button ref={authTriggerRef} className="min-h-12 px-5" onClick={() => setAuthOpen(true)} size="lg">
                  Save assessment &amp; see matches
                  <ArrowRight className="size-4" />
                </Button>
                <Button className="min-h-12" onClick={download} variant="secondary"><Download className="size-4" />Download assessment</Button>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              <div className="rounded-[14px] bg-[#f3fbf6] p-3">
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2f7d57]">Strongest signal</dt>
                <dd className="mt-1 text-sm font-semibold">{strongest?.label ?? "Unavailable"}</dd>
              </div>
              <div className="rounded-[14px] bg-[#fff4ed] p-3">
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#bd4e28]">Biggest risk</dt>
                <dd className="mt-1 text-sm font-semibold">{weakest?.label ?? "Unavailable"}</dd>
              </div>
              <div className="col-span-2 rounded-[14px] bg-[#f6f1ea] p-3 lg:col-span-1">
                <dt className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#756d63]"><span>Evidence coverage</span><span>{report.evidenceCoverage}%</span></dt>
                <dd className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><span className="block h-full rounded-full bg-[#ff6b3d]" style={{ width: `${report.evidenceCoverage}%` }} /></dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[#faf7f2] px-5 py-3 text-[11px] text-[#8b8276] sm:px-7">
            <span>{report.completionState === "complete" ? "Complete assessment" : "Partial assessment"} · {report.confidence} confidence</span>
            <div className="flex items-center gap-3">
              <button className="inline-flex min-h-10 items-center gap-1.5 rounded-md font-semibold hover:text-[#171513] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b3d]" onClick={share} type="button"><Share2 className="size-3.5" />Share</button>
              {shareStatus ? <span role="status">{shareStatus}</span> : null}
            </div>
          </div>
        </section>

        <details className="mx-auto mt-3 max-w-3xl rounded-xl px-3 py-2 text-[11px] leading-5 text-[#8b8276]">
          <summary className="cursor-pointer rounded-md text-center font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b3d]">Preview methodology</summary>
          <p className="mt-2 text-center">Based on founder-supplied text and attachment metadata. Deck contents and opportunity examples are not independently verified.</p>
        </details>

        <section className="mt-5 rounded-[24px] border border-[var(--border)] bg-white px-5 py-1 sm:px-7">
          <div className="border-b border-black/8 py-4">
            <p className="eyebrow">Ten funding signals</p>
            <h2 className="mt-1 text-lg font-semibold">What your evidence supports</h2>
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

        <section className="mt-5 overflow-hidden rounded-[24px] border border-[var(--border)] bg-white">
          <div className="grid border-b border-black/8 bg-[#faf7f2] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#756d63] sm:grid-cols-2 sm:px-7">
            <span>Missing proof</span>
            <span className="hidden sm:block">Best next move</span>
          </div>
          {missingItems.length ? missingItems.map((finding, index) => (
            <article className="grid gap-2 border-b border-black/8 px-5 py-3.5 last:border-b-0 sm:grid-cols-2 sm:gap-8 sm:px-7" key={finding.id}>
              <div className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#fff0e8] text-xs font-semibold text-[#bd4e28]">{index + 1}</span>
                <p className="text-sm leading-5">{finding.explanation}</p>
              </div>
              <div className="flex gap-2 text-sm leading-5 text-[#5f584f]">
                <ArrowRight className="mt-1 hidden size-3.5 shrink-0 text-[#ff6b3d] sm:block" />
                <div><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b8276] sm:hidden">Best next move</span>{finding.action}</div>
              </div>
            </article>
          )) : (
            <p className="px-5 py-5 text-sm text-[#6f685f]">No missing-evidence items were generated.</p>
          )}
        </section>

        <section className="mt-5 grid gap-2 sm:grid-cols-3">
          {[
            { icon: UserRound, label: "Founder", value: founderProfile || session.input.linkedInUrl?.trim() || session.input.profileText.trim() ? "Evidence added" : "Evidence missing" },
            { icon: Globe2, label: "Startup", value: session.input.websiteUrl.trim() ? "Website added" : "Description only" },
            { icon: FileText, label: "Pitch deck", value: deck ? "File received" : "Not provided" },
          ].map(({ icon: Icon, label, value }) => (
            <div className="flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-white p-3" key={label}>
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f6f1ea]"><Icon className="size-4 text-[#6f685f]" /></span>
              <div><p className="text-xs font-semibold">{label}</p><p className="mt-0.5 text-[11px] text-[#8b8276]">{value}</p></div>
            </div>
          ))}
        </section>

        <section className="mt-5 rounded-[28px] border border-[#ff6b3d]/20 bg-[#fffaf6] p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">FundMe opportunity preview</p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{PREVIEW_OPPORTUNITY_COUNT} Preview opportunities across four paths</h2>
            </div>
            <span className="w-fit rounded-full border border-[#ff6b3d]/25 bg-white px-3 py-1.5 text-[10px] font-semibold text-[#a64626]">Illustrative sample</span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {PREVIEW_MATCH_CATEGORIES.map((category) => (
              <div className="flex items-center gap-3 rounded-[15px] border border-black/8 bg-white p-3" key={category.label}>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#fff0e8] text-[#bd4e28]"><CategoryIcon label={category.label} /></span>
                <div><p className="text-xs font-semibold">{category.label.replace(" and VC firms", "")}</p><p className="mt-0.5 text-[11px] text-[#8b8276]">{category.count} examples</p></div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {matches.slice(0, 4).map((match, index) => (
              <article className={`rounded-[18px] border p-4 ${MATCH_TONES[index % MATCH_TONES.length]}`} key={match.id}>
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm"><CategoryIcon label={match.category} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b8276]">{match.category}</p>
                    <h3 className="mt-1 font-semibold">{match.name}</h3>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-[#6f685f]">Preview example</span>
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#6f685f]">{match.reason}</p>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-[#6f685f]">
                  <span className="rounded-full bg-white/80 px-2 py-1">{match.stage}</span>
                  <span className="rounded-full bg-white/80 px-2 py-1">{match.geography}</span>
                  <span className="rounded-full bg-white/80 px-2 py-1">{match.value}</span>
                </div>
                <p className="mt-3 text-[10px] text-[#91887d]">{match.previewSignal} · {match.sourceStatus}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-[18px] bg-[#171513] p-4 text-white sm:flex-row">
            <div><p className="text-sm font-semibold">See every funding path in one workspace.</p><p className="mt-1 text-xs text-white/55">Save this diagnosis to continue.</p></div>
            <Button className="min-h-11 shrink-0 border-white bg-white text-[#171513] hover:border-white hover:bg-[#f6f1ea]" onClick={() => setAuthOpen(true)}>
              Unlock Preview paths
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs">
          <Link className="font-semibold text-[#6f685f] hover:text-[#171513]" href="/assessment">Start another assessment</Link>
          <Link className="font-semibold text-[#6f685f] hover:text-[#171513]" href="/search">Explore public programs</Link>
        </div>
      </div>

      {authOpen ? (
        <div className="fixed inset-0 z-50 grid overscroll-contain place-items-end bg-black/45 p-0 sm:place-items-center sm:p-4" onMouseDown={(event) => { if (event.currentTarget === event.target) closeAuth(); }}>
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
                <span className="grid size-10 place-items-center rounded-xl bg-[#fff0e8] text-[#bd4e28]"><Sparkles className="size-4.5" /></span>
                <h2 className="instrument-serif mt-3 text-4xl" id="auth-handoff-title">Save your assessment</h2>
              </div>
              <button aria-label="Close authentication handoff" className="grid size-11 place-items-center rounded-full border border-black/8 hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b3d]" onClick={closeAuth} type="button"><X className="size-4" /></button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6f685f]" id="auth-handoff-description">
              Keep this result and open your Preview matches.
            </p>
            {session.persistenceWarning ? (
              <p className="mt-3 rounded-[14px] border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950" role="alert">
                Browser persistence was not confirmed. Keep this tab open or download the report.
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
              <div className="mt-5 rounded-[14px] border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
                <p className="flex items-start gap-2 font-semibold"><AlertCircle className="mt-0.5 size-3.5 shrink-0" />Google sign-in isn’t configured for this Preview.</p>
              </div>
            )}

            <Button ref={previewButtonRef} className="mt-3 min-h-12 w-full" onClick={continueWithPreviewProfile} variant={clerkConfigured ? "secondary" : "primary"}>
              Continue with Preview profile
              <ArrowRight className="size-4" />
            </Button>
            <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-[#8b8276]"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#2f7d57]" />Your assessment is not shared or published.</p>
          </section>
        </div>
      ) : null}
    </>
  );
}
