"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Clipboard, Download, ExternalLink, LockKeyhole, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAssessment } from "@/components/assessment/assessment-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { serializeReport, shareReport } from "@/lib/assessment/share";
import { earliestValidRoute } from "@/lib/assessment/validation";

function ScoreRing({ score }: { score: number }) {
  return <div className="relative grid size-36 place-items-center rounded-full" style={{ background: `conic-gradient(#ff6b3d ${score * 3.6}deg, #eee7de 0deg)` }}><div className="grid size-28 place-items-center rounded-full bg-white text-center"><div><strong className="instrument-serif text-5xl font-normal">{score}</strong><span className="text-sm text-[#8b8276]">/100</span></div></div></div>;
}

export function FundingReadinessReport() {
  const router = useRouter();
  const { session, hasHydrated, generateReport, setEarlyAccessDraft, submitEarlyAccess } = useAssessment();
  const report = session.report;
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const email = session.earlyAccess.email;

  useEffect(() => {
    if (!hasHydrated || report) return;
    if (session.processingState === "assessing") {
      const assessmentTimer = window.setTimeout(generateReport, 250);
      return () => window.clearTimeout(assessmentTimer);
    }
    router.replace(earliestValidRoute(session));
  }, [generateReport, hasHydrated, report, router, session]);

  if (!report) {
    const assessing = session.processingState === "assessing";
    return <div className="mx-auto max-w-xl rounded-[28px] border border-[var(--border)] bg-white p-8 text-center"><p className="font-semibold">{assessing ? "Assessing submitted evidence…" : "Recovering your assessment…"}</p><p className="mt-2 text-sm text-[#8b8276]">{assessing ? "Applying fundme-demo-rubric@1 to the evidence and explicit gaps in this browser." : "You’ll return to the earliest valid step."}</p></div>;
  }

  const portableReport = serializeReport(report);

  function download() {
    const blob = new Blob([portableReport], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `fundme-readiness-${session.input.startupName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "report"}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function share() {
    try {
      const result = await shareReport({
        title: `FundMe readiness — ${session.input.startupName || "startup"}`,
        text: portableReport,
        share: navigator.share ? (data) => navigator.share(data) : undefined,
        writeText: (text) => navigator.clipboard.writeText(text),
      });
      setShareStatus(result === "shared" ? "Shared." : "Copied to clipboard.");
    } catch {
      setShareStatus("Sharing is unavailable in this browser. Download the text report instead.");
    }
  }

  function handleEarlyAccessSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = submitEarlyAccess(email);
    setEmailError(result.error);
  }

  return (
    <div className="mx-auto max-w-[1060px]">
      <section className="overflow-hidden rounded-[34px] border border-[var(--border)] bg-white shadow-[0_28px_80px_rgba(17,17,17,0.07)]">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
          <ScoreRing score={report.readinessScore} />
          <div>
            <p className="eyebrow">Funding readiness Preview</p>
            <h1 className="instrument-serif mt-3 text-4xl leading-tight sm:text-6xl">{report.verdict}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#6f685f]">{report.conciseVerdict}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-[#f6f1ea] px-3 py-2">{report.completionState === "complete" ? "Complete assessment" : "Partial assessment"}</span><span className="rounded-full bg-[#f6f1ea] px-3 py-2">Evidence {report.evidenceCoverage}%</span><span className="rounded-full bg-[#f6f1ea] px-3 py-2">{report.confidence} confidence</span><span className="rounded-full bg-[#f6f1ea] px-3 py-2">Traction: {report.tractionState}</span><span className="rounded-full bg-[#f6f1ea] px-3 py-2">{report.rubricVersion}</span></div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[#faf6f0] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[#8b8276]">Generated from founder-submitted text and attachment metadata only.</p>
          <div className="flex flex-wrap gap-2"><Button onClick={download} variant="secondary"><Download className="size-4" />Download .txt</Button><Button onClick={share}><Share2 className="size-4" />Share or copy</Button></div>
          {shareStatus && <span className="text-xs font-medium" role="status">{shareStatus}</span>}
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[24px] border border-[var(--border)] bg-white p-5"><p className="text-xs font-bold uppercase tracking-widest text-[#8b8276]">Strongest signal</p><p className="mt-3 text-lg font-semibold">{report.dimensions.find((item) => item.id === report.strongestDimension)?.label}</p></div>
        <div className="rounded-[24px] border border-[var(--border)] bg-white p-5"><p className="text-xs font-bold uppercase tracking-widest text-[#8b8276]">Weakest signal</p><p className="mt-3 text-lg font-semibold">{report.dimensions.find((item) => item.id === report.weakestDimension)?.label}</p></div>
      </section>

      <section className="mt-5 rounded-[30px] border border-[var(--border)] bg-white p-5 sm:p-8">
        <div className="mb-6"><p className="eyebrow">Rubric</p><h2 className="instrument-serif mt-2 text-3xl sm:text-4xl">Ten dimensions, one stable boundary.</h2></div>
        <div className="grid gap-5 md:grid-cols-2">
          {report.dimensions.map((item) => <article key={item.id}><div className="flex items-end justify-between gap-3"><h3 className="text-sm font-semibold">{item.label}</h3><strong className="text-sm">{item.score}</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eee7de]"><div className="h-full rounded-full bg-[#ff6b3d]" style={{ width: `${item.score}%` }} /></div><p className="mt-2 text-xs leading-5 text-[#8b8276]">{item.explanation}</p></article>)}
        </div>
      </section>

      <section className="mt-5 rounded-[30px] bg-[#171513] p-5 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-white/50">The Grill</p><h2 className="instrument-serif mt-2 text-3xl sm:text-4xl">What holds up — and what does not.</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {report.findings.length ? report.findings.map((finding) => <article className="rounded-[20px] border border-white/10 bg-white/[0.06] p-4" key={finding.id}><div className="flex items-center gap-2">{finding.type === "strength" ? <Check className="size-4 text-green-400" /> : <AlertTriangle className="size-4 text-amber-400" />}<span className="text-xs font-bold uppercase tracking-wider text-white/60">{finding.type.replace("-", " ")}</span></div><p className="mt-3 text-sm leading-6">{finding.explanation}</p><p className="mt-3 text-xs leading-5 text-white/60">Next: {finding.action}</p></article>) : <p className="text-sm text-white/70">No contradictions or missing-evidence findings were created.</p>}
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-3">
        <article className="rounded-[26px] border border-[var(--border)] bg-white p-5"><p className="eyebrow">Founder review</p><h2 className="mt-3 font-semibold">Credibility & fit</h2><p className="mt-3 text-sm leading-6 text-[#6f685f]">{report.founderReview.credibility} {report.founderReview.founderMarketFit}</p></article>
        <article className="rounded-[26px] border border-[var(--border)] bg-white p-5"><p className="eyebrow">Startup review</p><h2 className="mt-3 font-semibold">Problem & traction</h2><p className="mt-3 text-sm leading-6 text-[#6f685f]">{report.startupReview.problem} {report.startupReview.traction}</p></article>
        <article className="rounded-[26px] border border-[var(--border)] bg-white p-5"><p className="eyebrow">Deck review</p><h2 className="mt-3 font-semibold">{report.deckReview.status === "not-provided" ? "Not provided" : "Received, unparsed"}</h2><p className="mt-3 text-sm leading-6 text-[#6f685f]">{report.deckReview.summary}</p></article>
      </section>

      <section className="mt-5 rounded-[30px] border border-[var(--border)] bg-white p-5 sm:p-8">
        <p className="eyebrow">Action ladder</p><div className="mt-5 grid gap-3 md:grid-cols-3">{report.actions.map((action, index) => <article className="rounded-[20px] bg-[#f6f1ea] p-4" key={`${action.horizon}-${index}`}><p className="text-xs font-bold uppercase tracking-widest text-[#ff6b3d]">{action.horizon.replace("-", " ")}</p><h3 className="mt-2 font-semibold">{action.title}</h3><p className="mt-2 text-sm leading-6 text-[#6f685f]">{action.detail}</p></article>)}</div>
      </section>

      <section className="mt-5 rounded-[30px] border border-[#ff6b3d]/20 bg-[#fff7f2] p-5 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div><p className="eyebrow">Early access</p><h2 className="instrument-serif mt-2 text-3xl sm:text-4xl">Help shape the intelligence layer.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#6f685f]">Join this Preview locally with email only. This form does not write to Production Supabase, does not reserve a waitlist position, and does not create a durable account.</p></div>
          <form onSubmit={handleEarlyAccessSubmit} noValidate>
            <label className="text-sm font-medium" htmlFor="early-access-email">Email</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row"><Input id="early-access-email" type="email" autoComplete="email" value={email} onChange={(event) => { setEmailError(null); setEarlyAccessDraft(event.target.value); }} placeholder="founder@startup.com" /><Button className="shrink-0" type="submit">Save Preview interest</Button></div>
            {emailError && <p className="mt-2 text-xs font-medium text-[#c54824]" role="alert">{emailError}</p>}
            {session.earlyAccess.status === "success" && <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-900" role="status"><p className="font-semibold">Confirmed in this browser’s local Preview storage.</p><p className="mt-1 text-xs">Preview referral stub: {session.earlyAccess.referralCode}. It does not record a signup, priority, or referral externally.</p></div>}
            {session.earlyAccess.status === "error" && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950" role="alert"><p className="font-semibold">Email not saved.</p><p className="mt-1 text-xs">{session.earlyAccess.error} Your email remains in the form so you can retry.</p></div>}
            {session.persistenceWarning && <p className="mt-3 text-xs font-medium text-amber-900" role="alert">{session.persistenceWarning}</p>}
            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#8b8276]"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" />Privacy: the email and stub stay in local browser storage unless you clear or restart this assessment.</p>
          </form>
        </div>
      </section>

      <div className="mt-6 flex justify-center"><a className="inline-flex items-center gap-2 text-sm font-semibold text-[#6f685f] hover:text-[#171513]" href="/assessment">Start another assessment <ExternalLink className="size-3.5" /></a></div>
    </div>
  );
}
