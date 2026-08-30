"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Share2, Sparkles, ShieldCheck } from "lucide-react";
import type { PublicShareReport } from "@/lib/assessment/share";
import { ScoreRing } from "@/components/assessment/funding-readiness-report";
import { Button } from "@/components/ui/button";
import { trackClientEvent } from "@/lib/analytics/client";

export function PublicShareCard({ report }: { report: PublicShareReport }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackClientEvent("assessment_shared", { shareToken: report.shareToken });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${report.startupName} Funding Readiness (${report.readinessScore}/100)`,
          text: `${report.verdict} — See what investors question first on FundMe.`,
          url: window.location.href,
        });
        trackClientEvent("assessment_shared", { shareToken: report.shareToken });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  }

  return (
    <article className="premium-card overflow-hidden">
      {/* Top Banner */}
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[132px_minmax(0,1fr)_240px] lg:items-center">
        <ScoreRing score={report.readinessScore} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-metadata font-semibold text-[var(--text-secondary)]">
              {report.startupName} · Public Assessment
            </span>
          </div>
          <h1 className="instrument-serif mt-2 text-3xl font-normal tracking-tight text-[var(--foreground)] sm:text-4xl">
            {report.verdict}
          </h1>
          <p className="type-body mt-2 text-sm text-[var(--text-secondary)]">
            {report.conciseVerdict}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleCopy}>
              {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              {copied ? "Link copied!" : "Copy public link"}
            </Button>
            <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-[var(--text-secondary)]" onClick={handleNativeShare}>
              <Share2 className="size-3.5" />
              Share
            </Button>
          </div>
        </div>

        {/* Action Panel */}
        <div className="rounded-2xl border border-[var(--border)] bg-stone-50/70 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]">
            <Sparkles className="size-4 text-[#ff6b3d]" />
            Funding Readiness Snapshot
          </div>
          <div className="mt-3 space-y-2 text-xs text-[var(--text-secondary)]">
            <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
              <span>Evidence coverage</span>
              <span className="font-medium text-[var(--foreground)]">{report.evidenceCoverage}%</span>
            </div>
            <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
              <span>Confidence</span>
              <span className="font-medium text-[var(--foreground)] capitalize">{report.confidence}</span>
            </div>
            <div className="flex justify-between">
              <span>Traction state</span>
              <span className="font-medium text-[var(--foreground)] capitalize">{report.tractionState}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions & Public Signals */}
      {report.dimensions.length > 0 && (
        <div className="border-t border-[var(--border)] bg-stone-50/40 p-6 sm:p-8">
          <h2 className="type-metadata font-semibold text-[var(--text-secondary)]">
            EVALUATED DIMENSIONS
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {report.dimensions.map((dim) => (
              <div key={dim.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-[var(--foreground)]">{dim.label}</span>
                  <span className="font-mono text-stone-600">{dim.score}/100</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-[var(--foreground)]"
                    style={{ width: `${Math.max(5, dim.score)}%` }}
                  />
                </div>
                {dim.explanation && (
                  <p className="mt-2 text-xs text-[var(--text-secondary)]">
                    {dim.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public Recommended Actions */}
      {report.publicActions.length > 0 && (
        <div className="border-t border-[var(--border)] p-6 sm:p-8">
          <h2 className="type-metadata font-semibold text-[var(--text-secondary)]">
            RECOMMENDED ACTIONS
          </h2>
          <div className="mt-4 space-y-3">
            {report.publicActions.map((action, idx) => (
              <div key={idx} className="flex gap-3 rounded-xl border border-[var(--border)] bg-white p-4">
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-medium text-stone-700">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--foreground)]">{action.title}</span>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600 capitalize">
                      {action.horizon}
                    </span>
                  </div>
                  {action.detail && (
                    <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">{action.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust & Boundary note */}
      <div className="border-t border-[var(--border)] bg-stone-50/80 px-6 py-3 text-center text-[11px] text-[var(--text-secondary)]">
        Public summary generated on FundMe. Private founder documents and contact details are never exposed.
      </div>
    </article>
  );
}
