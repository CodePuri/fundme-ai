"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flame,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { FileEvidenceInput } from "@/components/grill/file-evidence-input";
import { GrillShell } from "@/components/grill/grill-shell";
import { ReviewEvidence } from "@/components/grill/review-evidence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { analyzeGrill } from "@/lib/grill/client/analyze";
import { AnonymousDemoIdentityProvider } from "@/lib/grill/client/identity";
import { buildClientReviewMissingInformation } from "@/lib/grill/client/review";
import {
  GRILL_STORAGE_ERROR_MESSAGE,
  GRILL_STORAGE_ERROR_SNAPSHOT,
  createBrowserAssessmentRepository,
  subscribeToGrillStorage,
} from "@/lib/grill/client/repository";
import type {
  FounderIntake,
  GrillIntake,
  StartupIntake,
} from "@/lib/grill/types";
import {
  GRILL_INTAKE_LIMITS,
  validateCombinedFileSize,
  validateFileMetadata,
  validateGrillIntake,
} from "@/lib/grill/validation";

const EMPTY_INTAKE: GrillIntake = {
  founder: {
    fullName: "",
    role: "",
    background: "",
    yearsExperience: 0,
    achievements: "",
    profileText: "",
  },
  startup: {
    name: "",
    website: "",
    oneLinePitch: "",
    problem: "",
    solution: "",
    targetCustomer: "",
    market: "",
    stage: "",
    traction: "",
    revenueOrUsers: "",
    team: "",
    fundingAsk: "",
    useOfFunds: "",
  },
};

const STEP_CONTENT = [
  {
    eyebrow: "Founder signal",
    title: "Why should anyone believe you can win here?",
    description:
      "Give the evidence, not the mythology. Domain exposure, shipped work, and measurable outcomes carry more weight than titles.",
  },
  {
    eyebrow: "Company signal",
    title: "Make the startup legible under pressure.",
    description:
      "The Grill looks for a precise customer, costly problem, credible mechanism, and evidence that the market is moving toward you.",
  },
  {
    eyebrow: "Document signal",
    title: "Put your positioning and deck on the record.",
    description:
      "Only parsed text becomes evidence. An unreadable deck stays unavailable and will never produce invented slide findings.",
  },
  {
    eyebrow: "Evidence check",
    title: "Last chance to fix the record.",
    description:
      "Weak inputs are allowed, but they will be scored as weak inputs. Review the evidence before the rubric runs.",
  },
] as const;

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return <label className="text-sm font-semibold text-[#302d29]" htmlFor={htmlFor}>{children}</label>;
}

function FieldError({ children }: { children?: string }) {
  return children ? <p className="text-xs font-medium text-[#a52d25]">{children}</p> : null;
}

