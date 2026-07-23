"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAssessment } from "@/components/assessment/assessment-provider";
import { Button } from "@/components/ui/button";

function ReviewItem({ label, value, status = "Entered by founder" }: { label: string; value: string; status?: string }) {
  return <div className="rounded-2xl border border-[var(--border)] bg-[#faf6f0] p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8b8276]">{label}</p><span className="text-[11px] font-semibold text-[#547a55]">{status}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#171513]">{value || "Unavailable"}</p></div>;
}

export function SubmissionReview() {
  const router = useRouter();
  const { session, editIntake, confirmReview } = useAssessment();

  function edit() {
    editIntake();
    router.push("/assessment");
  }

  function continueToMentor() {
    confirmReview();
    router.push("/assessment/mentor");
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-8">
        <p className="eyebrow">Evidence checkpoint</p>
        <h1 className="instrument-serif mt-3 text-4xl sm:text-6xl">Review what the mentor can see.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-muted)]">Nothing is inferred from a website or file in this Preview. Submitted text is evidence; attachment contents remain pending analysis.</p>
      </div>
      <section className="rounded-[30px] border border-[var(--border)] bg-white p-5 shadow-[0_24px_70px_rgba(17,17,17,0.06)] sm:p-8">
        <div className="mb-6 flex items-center gap-3"><CheckCircle2 className="size-5 text-[#ff6b3d]" /><h2 className="text-lg font-semibold">Submitted context</h2></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ReviewItem label="Startup" value={session.input.startupName || session.input.websiteUrl} />
          <ReviewItem label="Website" value={session.input.websiteUrl} status={session.input.websiteUrl ? "Entered by founder" : "Unavailable"} />
          <ReviewItem label="Founder" value={`${session.input.founderName} · ${session.input.founderRole}`} />
          <ReviewItem label="Profile evidence" value={session.input.profileText} status={session.input.profileText ? "Entered by founder" : "Unavailable"} />
          <div className="sm:col-span-2"><ReviewItem label="Startup description" value={session.input.description} /></div>
        </div>
        <div className="mt-6 border-t border-[var(--border)] pt-6">
          <h3 className="mb-3 flex items-center gap-2 font-semibold"><FileText className="size-4" />Attachments</h3>
          {session.artifacts.length ? <div className="space-y-2">{session.artifacts.map((artifact) => <div className="flex flex-col justify-between gap-2 rounded-xl bg-[#f6f1ea] px-4 py-3 text-sm sm:flex-row sm:items-center" key={artifact.id}><span className="font-medium">{artifact.name}</span><span className="text-xs text-[#8b8276]">Attached · contents pending analysis</span></div>)}</div> : <p className="text-sm text-[#8b8276]">No files attached. You can continue without a deck.</p>}
        </div>
      </section>
      <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
        <div className="flex gap-2"><Button onClick={edit} variant="secondary"><ArrowLeft className="size-4" />Edit</Button><Button onClick={edit} variant="ghost"><Plus className="size-4" />Add another source</Button></div>
        <Button onClick={continueToMentor} size="lg">Continue to mentor <ArrowRight className="size-4" /></Button>
      </div>
    </div>
  );
}
