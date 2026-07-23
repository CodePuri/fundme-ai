"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  FileText,
  Globe2,
  Linkedin,
  LockKeyhole,
  Paperclip,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
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
  return <p className="mt-2 text-xs font-medium text-[#b33f20]" role="alert">{children}</p>;
}

function UploadButton({
  accept,
  kind,
  label,
}: {
  accept: string;
  kind: ArtifactKind;
  label: string;
}) {
  const { attachFile } = useAssessment();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) setError(attachFile(file, kind));
          event.target.value = "";
        }}
      />
      <Button className="min-h-11 w-full justify-center" onClick={() => inputRef.current?.click()} variant="secondary">
        <Paperclip className="size-4" />
        {label}
      </Button>
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

function AttachedFile({
  id,
  name,
  onRemove,
}: {
  id: string;
  name: string;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="mt-3 flex min-w-0 items-center justify-between gap-3 rounded-xl bg-[#f6f1ea] px-3 py-2.5 text-sm">
      <span className="truncate">{name}</span>
      <button
        aria-label={`Remove ${name}`}
        className="grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b3d]"
        onClick={() => onRemove(id)}
        type="button"
      >
        <X className="size-4" />
      </button>
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

  function analyze() {
    const validation = submitIntake();
    setErrors(validation.errors);
    if (validation.valid) router.push("/assessment/analyzing");
  }

  const deck = session.artifacts.find((artifact) => artifact.kind === "pitch-deck");
  const founderProfile = session.artifacts.find((artifact) => artifact.kind === "founder-profile");

  return (
    <div className="mx-auto max-w-[920px]">
      <div className="mx-auto max-w-[720px] text-center">
        <p className="eyebrow">Free funding-fit diagnosis</p>
        <h1 className="instrument-serif mt-3 text-[44px] leading-[0.98] tracking-[-0.035em] sm:text-6xl">
          Show us the founder and the idea.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-[var(--text-muted)] sm:text-base">
          Get a deterministic funding-readiness diagnosis before creating an account. No long questionnaire and no conversational interview.
        </p>
      </div>

      <section className="mt-8 rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_24px_70px_rgba(17,17,17,0.06)] sm:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block text-sm font-semibold" htmlFor="founder-name">
            <span className="flex items-center gap-2"><UserRound className="size-4 text-[#ff6b3d]" />Founder name</span>
            <Input
              id="founder-name"
              className="mt-2 min-h-12"
              autoComplete="name"
              value={session.input.founderName}
              onChange={(event) => updateInput("founderName", event.target.value)}
              placeholder="Asha Rao"
            />
            <FieldError>{errors.founderName}</FieldError>
          </label>

          <label className="block text-sm font-semibold" htmlFor="startup-website">
            <span className="flex items-center gap-2"><Globe2 className="size-4 text-[#ff6b3d]" />Startup website <span className="font-normal text-[#8b8276]">optional</span></span>
            <Input
              id="startup-website"
              className="mt-2 min-h-12"
              inputMode="url"
              value={session.input.websiteUrl}
              onChange={(event) => updateInput("websiteUrl", event.target.value)}
              placeholder="yourstartup.com"
            />
            <FieldError>{errors.websiteUrl}</FieldError>
          </label>

          <div className="rounded-[20px] border border-black/8 bg-[#fbf8f4] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Linkedin className="mt-0.5 size-5 text-[#ff6b3d]" />
              <div>
                <h2 className="text-sm font-semibold">LinkedIn or founder profile</h2>
                <p className="mt-1 text-xs leading-5 text-[#777066]">Optional. Paste a public profile URL, upload an export, or paste relevant profile text.</p>
              </div>
            </div>
            <label className="mt-4 block text-xs font-semibold" htmlFor="linkedin-url">
              Profile URL
              <Input
                id="linkedin-url"
                className="mt-2 min-h-11 bg-white"
                inputMode="url"
                value={session.input.linkedInUrl ?? ""}
                onChange={(event) => updateInput("linkedInUrl", event.target.value)}
                placeholder="linkedin.com/in/founder"
              />
              <FieldError>{errors.linkedInUrl}</FieldError>
            </label>
            <div className="mt-3">
              <UploadButton
                accept=".pdf,.doc,.docx,.txt,application/pdf"
                kind="founder-profile"
                label="Upload profile PDF or export"
              />
              {founderProfile ? <AttachedFile id={founderProfile.id} name={founderProfile.name} onRemove={removeArtifact} /> : null}
            </div>
            <details className="mt-3 rounded-xl border border-black/8 bg-white px-3 py-2.5">
              <summary className="cursor-pointer text-xs font-semibold">Or paste profile text</summary>
              <label className="mt-3 block text-xs font-semibold" htmlFor="profile-text">
                Founder evidence
                <Textarea
                  id="profile-text"
                  className="mt-2 min-h-24"
                  maxLength={20_000}
                  value={session.input.profileText}
                  onChange={(event) => updateInput("profileText", event.target.value)}
                  placeholder="Relevant experience, domain access, or a LinkedIn profile export…"
                />
              </label>
            </details>
            <p className="mt-3 text-[11px] leading-4 text-[#8b8276]">Direct LinkedIn connection is unavailable in this Preview. FundMe does not scrape LinkedIn.</p>
          </div>

          <div className="rounded-[20px] border border-black/8 bg-[#fbf8f4] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 size-5 text-[#ff6b3d]" />
              <div>
                <h2 className="text-sm font-semibold">Pitch deck</h2>
                <p className="mt-1 text-xs leading-5 text-[#777066]">Optional PDF, maximum 10 MB.</p>
              </div>
            </div>
            <div className="mt-4">
              <UploadButton accept=".pdf,application/pdf" kind="pitch-deck" label="Upload pitch deck" />
              {deck ? <AttachedFile id={deck.id} name={deck.name} onRemove={removeArtifact} /> : null}
            </div>
            <p className="mt-3 text-[11px] leading-4 text-[#8b8276]">This Preview records the file metadata but does not parse or claim slide-level analysis.</p>
          </div>
        </div>

        <label className="mt-6 block text-sm font-semibold" htmlFor="startup-description">
          One-line startup description
          <span className="ml-2 font-normal text-[#8b8276]">needed only when no website or deck is provided</span>
          <Textarea
            id="startup-description"
            className="mt-2 min-h-24"
            maxLength={280}
            value={session.input.description}
            onChange={(event) => updateInput("description", event.target.value)}
            placeholder="We help [customer] solve [problem] with [approach]."
          />
          <span className="mt-2 flex items-start justify-between gap-4">
            <FieldError>{errors.description ?? errors.fundingSource}</FieldError>
            <span className="ml-auto text-xs font-normal text-[#8b8276]">{session.input.description.length}/280</span>
          </span>
        </label>

        {session.persistenceWarning ? (
          <p className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950" role="alert">
            {session.persistenceWarning} Keep this tab open until you finish.
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-5 border-t border-black/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex max-w-xl items-start gap-3 text-xs leading-5 text-[#777066]">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#2f7d57]" />
            <p>Your assessment stays in browser-local Preview storage. No Production Supabase write or account creation occurs before results.</p>
          </div>
          <Button className="min-h-12 shrink-0 px-6" onClick={analyze} size="lg">
            Analyze my funding fit
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] text-[#8b8276]">
        <LockKeyhole className="size-3.5" />
        Founder-supplied text and file metadata only. No background scraping.
      </p>
    </div>
  );
}
