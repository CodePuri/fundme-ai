"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Mic, Upload } from "lucide-react";

import {
  ONBOARDING_DRAFT_KEY,
  ONBOARDING_STEP_KEY,
  useDemo,
} from "@/components/app/demo-provider";
import { TopNavbar } from "@/components/app/top-navbar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Panel, PanelBody, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

const attachedFiles = ["Flowstate_deck.pdf", "startup_memo.docx"];
const rambleText =
  "We built Flowstate AI because I spent 5 years running a digital agency and lost over $180K to scope creep. We detect scope creep in real time and auto-generate change order documentation in under 60 seconds. 87 signups, 3 pilots, $2,400/mo recovered revenue.";

type OnboardingDraft = {
  step?: number;
  name?: string;
  role?: string;
  notes?: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useDemo();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("Arjun Mehta");
  const [role, setRole] = useState("Founder & CEO");
  const [notes, setNotes] = useState("");
  const [files] = useState(attachedFiles);
  const [listening, setListening] = useState(false);
  const [typedOpen, setTypedOpen] = useState(false);
  const [doneFlash, setDoneFlash] = useState(false);

  useEffect(() => {
    const savedStep = window.localStorage.getItem(ONBOARDING_STEP_KEY);
    const savedDraft = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);
    let nextName = "Arjun Mehta";
    let nextRole = "Founder & CEO";
    let nextNotes = "";
    let nextTypedOpen = false;
    let nextStep = 1;

    if (savedStep === "2" || savedStep === "3") {
      nextStep = Number(savedStep);
    }

    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as OnboardingDraft;
        nextName = parsed.name ?? "Arjun Mehta";
        nextRole = parsed.role ?? "Founder & CEO";
        nextNotes = parsed.notes ?? "";
        nextTypedOpen = Boolean(parsed.notes);
      } catch {
        window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
      }
    }

    startTransition(() => {
      setStep(nextStep);
      setName(nextName);
      setRole(nextRole);
      setNotes(nextNotes);
      setTypedOpen(nextTypedOpen);
      setHasHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (step === 2 || step === 3) {
      window.localStorage.setItem(ONBOARDING_STEP_KEY, String(step));
    } else {
      window.localStorage.removeItem(ONBOARDING_STEP_KEY);
    }
  }, [hasHydrated, step]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(
      ONBOARDING_DRAFT_KEY,
      JSON.stringify({
        name,
        role,
        notes,
      }),
    );
  }, [hasHydrated, name, notes, role]);

  const summaryRows = useMemo(
    () => [
      ["Founder", name],
      ["Startup", "Flowstate AI"],
      ["Materials", files.join(", ")],
    ],
    [files, name],
  );

  async function handleListen() {
    if (listening) {
      return;
    }

    setListening(true);
    setTypedOpen(false);
    await new Promise((resolve) => setTimeout(resolve, 4000));
    setTypedOpen(true);
    let typed = "";
    for (const character of rambleText) {
      typed += character;
      setNotes(typed);
      await new Promise((resolve) => setTimeout(resolve, 18));
    }
    setListening(false);
    setDoneFlash(true);
    window.setTimeout(() => setDoneFlash(false), 1200);
  }

  function finishOnboarding() {
    completeOnboarding({
      founderName: name,
      founderRole: role,
      notes: notes || rambleText,
      files,
    });
    window.localStorage.removeItem(ONBOARDING_STEP_KEY);
    window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
    router.push("/processing");
  }

  if (!hasHydrated) {
    return <main className="min-h-screen bg-[var(--bg)]" />;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]" data-theme="app">
      <TopNavbar />

      <div className="page-frame flex min-h-[calc(100vh-72px)] flex-col px-4 py-6 sm:px-6">
        {step > 1 ? (
          <div className="mb-6 flex flex-col gap-3">
            <button
              className="w-fit text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              onClick={() => setStep((current) => Math.max(1, current - 1))}
              type="button"
            >
              ← Back
            </button>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Onboarding", href: "/onboarding" },
                { label: `Step ${step}` },
              ]}
            />
          </div>
        ) : (
          <div className="mb-6" />
        )}

        <div className="flex justify-center gap-2 pb-8">
          {[1, 2, 3, 4].map((dot) => (
            <span
              className={`size-2 rounded-full ${dot === step ? "bg-[var(--text-primary)]" : dot < step ? "bg-[var(--text-muted)]" : "bg-[var(--border-strong)]"}`}
              key={dot}
            />
          ))}
        </div>

        <div className="mx-auto flex w-full max-w-[880px] flex-1 items-center justify-center">
          {step === 1 ? (
            <Panel className="w-full max-w-[620px]">
              <PanelHeader className="block">
                <PanelTitle className="text-[42px] tracking-[-0.04em]">Let&apos;s build your profile.</PanelTitle>
              </PanelHeader>
              <PanelBody className="grid gap-5">
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input onChange={(event) => setName(event.target.value)} value={name} />
                </Field>
                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <Input onChange={(event) => setRole(event.target.value)} value={role} />
                </Field>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} size="lg">
                    Continue
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </PanelBody>
            </Panel>
          ) : null}

          {step === 2 ? (
            <div className="flex w-full max-w-[760px] flex-col items-center text-center">
              <div className="eyebrow">What are you building?</div>
              <button
                className={`relative flex size-20 items-center justify-center rounded-full border ${
                  listening
                    ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg)] shadow-[0_0_0_10px_color-mix(in_srgb,var(--text-primary)_5%,transparent)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm"
                }`}
                onClick={handleListen}
                type="button"
              >
                {listening ? (
                  <div className="absolute inset-[-14px] flex items-center justify-center gap-1">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <span
                        className="w-1 animate-pulse rounded-full bg-white/60"
                        key={index}
                        style={{ height: `${10 + (index % 4) * 7}px`, animationDelay: `${index * 80}ms` }}
                      />
                    ))}
                  </div>
                ) : null}
                <Mic className="relative z-10 size-9" />
              </button>
              <div className="mt-6 text-[28px] font-semibold tracking-[-0.03em]">
                Tap to speak and describe it naturally
              </div>
              <button className="mt-4 text-[14px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]" onClick={() => setTypedOpen(true)} type="button">
                prefer to type →
              </button>
              {doneFlash ? <div className="mt-6 text-[14px] font-medium text-[var(--accent-green)]">Done ✓</div> : null}

              {typedOpen ? (
                <motion.div animate={{ opacity: 1, y: 0 }} className="mt-10 w-full" initial={{ opacity: 0, y: 24 }}>
                  <Textarea
                    className="min-h-[220px]"
                    onChange={(event) => setNotes(event.target.value)}
                    value={notes}
                  />
                  {!listening && notes ? (
                    <div className="mt-6 flex justify-end">
                      <Button onClick={() => setStep(3)} size="lg">
                        Continue
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  ) : null}
                </motion.div>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <Panel className="w-full max-w-[720px]">
              <PanelHeader className="block">
                <PanelTitle className="text-[42px] tracking-[-0.04em]">Attach your materials</PanelTitle>
                <PanelDescription>A deck, memo, or doc. Optional.</PanelDescription>
              </PanelHeader>
              <PanelBody>
                <div className="rounded-[16px] border border-dashed border-[var(--border-strong)] bg-[var(--surface-elevated)] px-5 py-10 text-center">
                  <Upload className="mx-auto size-6 text-[var(--text-muted)]" />
                  <div className="mt-4 text-[14px] text-[var(--text-muted)]">Optional file upload</div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {files.map((file) => (
                    <Badge key={file}>{file}</Badge>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button className="text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]" onClick={() => setStep(4)} type="button">
                    Skip I&apos;ll add these later
                  </button>
                  <Button onClick={() => setStep(4)} size="lg">
                    Continue
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </PanelBody>
            </Panel>
          ) : null}

          {step === 4 ? (
            <Panel className="w-full max-w-[720px]">
              <PanelHeader className="block">
                <PanelTitle className="text-[42px] tracking-[-0.04em]">You&apos;re ready.</PanelTitle>
                <PanelDescription>We&apos;ll find your strongest program matches.</PanelDescription>
              </PanelHeader>
              <PanelBody>
                <div className="overflow-hidden rounded-[14px] border border-[var(--border)]">
                  {summaryRows.map(([label, value]) => (
                    <div
                      className="grid grid-cols-[140px_1fr] border-b border-[var(--border)] px-4 py-4 text-[14px] last:border-b-0"
                      key={label}
                    >
                      <div className="text-[var(--text-muted)]">{label}</div>
                      <div className="text-[var(--text-primary)]">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <Button onClick={finishOnboarding} size="lg">
                    Find My Matches →
                  </Button>
                </div>
              </PanelBody>
            </Panel>
          ) : null}
        </div>
      </div>
    </main>
  );
}
