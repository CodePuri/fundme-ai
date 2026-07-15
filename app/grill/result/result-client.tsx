"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clipboard,
  Download,
  ExternalLink,
  FileWarning,
  Flame,
  RefreshCcw,
  Share2,
  ShieldCheck,
  UserRoundSearch,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { DimensionBreakdown } from "@/components/grill/dimension-breakdown";
import { FindingList } from "@/components/grill/finding-list";
import { LockedOptimization } from "@/components/grill/locked-optimization";
import { ScoreRing } from "@/components/grill/score-ring";
import { BrandLockup } from "@/components/ui/brand-lockup";
import { Button } from "@/components/ui/button";
import {
  GRILL_STORAGE_ERROR_SNAPSHOT,
  createBrowserAssessmentRepository,
  subscribeToGrillStorage,
} from "@/lib/grill/client/repository";
import { restartGrillDemo } from "@/lib/grill/client/restart";
import {
  copyReportSummary,
  downloadShareCard,
  shareOutcomeMessage,
  shareReport,
} from "@/lib/grill/client/share";
import type { GrillReport, PrioritizedAction } from "@/lib/grill/types";

const DIMENSION_LABELS: Record<GrillReport["strongestDimension"], string> = {
  founder_credibility: "Founder credibility",
  founder_market_fit: "Founder-market fit",
  problem_clarity: "Problem clarity",
  solution_clarity: "Solution clarity",
  market_quality: "Market quality",
  differentiation: "Differentiation",
  traction_evidence: "Traction and evidence",
  funding_narrative: "Funding narrative",
  deck_readiness: "Pitch-deck readiness",
  profile_positioning: "Founder positioning",
};

const PRIORITY_LABELS: Record<PrioritizedAction["priority"], string> = {
  fix_now: "Fix now",
  fix_next: "Fix next",
  improve_later: "Improve later",
};

function SectionHeading({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#171513] text-white"><Icon aria-hidden="true" className="size-4" /></span>
      <div><h2 className="text-xl font-bold text-[#171513]">{title}</h2><p className="mt-1 text-sm leading-6 text-[#70685f]">{description}</p></div>
    </div>
  );
}