function FormField({
  children,
  error,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}

function FounderStep({
  errors,
  founder,
  update,
}: {
  errors: Record<string, string>;
  founder: FounderIntake;
  update: <Key extends keyof FounderIntake>(key: Key, value: FounderIntake[Key]) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField error={errors["founder.fullName"]} htmlFor="founder-name" label="Full name">
        <Input id="founder-name" maxLength={GRILL_INTAKE_LIMITS.founder.fullName} onChange={(event) => update("fullName", event.target.value)} placeholder="Aisha Rao" value={founder.fullName} />
      </FormField>
      <FormField error={errors["founder.role"]} htmlFor="founder-role" label="Current role">
        <Input id="founder-role" maxLength={GRILL_INTAKE_LIMITS.founder.role} onChange={(event) => update("role", event.target.value)} placeholder="Founder and CEO" value={founder.role} />
      </FormField>
      <FormField error={errors["founder.yearsExperience"]} htmlFor="founder-experience" label="Relevant experience (years)">
        <Input id="founder-experience" max={60} min={0} onChange={(event) => update("yearsExperience", Number(event.target.value))} type="number" value={founder.yearsExperience} />
      </FormField>
      <div className="hidden sm:block" />
      <FormField error={errors["founder.background"]} htmlFor="founder-background" label="Short background">
        <Textarea className="min-h-28" id="founder-background" maxLength={GRILL_INTAKE_LIMITS.founder.background} onChange={(event) => update("background", event.target.value)} placeholder="What have you built, operated, researched, or sold that matters here?" value={founder.background} />
      </FormField>
      <FormField error={errors["founder.achievements"]} htmlFor="founder-achievements" label="Founder achievements">
        <Textarea className="min-h-28" id="founder-achievements" maxLength={GRILL_INTAKE_LIMITS.founder.achievements} onChange={(event) => update("achievements", event.target.value)} placeholder="Use scope and numbers: customers, team, revenue, launches, research, exits." value={founder.achievements} />
      </FormField>
      <div className="sm:col-span-2">
        <FormField error={errors["founder.profileText"]} htmlFor="profile-text" label="LinkedIn or founder profile text">
          <Textarea className="min-h-36" id="profile-text" maxLength={GRILL_INTAKE_LIMITS.founder.profileText} onChange={(event) => update("profileText", event.target.value)} placeholder="Paste the About, Experience, or founder bio text you want reviewed. Fundme does not scrape LinkedIn." value={founder.profileText} />
        </FormField>
      </div>
    </div>
  );
}

function StartupStep({
  errors,
  startup,
  update,
}: {
  errors: Record<string, string>;
  startup: StartupIntake;
  update: <Key extends keyof StartupIntake>(key: Key, value: StartupIntake[Key]) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField error={errors["startup.name"]} htmlFor="startup-name" label="Startup name">
        <Input id="startup-name" maxLength={GRILL_INTAKE_LIMITS.startup.name} onChange={(event) => update("name", event.target.value)} placeholder="FinPilot" value={startup.name} />
      </FormField>
      <FormField error={errors["startup.website"]} htmlFor="startup-website" label="Website">
        <Input id="startup-website" maxLength={GRILL_INTAKE_LIMITS.startup.website} onChange={(event) => update("website", event.target.value)} placeholder="https://yourstartup.com" type="url" value={startup.website} />
      </FormField>
      <FormField error={errors["startup.oneLinePitch"]} htmlFor="startup-pitch" label="One-line pitch">
        <Input id="startup-pitch" maxLength={GRILL_INTAKE_LIMITS.startup.oneLinePitch} onChange={(event) => update("oneLinePitch", event.target.value)} placeholder="Customer + product mechanism + outcome" value={startup.oneLinePitch} />
      </FormField>
      <FormField error={errors["startup.stage"]} htmlFor="startup-stage" label="Stage">
        <select className="app-input h-11 w-full rounded-lg px-3.5 text-sm" id="startup-stage" onChange={(event) => update("stage", event.target.value)} value={startup.stage}>
          <option value="">Select stage</option>
          <option value="Idea">Idea</option>
          <option value="Pre-launch">Pre-launch</option>
          <option value="Pre-seed">Pre-seed</option>
          <option value="Seed">Seed</option>
          <option value="Series A+">Series A+</option>
        </select>
      </FormField>
      <FormField error={errors["startup.problem"]} htmlFor="startup-problem" label="Problem">
        <Textarea className="min-h-28" id="startup-problem" maxLength={GRILL_INTAKE_LIMITS.startup.problem} onChange={(event) => update("problem", event.target.value)} placeholder="Who has the problem, what happens, how often, and what does it cost?" value={startup.problem} />
      </FormField>
      <FormField error={errors["startup.solution"]} htmlFor="startup-solution" label="Solution">
        <Textarea className="min-h-28" id="startup-solution" maxLength={GRILL_INTAKE_LIMITS.startup.solution} onChange={(event) => update("solution", event.target.value)} placeholder="What does the product do differently in the customer's workflow?" value={startup.solution} />
      </FormField>
      <FormField error={errors["startup.targetCustomer"]} htmlFor="startup-customer" label="Target customer">
        <Textarea className="min-h-24" id="startup-customer" maxLength={GRILL_INTAKE_LIMITS.startup.targetCustomer} onChange={(event) => update("targetCustomer", event.target.value)} placeholder="Start narrow: role, company type, size, geography, trigger." value={startup.targetCustomer} />
      </FormField>
      <FormField error={errors["startup.market"]} htmlFor="startup-market" label="Market">
        <Textarea className="min-h-24" id="startup-market" maxLength={GRILL_INTAKE_LIMITS.startup.market} onChange={(event) => update("market", event.target.value)} placeholder="Initial reachable segment and why now." value={startup.market} />
      </FormField>
      <FormField error={errors["startup.traction"]} htmlFor="startup-traction" label="Traction">
        <Textarea className="min-h-24" id="startup-traction" maxLength={GRILL_INTAKE_LIMITS.startup.traction} onChange={(event) => update("traction", event.target.value)} placeholder="Pilots, usage, retention, LOIs, learning velocity, or explicit pre-launch state." value={startup.traction} />
      </FormField>
      <FormField error={errors["startup.revenueOrUsers"]} htmlFor="startup-revenue" label="Revenue or users">
        <Textarea className="min-h-24" id="startup-revenue" maxLength={GRILL_INTAKE_LIMITS.startup.revenueOrUsers} onChange={(event) => update("revenueOrUsers", event.target.value)} placeholder="Metric, value, period, and denominator." value={startup.revenueOrUsers} />
      </FormField>
      <FormField error={errors["startup.team"]} htmlFor="startup-team" label="Team">
        <Textarea className="min-h-24" id="startup-team" maxLength={GRILL_INTAKE_LIMITS.startup.team} onChange={(event) => update("team", event.target.value)} placeholder="Full-time team, functions covered, and missing roles." value={startup.team} />
      </FormField>
      <div className="grid gap-5 sm:contents">
        <FormField error={errors["startup.fundingAsk"]} htmlFor="startup-ask" label="Funding ask">
          <Textarea className="min-h-24" id="startup-ask" maxLength={GRILL_INTAKE_LIMITS.startup.fundingAsk} onChange={(event) => update("fundingAsk", event.target.value)} placeholder="Amount, round, and intended runway." value={startup.fundingAsk} />
        </FormField>
        <FormField error={errors["startup.useOfFunds"]} htmlFor="startup-use" label="Intended use of funds">
          <Textarea className="min-h-24" id="startup-use" maxLength={GRILL_INTAKE_LIMITS.startup.useOfFunds} onChange={(event) => update("useOfFunds", event.target.value)} placeholder="Tie spend to measurable milestones." value={startup.useOfFunds} />
        </FormField>
      </div>
    </div>
  );
}

function EvidenceStep({
  deckError,
  deckFile,
  onDeckFile,
  onProfileFile,
  profileError,
  profileFile,
}: {
  deckError?: string;
  deckFile: File | null;
  onDeckFile: (file: File | null) => boolean;
  onProfileFile: (file: File | null) => boolean;
  profileError?: string;
  profileFile: File | null;
}) {
  return (
    <div className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <FileEvidenceInput accept="application/pdf,text/plain,.pdf,.txt" description="Optional PDF or TXT, up to 3.5 MB" error={profileError} file={profileFile} id="profile-document" label="Profile document" onChange={onProfileFile} />
        <FileEvidenceInput accept="application/pdf,.pdf" description="PDF only, up to 3.5 MB" error={deckError} file={deckFile} id="pitch-deck" label="Pitch deck" onChange={onDeckFile} />
      </div>
      <div className="flex items-start gap-3 rounded-lg border border-[#4b7eb8]/25 bg-[#eef6ff] p-4 text-sm leading-6 text-[#274e79]">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>Files are analyzed in memory for this request. The Preview saves the resulting report locally in this browser, not in Production storage.</p>
      </div>
    </div>
  );
}

export function GrillClient() {
  const router = useRouter();
  const analysisControllerRef = useRef<AbortController | null>(null);
  const repository = useMemo(() => createBrowserAssessmentRepository(), []);
  const getSnapshot = useCallback(
    () =>
      repository?.getSnapshot() ??
      (typeof window === "undefined" ? "" : GRILL_STORAGE_ERROR_SNAPSHOT),
    [repository],
  );
  const snapshot = useSyncExternalStore(subscribeToGrillStorage, getSnapshot, () => "");
  const persistedRead = useMemo(() => {
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
  const persisted = persistedRead.state;
  const intake = persisted?.intake ?? EMPTY_INTAKE;
  const currentStep = persisted?.currentStep ?? 0;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [deckFile, setDeckFile] = useState<File | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const visibleStorageError =
    storageError ??
    (persistedRead.error ? GRILL_STORAGE_ERROR_MESSAGE : null);

  useEffect(
    () => () => {
      analysisControllerRef.current?.abort();
      analysisControllerRef.current = null;
    },
    [],
  );

  const persist = useCallback((nextIntake: GrillIntake, step = currentStep) => {
    if (!repository) return;
    try {
      repository.update(nextIntake, step, intake);
      setStorageError(null);
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : "This browser could not save the demo.");
    }
  }, [currentStep, intake, repository]);

  const updateFounder = useCallback(<Key extends keyof FounderIntake>(key: Key, value: FounderIntake[Key]) => {
    persist({ ...intake, founder: { ...intake.founder, [key]: value } });
    setErrors((current) => {
      const next = { ...current };
      delete next[`founder.${String(key)}`];
      return next;
    });
  }, [intake, persist]);

  const updateStartup = useCallback(<Key extends keyof StartupIntake>(key: Key, value: StartupIntake[Key]) => {
    persist({ ...intake, startup: { ...intake.startup, [key]: value } });
    setErrors((current) => {
      const next = { ...current };
      delete next[`startup.${String(key)}`];
      return next;
    });
  }, [intake, persist]);

  const missingInformation = useMemo(
    () =>
      buildClientReviewMissingInformation(intake, {
        profileSelected: profileFile !== null,
        deckSelected: deckFile !== null,
      }),
    [deckFile, intake, profileFile],
  );

  const validateCurrentStep = useCallback(() => {
    const allErrors = validateGrillIntake(intake);
    const prefix = currentStep === 0 ? "founder." : currentStep === 1 ? "startup." : null;
    const relevant = prefix
      ? Object.fromEntries(Object.entries(allErrors).filter(([key]) => key.startsWith(prefix)))
      : allErrors;
    setErrors(relevant);
    return Object.keys(relevant).length === 0;
  }, [currentStep, intake]);

  const goToStep = useCallback((nextStep: number) => {
    if (isAnalyzing) return;
    if (nextStep > currentStep && !validateCurrentStep()) return;
    persist(intake, Math.max(0, Math.min(3, nextStep)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, intake, isAnalyzing, persist, validateCurrentStep]);

  const updateFile = useCallback((kind: "profile_document" | "pitch_deck", file: File | null) => {
    if (!file) {
      if (kind === "pitch_deck") setDeckFile(null);
      else setProfileFile(null);
      setFileErrors((current) => ({ ...current, [kind]: "" }));
      return true;
    }
    const validation = validateFileMetadata(file, kind);
    if (!validation.ok) {
      setFileErrors((current) => ({ ...current, [kind]: validation.message }));
      return false;
    }
    const other = kind === "pitch_deck" ? profileFile : deckFile;
    const combined = validateCombinedFileSize([file, ...(other ? [other] : [])]);
    if (!combined.ok) {
      setFileErrors((current) => ({ ...current, [kind]: combined.message }));
      return false;
    }
    setFileErrors((current) => ({ ...current, [kind]: "" }));
    if (kind === "pitch_deck") setDeckFile(file);
    else setProfileFile(file);
    return true;
  }, [deckFile, profileFile]);

  const submit = useCallback(async () => {
    const allErrors = validateGrillIntake(intake);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const first = Object.keys(allErrors)[0];
      goToStep(first.startsWith("founder.") ? 0 : 1);
      return;
    }
    if (!repository) {
      setSubmitError("Browser storage is unavailable, so the demo cannot preserve this report.");
      return;
    }
    setSubmitError(null);
    setIsAnalyzing(true);
    setUploadProgress(0);
    const controller = new AbortController();
    analysisControllerRef.current = controller;
    try {
      const state = repository.update(intake, 3, intake);
      const analysisId = repository.beginAnalysis(state.intake);
      const identity = await new AnonymousDemoIdentityProvider(repository).getIdentity();
      const response = await analyzeGrill({
        intake: state.intake,
        identity,
        profileFile,
        deckFile,
        onProgress: setUploadProgress,
        signal: controller.signal,
      });
      if (!response.ok || controller.signal.aborted) return;
      repository.saveReport(response.report, state.intake, analysisId);
      router.push("/grill/result");
    } catch (error) {
      if (controller.signal.aborted) return;
      setSubmitError(error instanceof Error ? error.message : "The analysis could not be completed.");
    } finally {
      if (analysisControllerRef.current === controller) {
        analysisControllerRef.current = null;
      }
      if (!controller.signal.aborted) setIsAnalyzing(false);
    }
  }, [deckFile, goToStep, intake, profileFile, repository, router]);

  const content = STEP_CONTENT[currentStep];

  return (
    <GrillShell currentStep={currentStep} interactionLocked={isAnalyzing} onStepSelect={goToStep}>
      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12 lg:py-12">
        <aside className="self-start lg:sticky lg:top-6">
          <p className="text-xs font-bold text-[#b44828]">{content.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.02] text-[#171513]" style={{ fontFamily: "var(--font-instrument)" }}>
            {content.title}
          </h1>
          <p className="mt-5 text-sm leading-7 text-[#6f685f]">{content.description}</p>
          <div className="mt-6 border-l-[3px] border-[#37b26c] pl-4 text-xs leading-5 text-[#5e5750]">
            Preview data stays in this browser. Production Clerk and Supabase are not connected.
          </div>
        </aside>

        <section className="min-w-0">
          {visibleStorageError ? (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-[#c94134]/30 bg-[#fff2ef] p-4 text-sm text-[#8e2e26]">
              <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>{visibleStorageError}</p>
            </div>
          ) : null}

          <div className="rounded-lg border border-black/10 bg-[#fffdf9] p-5 shadow-[0_16px_50px_rgba(23,21,19,0.06)] sm:p-7">
            {currentStep === 0 ? <FounderStep errors={errors} founder={intake.founder} update={updateFounder} /> : null}
            {currentStep === 1 ? <StartupStep errors={errors} startup={intake.startup} update={updateStartup} /> : null}
            {currentStep === 2 ? (
              <EvidenceStep
                deckError={fileErrors.pitch_deck}
                deckFile={deckFile}
                onDeckFile={(file) => updateFile("pitch_deck", file)}
                onProfileFile={(file) => updateFile("profile_document", file)}
                profileError={fileErrors.profile_document}
                profileFile={profileFile}
              />
            ) : null}
            {currentStep === 3 ? (
              <ReviewEvidence deckFile={deckFile} intake={intake} interactionLocked={isAnalyzing} missing={missingInformation} onEdit={goToStep} profileFile={profileFile} />
            ) : null}
          </div>

          {submitError ? (
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-[#c94134]/30 bg-[#fff2ef] p-4 text-sm text-[#8e2e26]">
              <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>{submitError}</p>
            </div>
          ) : null}

          {isAnalyzing ? (
            <div className="mt-5 rounded-lg border border-black/10 bg-white p-4">
              <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                <span className="flex items-center gap-2"><LoaderCircle aria-hidden="true" className="size-4 animate-spin text-[#b44828]" />{uploadProgress < 100 ? "Uploading evidence" : "Running deterministic Grill"}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div aria-label="Analysis progress" aria-valuemax={100} aria-valuemin={0} aria-valuenow={uploadProgress} className="mt-3 h-2 overflow-hidden rounded-full bg-black/8" role="progressbar">
                <div className="h-full rounded-full bg-[#ff6b3d] transition-[width] duration-200" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button disabled={currentStep === 0 || isAnalyzing} onClick={() => goToStep(currentStep - 1)} variant="secondary">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back
            </Button>
            {currentStep < 3 ? (
              <Button disabled={isAnalyzing} onClick={() => goToStep(currentStep + 1)}>
                Continue
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            ) : (
              <Button disabled={isAnalyzing} onClick={submit}>
                {isAnalyzing ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Flame aria-hidden="true" className="size-4" />}
                Start Funding Grill
              </Button>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#7b736a]">
            <CheckCircle2 aria-hidden="true" className="size-3.5 text-[#37b26c]" />
            Deterministic rubric · no funding-probability claims
          </div>
        </section>
      </div>
    </GrillShell>
  );
}
