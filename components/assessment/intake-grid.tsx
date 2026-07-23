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
      <span className="flex min-w-0 items-center gap-2">
        <Check className="size-3.5 shrink-0 text-[#2f7d57]" />
        <span className="truncate">{name}</span>
      </span>
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
  const needsDescription = !session.input.websiteUrl.trim() && !deck;

  return (
    <div className="mx-auto max-w-[980px]">
      <header className="mx-auto max-w-[700px] text-center">
        <p className="eyebrow">Free funding-fit diagnosis</p>
        <h1 className="instrument-serif mt-3 text-balance text-[42px] leading-[0.98] tracking-[-0.035em] sm:text-[58px]">
          See what investors will question first.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-6 text-[var(--text-muted)]">
          Add the founder and any sources you already have. No account required.
        </p>
      </header>

      <section className="mt-7 rounded-[28px] border border-[var(--border)] bg-white p-4 shadow-[0_24px_70px_rgba(17,17,17,0.06)] sm:p-7">
        <label className="mx-auto block max-w-xl text-sm font-semibold" htmlFor="founder-name">
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
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#756d63]">Optional sources</span>
          <span className="h-px flex-1 bg-black/8" />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <article className="rounded-[20px] border border-black/8 bg-[#fbf8f4] p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0e8] text-[#bd4e28]"><Linkedin className="size-4.5" /></span>
              <div className="min-w-0"><h2 className="text-sm font-semibold">Founder profile</h2><p className="mt-0.5 text-xs text-[#8b8276]">URL, export or text</p></div>
            </div>
            <label className="mt-4 block text-xs font-semibold" htmlFor="linkedin-url">
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
            <details className="mt-3 rounded-xl border border-black/8 bg-white px-3 py-2.5">
              <summary className="cursor-pointer rounded-md text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b3d]">More profile options</summary>
              <div className="mt-3">
                <UploadButton accept=".pdf,.doc,.docx,.txt,application/pdf" kind="founder-profile" label="Upload profile" />
                {founderProfile ? <AttachedFile id={founderProfile.id} name={founderProfile.name} onRemove={removeArtifact} /> : null}
              </div>
              <label className="mt-3 block text-xs font-semibold" htmlFor="profile-text">
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
            <details className="mt-2 px-1 text-[11px] leading-4 text-[#8b8276]">
              <summary className="cursor-pointer rounded-md font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b3d]">How profile sources work</summary>
              <p className="mt-2">Use a public URL, export or pasted text. FundMe does not scrape LinkedIn.</p>
            </details>
          </article>

          <article className="rounded-[20px] border border-black/8 bg-[#fbf8f4] p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef4fb] text-[#3971a8]"><Globe2 className="size-4.5" /></span>
              <div><h2 className="text-sm font-semibold">Startup website</h2><p className="mt-0.5 text-xs text-[#8b8276]">Your clearest public source</p></div>
            </div>
            <label className="mt-4 block text-xs font-semibold" htmlFor="startup-website">
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
            <p className="mt-3 flex items-start gap-2 text-[11px] leading-4 text-[#8b8276]"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" />Only the address you submit is used in this Preview.</p>
          </article>

          <article className="rounded-[20px] border border-black/8 bg-[#fbf8f4] p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f3eefb] text-[#7452a3]"><FileText className="size-4.5" /></span>
              <div><h2 className="text-sm font-semibold">Pitch deck</h2><p className="mt-0.5 text-xs text-[#8b8276]">PDF · up to 10 MB</p></div>
            </div>
            <div className="mt-4">
              <UploadButton accept=".pdf,application/pdf" kind="pitch-deck" label="Upload pitch deck" />
              {deck ? <AttachedFile id={deck.id} name={deck.name} onRemove={removeArtifact} /> : null}
            </div>
            <details className="mt-3 px-1 text-[11px] leading-4 text-[#8b8276]">
              <summary className="cursor-pointer rounded-md font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b3d]">Deck review scope</summary>
              <p className="mt-2">This Preview records the file, but does not claim slide-level analysis.</p>
            </details>
          </article>
        </div>

        {needsDescription ? (
          <label className="mt-4 block rounded-[18px] border border-dashed border-[#ff6b3d]/35 bg-[#fffaf6] p-4 text-sm font-semibold" htmlFor="startup-description">
            One-line startup description
            <span className="ml-2 font-normal text-[#8b8276]">required without a website or deck</span>
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
              <span className="ml-auto text-xs font-normal text-[#8b8276]">{session.input.description.length}/280</span>
            </span>
          </label>
        ) : null}

        {session.persistenceWarning ? (
          <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950" role="alert">
            {session.persistenceWarning} Keep this tab open until you finish.
          </p>
        ) : null}

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-black/8 pt-5 sm:flex-row">
          <p className="flex items-center gap-2 text-xs text-[#777066]"><LockKeyhole className="size-3.5 text-[#2f7d57]" />Private to this Preview. No account required.</p>
          <Button className="min-h-12 w-full px-6 sm:w-auto" onClick={analyze} size="lg">
            Analyze my funding fit
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
