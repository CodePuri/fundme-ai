"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  FileText,
  Globe2,
  Linkedin,
  LockKeyhole,
  Paperclip,
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
  return <p className="mt-2 text-[13px] font-medium text-[var(--status-critical)]" role="alert">{children}</p>;
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
    <div className="mt-3 flex min-w-0 items-center justify-between gap-3 rounded-xl bg-[var(--surface-elevated)] px-3 py-2.5 text-sm">
      <span className="flex min-w-0 items-center gap-2">
        <Check className="size-3.5 shrink-0 text-[#2f7d57]" />
        <span className="truncate">{name}</span>
      </span>
      <button
        aria-label={`Remove ${name}`}
        className="grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
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
  const needsDescription = !session.input.websiteUrl.trim() && !deck;

  return (
    <div className="mx-auto max-w-[1040px]">
      <header className="mx-auto max-w-[720px] text-center">
        <p className="eyebrow">Free funding-fit diagnosis</p>
        <h1 className="type-page-title mt-3">
          See what investors will question first.
        </h1>
        <p className="type-body-lg mx-auto mt-3 max-w-[62ch] text-[var(--text-secondary)]">
          Add the founder and the sources you already have. No account required.
        </p>
      </header>

      <section className="premium-card mt-7 p-4 sm:p-6">
        <label className="mx-auto block max-w-xl text-[15px] font-semibold" htmlFor="founder-name">
          <span className="flex items-center gap-2"><UserRound className="size-4 text-[#ff6b3d]" />Founder name</span>
          <Input
            id="founder-name"
            className="mt-2 min-h-12"
            autoComplete="name"
            name="founder-name"
            value={session.input.founderName}
            onChange={(event) => updateInput("founderName", event.target.value)}
            placeholder="e.g. Asha Rao…"
          />
          <FieldError>{errors.founderName}</FieldError>
        </label>

        <div className="mt-6 flex items-center gap-3">
          <span className="text-[13px] font-semibold text-[var(--text-secondary)]">Optional sources</span>
          <span className="h-px flex-1 bg-black/8" />
        </div>

        <div className="mt-3 grid items-start gap-3 md:grid-cols-3">
          <article className="h-full rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#bd4e28]/15 bg-white text-[#a64626]"><Linkedin className="size-4.5" /></span>
              <div className="min-w-0"><h2 className="text-[16px] font-semibold">Founder profile</h2><p className="type-metadata mt-0.5 text-[var(--text-secondary)]">URL, export, or text</p></div>
            </div>
            <label className="mt-4 block text-[13px] font-semibold" htmlFor="linkedin-url">
              Profile URL
              <Input
                id="linkedin-url"
                className="mt-2 min-h-11 bg-white"
                autoComplete="url"
                inputMode="url"
                name="founder-profile-url"
                value={session.input.linkedInUrl ?? ""}
                onChange={(event) => updateInput("linkedInUrl", event.target.value)}
                placeholder="linkedin.com/in/founder…"
              />
              <FieldError>{errors.linkedInUrl}</FieldError>
            </label>
            <details className="mt-3 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5">
              <summary className="flex min-h-11 cursor-pointer items-center rounded-md text-[13px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">More profile options</summary>
              <div className="mt-3">
                <UploadButton accept=".pdf,.doc,.docx,.txt,application/pdf" kind="founder-profile" label="Upload profile" />
                {founderProfile ? <AttachedFile id={founderProfile.id} name={founderProfile.name} onRemove={removeArtifact} /> : null}
              </div>
              <label className="mt-3 block text-[13px] font-semibold" htmlFor="profile-text">
                Paste relevant experience
                <Textarea
                  id="profile-text"
                  className="mt-2 min-h-24"
                  maxLength={20_000}
                  name="founder-profile-text"
                  value={session.input.profileText}
                  onChange={(event) => updateInput("profileText", event.target.value)}
                  placeholder="Domain experience, outcomes or profile text…"
                />
              </label>
            </details>
            <details className="mt-2 px-1 text-[13px] leading-5 text-[var(--text-secondary)]">
              <summary className="flex min-h-11 cursor-pointer items-center rounded-md font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">How profile sources work</summary>
              <p className="mt-2">Use a public URL, export or pasted text. FundMe does not scrape LinkedIn.</p>
            </details>
          </article>

          <article className="h-full rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#315f8b]/15 bg-white text-[var(--status-information)]"><Globe2 className="size-4.5" /></span>
              <div><h2 className="text-[16px] font-semibold">Startup website</h2><p className="type-metadata mt-0.5 text-[var(--text-secondary)]">Your clearest public source</p></div>
            </div>
            <label className="mt-4 block text-[13px] font-semibold" htmlFor="startup-website">
              Website
              <Input
                id="startup-website"
                className="mt-2 min-h-11 bg-white"
                autoComplete="url"
                inputMode="url"
                name="startup-website"
                value={session.input.websiteUrl}
                onChange={(event) => updateInput("websiteUrl", event.target.value)}
                placeholder="yourstartup.com…"
              />
              <FieldError>{errors.websiteUrl}</FieldError>
            </label>
            <p className="mt-3 flex items-start gap-2 text-[13px] leading-5 text-[var(--text-secondary)]"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" />Only the address you submit is used.</p>
          </article>

          <article className="h-full rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#7452a3]/15 bg-white text-[#65448f]"><FileText className="size-4.5" /></span>
              <div><h2 className="text-[16px] font-semibold">Pitch deck</h2><p className="type-metadata mt-0.5 text-[var(--text-secondary)]">PDF · up to 10 MB</p></div>
            </div>
            <div className="mt-4">
              <UploadButton accept=".pdf,application/pdf" kind="pitch-deck" label="Upload pitch deck" />
              {deck ? <AttachedFile id={deck.id} name={deck.name} onRemove={removeArtifact} /> : null}
            </div>
            <details className="mt-3 px-1 text-[13px] leading-5 text-[var(--text-secondary)]">
              <summary className="flex min-h-11 cursor-pointer items-center rounded-md font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">Deck review scope</summary>
              <p className="mt-2">This Preview records the file, but does not claim slide-level analysis.</p>
            </details>
          </article>
        </div>

        {needsDescription ? (
          <label className="mt-4 block rounded-[var(--radius-card)] border border-dashed border-[#bd4e28]/40 bg-[#fffaf6] p-4 text-[15px] font-semibold" htmlFor="startup-description">
            One-line startup description
            <span className="ml-2 font-normal text-[var(--text-secondary)]">required without a website or deck</span>
            <Textarea
              id="startup-description"
              className="mt-2 min-h-20 bg-white"
              maxLength={280}
              name="startup-description"
              value={session.input.description}
              onChange={(event) => updateInput("description", event.target.value)}
              placeholder="We help [customer] solve [problem] with [approach]."
            />
            <span className="mt-2 flex items-start justify-between gap-4">
              <FieldError>{errors.description ?? errors.fundingSource}</FieldError>
              <span className="ml-auto text-[13px] font-normal text-[var(--text-secondary)]">{session.input.description.length}/280</span>
            </span>
          </label>
        ) : null}

        {session.persistenceWarning ? (
          <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950" role="alert">
            {session.persistenceWarning} Keep this tab open until you finish.
          </p>
        ) : null}

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-black/8 pt-5 sm:flex-row">
          <p className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]"><LockKeyhole className="size-3.5 text-[var(--status-positive)]" />Private to this Preview. No account required.</p>
          <Button className="min-h-12 w-full px-6 sm:w-auto" onClick={analyze} size="lg">
            Analyze my funding fit
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