function ActionList({ actions }: { actions: PrioritizedAction[] }) {
  return (
    <div className="divide-y divide-black/8 rounded-lg border border-black/10 bg-white">
      {actions.map((action, index) => (
        <article className="grid gap-3 p-5 sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-5" key={action.id}>
          <div>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${action.priority === "fix_now" ? "bg-[#fff0ec] text-[#a53f30]" : action.priority === "fix_next" ? "bg-[#fff7e8] text-[#8b5b13]" : "bg-[#eef6ff] text-[#315f91]"}`}>{PRIORITY_LABELS[action.priority]}</span>
            <div className="mt-2 text-xs font-bold text-[#9a9288]">0{index + 1}</div>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#171513]">{action.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#70685f]"><strong className="text-[#302d29]">Why:</strong> {action.why}</p>
            <p className="mt-2 border-l-[3px] border-[#ff6b3d] pl-3 text-sm leading-6 text-[#302d29]">{action.action}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ProfileCredibilityGaps({ findings }: { findings: string[] }) {
  if (findings.length === 0) return null;

  return (
    <div className="mt-5 border-t border-black/8 pt-5">
      <h3 className="text-sm font-bold">Credibility gaps</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-[#70685f]">
        {findings.map((finding) => (
          <li className="flex gap-2" key={finding}>
            <FileWarning aria-hidden="true" className="mt-1 size-3.5 shrink-0 text-[#c94134]" />
            {finding}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResultClient() {
  const repository = useMemo(() => createBrowserAssessmentRepository(), []);
  const getSnapshot = useCallback(
    () =>
      repository?.getSnapshot() ??
      (typeof window === "undefined" ? "" : GRILL_STORAGE_ERROR_SNAPSHOT),
    [repository],
  );
  const snapshot = useSyncExternalStore(subscribeToGrillStorage, getSnapshot, () => "");
  const stateRead = useMemo(() => {
    if (!snapshot) return { state: null, error: false };
    if (snapshot === GRILL_STORAGE_ERROR_SNAPSHOT || !repository) {
      return { state: null, error: true };
    }
    try {
      return { state: repository.load(), error: false };
    } catch {
      return { state: null, error: true };
    }
  }, [repository, snapshot]);
  const state = stateRead.state;
  const report = state?.report ?? null;

  const runAction = useCallback(async <Result,>(
    action: () => Promise<Result>,
    success: string | ((result: Result) => string),
  ) => {
    try {
      const result = await action();
      toast.success(typeof success === "function" ? success(result) : success);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(error instanceof Error ? error.message : "That action is unavailable.");
    }
  }, []);

  const restart = useCallback(() => {
    if (repository) restartGrillDemo(repository, window.location);
  }, [repository]);

  if (!report) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1ea] px-4 text-[#171513]">
        <div className="max-w-lg rounded-lg border border-black/10 bg-white p-8 text-center shadow-[0_16px_50px_rgba(23,21,19,0.06)]">
          <Flame aria-hidden="true" className="mx-auto size-8 text-[#ff6b3d]" />
          <h1 className="mt-4 text-3xl font-semibold" style={{ fontFamily: "var(--font-instrument)" }}>{stateRead.error ? "Browser storage is unavailable." : "No local Grill report found."}</h1>
          <p className="mt-3 text-sm leading-7 text-[#70685f]">{stateRead.error ? "Enable local browser storage to preserve and view a Grill report." : "This Preview does not create public report URLs. Run the Grill in this browser to generate a report."}</p>
          <Link className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#171513] px-5 py-3 text-sm font-semibold text-white" href="/grill">Start Funding Grill</Link>
        </div>
      </main>
    );
  }

  const strongest = report.dimensions.find((item) => item.id === report.strongestDimension);
  const weakest = report.dimensions.find((item) => item.id === report.weakestDimension);

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171513]" data-theme="public">
      <header className="no-print border-b border-black/10 bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1180px] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3"><Link aria-label="Fundme homepage" href="/" prefetch={false}><BrandLockup /></Link><span className="hidden border-l border-black/10 pl-3 text-xs font-semibold text-[#b44828] sm:inline">Grill Preview</span></div>
          <div className="flex items-center gap-2">
            <Link className="hidden text-sm font-semibold text-[#5e5750] hover:text-[#171513] sm:inline" href="/search" prefetch={false}>Explore programs</Link>
            <Button onClick={restart} size="sm" variant="secondary"><RefreshCcw aria-hidden="true" className="size-3.5" />Restart</Button>
          </div>
        </div>
      </header>

      <section className="bg-[#171513] text-white">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-center lg:py-14">
          <ScoreRing score={report.overallScore} />
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#ff9b7b]"><Flame aria-hidden="true" className="size-4" />FUNDING READINESS VERDICT<span className="rounded-full border border-white/15 px-2 py-1 text-white/55">{report.confidence} confidence</span></div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02]" style={{ fontFamily: "var(--font-instrument)" }}>{report.verdict}</h1>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="border-l-[3px] border-[#59d18c] pl-3"><div className="text-xs font-bold text-white/45">STRONGEST</div><div className="mt-1 text-sm font-semibold">{strongest?.label} · {strongest?.score}</div></div>
              <div className="border-l-[3px] border-[#ff6b3d] pl-3"><div className="text-xs font-bold text-white/45">WEAKEST</div><div className="mt-1 text-sm font-semibold">{weakest?.label} · {weakest?.score}</div></div>
              <div className="border-l-[3px] border-[#6ca7e2] pl-3"><div className="text-xs font-bold text-white/45">EVIDENCE COVERAGE</div><div className="mt-1 text-sm font-semibold">{report.evidenceCoverage}%</div></div>
            </div>
          </div>
        </div>
      </section>

      <div className="no-print border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
          <Button onClick={() => runAction(() => downloadShareCard(report), "Share card downloaded") } size="sm"><Download aria-hidden="true" className="size-3.5" />Download card</Button>
          <Button onClick={() => runAction(() => copyReportSummary(report), "Summary copied") } size="sm" variant="secondary"><Clipboard aria-hidden="true" className="size-3.5" />Copy summary</Button>
          <Button onClick={() => runAction(() => shareReport(report), shareOutcomeMessage) } size="sm" variant="secondary"><Share2 aria-hidden="true" className="size-3.5" />Share</Button>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-[#70685f]"><ShieldCheck aria-hidden="true" className="size-3.5 text-[#2f955d]" />Stored locally in this browser</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] space-y-12 px-4 py-10 sm:px-6 lg:py-14">
        <section>
          <SectionHeading description="Ten fixed dimensions from the versioned Fundme demo rubric." icon={Check} title="Dimension breakdown" />
          <DimensionBreakdown dimensions={report.dimensions} strongest={report.strongestDimension} weakest={report.weakestDimension} />
        </section>

        <section>
          <SectionHeading description="Contradictions, unsupported claims, and evidence gaps that weaken the story." icon={Flame} title="The Grill" />
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-[#d34d40]/25 bg-white p-5"><h3 className="mb-4 text-sm font-bold text-[#a52d25]">Red flags and contradictions</h3><FindingList empty="No severe contradictions were detected in the submitted evidence." findings={report.redFlags} /></div>
            <div className="rounded-lg border border-[#e69a32]/25 bg-white p-5"><h3 className="mb-4 text-sm font-bold text-[#8b5b13]">Unsupported claims</h3><FindingList empty="No unsupported superlatives were detected." findings={report.unsupportedClaims} tone="neutral" /></div>
            <div className="rounded-lg border border-black/10 bg-white p-5 lg:col-span-2"><h3 className="mb-4 text-sm font-bold text-[#171513]">Missing or weak evidence</h3><FindingList empty="Core evidence fields are present." findings={report.missingEvidence} tone="neutral" /></div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-black/10 bg-white p-5 sm:p-6">
            <SectionHeading description="Positioning, authority, clarity, and missing credibility signals." icon={UserRoundSearch} title="Founder and LinkedIn review" />
            <div className="mb-5 flex items-end gap-2"><span className="text-4xl font-semibold" style={{ fontFamily: "var(--font-instrument)" }}>{report.profileReview.positioningQuality}</span><span className="pb-1 text-sm font-bold text-[#8a8177]">/ 100</span></div>
            <p className="text-sm leading-6 text-[#70685f]">{report.profileReview.summary}</p>
            <div className="mt-5 border-t border-black/8 pt-5"><h3 className="text-sm font-bold">Authority signals</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-[#70685f]">{report.profileReview.authoritySignals.length ? report.profileReview.authoritySignals.map((item) => <li className="flex gap-2" key={item}><Check aria-hidden="true" className="mt-1 size-3.5 shrink-0 text-[#2f955d]" />{item}</li>) : <li>No concrete authority signal was detected.</li>}</ul></div>
            <ProfileCredibilityGaps findings={report.profileReview.missingCredibility} />
            <div className="mt-5 border-t border-black/8 pt-5"><h3 className="text-sm font-bold">Specific improvements</h3><ol className="mt-3 space-y-2 text-sm leading-6 text-[#70685f]">{report.profileReview.improvements.map((item, index) => <li className="flex gap-2" key={item}><span className="font-bold text-[#b44828]">{index + 1}.</span>{item}</li>)}</ol></div>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-5 sm:p-6">
            <SectionHeading description="Only text successfully parsed from the uploaded PDF is reviewed." icon={FileWarning} title="Pitch-deck review" />
            <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${report.deckReview.status === "parsed" ? "bg-[#e8f8ee] text-[#247647]" : "bg-[#fff0ec] text-[#a53f30]"}`}>{report.deckReview.status.replace("_", " ")}</div>
            <p className="mt-4 text-sm leading-6 text-[#70685f]">{report.deckReview.summary}</p>
            {report.deckReview.status === "parsed" ? <><div className="mt-5"><h3 className="text-sm font-bold">Detected content</h3><div className="mt-3 flex flex-wrap gap-2">{report.deckReview.detectedSections.map((section) => <span className="rounded-full bg-[#eef6ff] px-2.5 py-1 text-xs font-semibold text-[#315f91]" key={section}>{section}</span>)}</div></div><div className="mt-5"><h3 className="text-sm font-bold">Missing expected sections</h3><div className="mt-3 flex flex-wrap gap-2">{report.deckReview.missingSections.length ? report.deckReview.missingSections.map((section) => <span className="rounded-full bg-[#fff0ec] px-2.5 py-1 text-xs font-semibold text-[#a53f30]" key={section}>{section}</span>) : <span className="text-sm text-[#70685f]">All expected sections were detected.</span>}</div></div></> : null}
          </div>
        </section>

        <section>
          <SectionHeading description="Prioritized by expected effect on evidence coverage and the weakest rubric dimensions." icon={ExternalLink} title="Highest-leverage actions" />
          <ActionList actions={report.highestLeverageActions} />
        </section>

        <LockedOptimization />

        <section className="rounded-lg border border-black/10 bg-white p-5 text-sm leading-7 text-[#70685f] sm:p-6">
          <div className="flex items-start gap-3"><ShieldCheck aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#2f955d]" /><div><h2 className="font-bold text-[#171513]">Methodology and limits</h2><p className="mt-1">This report uses {report.rubricVersion} with deterministic scoring and local lexical retrieval. It is a Funding Readiness Score, not a prediction of funding success. Retrieved guidance: {report.retrievedGuidanceIds.join(", ")}.</p></div></div>
        </section>

        <div className="no-print flex flex-col items-center justify-between gap-4 border-t border-black/10 pt-8 sm:flex-row">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#5e5750] hover:text-[#171513]" href="/grill"><ArrowLeft aria-hidden="true" className="size-4" />Edit intake</Link>
          <Button onClick={restart} variant="secondary"><RefreshCcw aria-hidden="true" className="size-4" />Restart demo</Button>
        </div>
      </div>
    </main>
  );
}
