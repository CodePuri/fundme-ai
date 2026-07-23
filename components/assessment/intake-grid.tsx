"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Building2, FileText, Globe2, Paperclip, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAssessment } from "@/components/assessment/assessment-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getBrowserStorage, readStorageItem } from "@/lib/assessment/persistence";
import type { ArtifactKind } from "@/lib/assessment/types";
import type { IntakeErrors } from "@/lib/assessment/validation";

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-2 text-xs font-medium text-[#c54824]" role="alert">{children}</p>;
}

function UploadButton({ kind, label }: { kind: ArtifactKind; label: string }) {
  const { attachFile } = useAssessment();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={kind === "pitch-deck" ? ".pdf,application/pdf" : ".pdf,.doc,.docx,.txt"}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) setError(attachFile(file, kind));
          event.target.value = "";
        }}
      />
      <Button className="w-full" onClick={() => inputRef.current?.click()} variant="secondary">
        <Paperclip className="size-4" /> {label}
      </Button>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

export function IntakeGrid() {
  const router = useRouter();
  const { session, updateInput, removeArtifact, submitIntake } = useAssessment();
  const [errors, setErrors] = useState<IntakeErrors>({});

  useEffect(() => {
    if (session.input.websiteUrl || session.input.startupName) return;
    const homepageWebsite = readStorageItem(getBrowserStorage(window), "fundme-homepage-website");
    if (homepageWebsite.ok && homepageWebsite.value) updateInput("websiteUrl", homepageWebsite.value);
  }, [session.input.startupName, session.input.websiteUrl, updateInput]);

  function continueToReview() {
    const validation = submitIntake();
    setErrors(validation.errors);
    if (validation.valid) router.push("/assessment/review");
  }

  return (
    <div className="mx-auto max-w-[980px]">
      <div className="mb-8 max-w-[720px]">
        <p className="eyebrow">Start with what you know</p>
        <h1 className="instrument-serif mt-3 text-4xl leading-[1.05] sm:text-6xl">Give the Grill a clean starting point.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-muted)]">This first screen is intake, not a chat. Add the minimum founder and startup context, then review exactly what the mentor will use.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_18px_50px_rgba(17,17,17,0.05)] sm:p-6">
          <div className="mb-5 flex items-center gap-3"><Building2 className="size-5 text-[#ff6b3d]" /><h2 className="font-semibold">Startup identity</h2></div>
          <div className="space-y-4">
            <label className="block text-sm font-medium">Startup name<Input className="mt-2" value={session.input.startupName} onChange={(e) => updateInput("startupName", e.target.value)} placeholder="SignalStack" /></label>
            <div className="text-center text-[11px] font-bold uppercase tracking-widest text-[#8b8276]">or</div>
            <label className="block text-sm font-medium"><span className="flex items-center gap-2"><Globe2 className="size-4" />Website</span><Input className="mt-2" value={session.input.websiteUrl} onChange={(e) => updateInput("websiteUrl", e.target.value)} placeholder="signalstack.com" inputMode="url" /></label>
            <FieldError>{errors.startupIdentity ?? errors.websiteUrl}</FieldError>
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_18px_50px_rgba(17,17,17,0.05)] sm:p-6">
          <div className="mb-5 flex items-center gap-3"><UserRound className="size-5 text-[#ff6b3d]" /><h2 className="font-semibold">Founder</h2></div>
          <div className="space-y-4">
            <label className="block text-sm font-medium">Founder name<Input className="mt-2" value={session.input.founderName} onChange={(e) => updateInput("founderName", e.target.value)} placeholder="Asha Rao" /></label>
            <FieldError>{errors.founderName}</FieldError>
            <label className="block text-sm font-medium">Role<Input className="mt-2" value={session.input.founderRole} onChange={(e) => updateInput("founderRole", e.target.value)} placeholder="Founder & CEO" /></label>
            <FieldError>{errors.founderRole}</FieldError>
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_18px_50px_rgba(17,17,17,0.05)] sm:p-6">
          <div className="mb-5 flex items-center gap-3"><FileText className="size-5 text-[#ff6b3d]" /><h2 className="font-semibold">One-line startup description</h2></div>
          <Textarea maxLength={280} value={session.input.description} onChange={(e) => updateInput("description", e.target.value)} placeholder="We help [customer] solve [problem] by [approach]." />
          <div className="mt-2 flex justify-between gap-3"><FieldError>{errors.description}</FieldError><span className="ml-auto text-xs text-[#8b8276]">{session.input.description.length}/280</span></div>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_18px_50px_rgba(17,17,17,0.05)] sm:p-6">
          <div className="mb-5 flex items-center gap-3"><Paperclip className="size-5 text-[#ff6b3d]" /><div><h2 className="font-semibold">Pitch deck</h2><p className="text-xs text-[#8b8276]">Optional · PDF · maximum 10 MB</p></div></div>
          <UploadButton kind="pitch-deck" label="Attach pitch deck" />
          {session.artifacts.filter((item) => item.kind === "pitch-deck").map((artifact) => <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f6f1ea] px-3 py-2 text-sm" key={artifact.id}><span className="truncate">{artifact.name}</span><button aria-label={`Remove ${artifact.name}`} onClick={() => removeArtifact(artifact.id)}><X className="size-4" /></button></div>)}
          <p className="mt-3 text-xs leading-5 text-[#8b8276]">The Preview represents the attachment but does not parse or assess its contents.</p>
        </section>
      </div>

      <details className="mt-4 rounded-[24px] border border-[var(--border)] bg-white/70 p-5">
        <summary className="cursor-pointer font-semibold">Add optional founder evidence</summary>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div><p className="mb-2 text-sm font-medium">Founder profile or resume</p><UploadButton kind="founder-profile" label="Attach profile or resume" /></div>
          <label className="block text-sm font-medium">Paste LinkedIn or profile text<Textarea className="mt-2" value={session.input.profileText} onChange={(e) => updateInput("profileText", e.target.value)} placeholder="Paste relevant experience, domain access, or profile text…" /></label>
        </div>
      </details>

      {session.persistenceWarning && <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="alert">{session.persistenceWarning} Keep this tab open until you finish.</p>}
      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-[24px] border border-[var(--border)] bg-[#171513] p-5 text-white sm:flex-row sm:items-center">
        <p className="max-w-xl text-sm leading-6 text-white/70">Preview privacy: your entries stay in this browser unless you explicitly download or share the report. No Production Supabase write occurs.</p>
        <Button className="shrink-0 border-white bg-white text-[#171513] hover:border-white hover:bg-[#f6f1ea]" onClick={continueToReview} size="lg">Review context <ArrowRight className="size-4" /></Button>
      </div>
    </div>
  );
}
