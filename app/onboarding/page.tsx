"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mic, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import {
  ONBOARDING_DRAFT_KEY,
  ONBOARDING_STEP_KEY,
  useDemo,
} from "@/components/app/demo-provider";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadArea } from "@/components/ui/file-upload";

const rambleText =
  "Totem Interactive is a Mumbai-based software development company building products across AI, apps, platforms, games, AR/VR, and digital solutions. Makers of Velocity, an AI prompt-improvement product. Founded in 2022.";

type OnboardingDraft = {
  step?: number;
  name?: string;
  role?: string;
  companyName?: string;
  linkedIn?: string;
  notes?: string;
  files?: string[];
};

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useDemo();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [step, setStep] = useState(1);

  // Default seeded
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [linkedIn, setLinkedIn] = useState("");

  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  
  const [listening, setListening] = useState(false);
  const [typedOpen, setTypedOpen] = useState(false);
  const [doneFlash, setDoneFlash] = useState(false);

  useEffect(() => {
    const savedStep = window.localStorage.getItem(ONBOARDING_STEP_KEY);
    const savedDraft = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);
    
    let nextName = "";
    let nextRole = "";
    let nextCompanyName = "";
    let nextLinkedIn = "";
    let nextNotes = "";
    let nextFiles: string[] = [];
    let nextStep = 1;
    let nextTypedOpen = false;

    if (savedStep && parseInt(savedStep) > 1 && parseInt(savedStep) <= 4) {
      nextStep = Number(savedStep);
    }

    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as OnboardingDraft;
        if (parsed.name) nextName = parsed.name;
        if (parsed.role) nextRole = parsed.role;
        if (parsed.companyName) nextCompanyName = parsed.companyName;
        if (parsed.linkedIn) nextLinkedIn = parsed.linkedIn;
        if (parsed.notes) {
          nextNotes = parsed.notes;
          nextTypedOpen = true;
        }
        if (parsed.files) nextFiles = parsed.files;
      } catch {
        window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
      }
    }

    startTransition(() => {
      setStep(nextStep);
      setName(nextName);
      setRole(nextRole);
      setCompanyName(nextCompanyName);
      setLinkedIn(nextLinkedIn);
      setNotes(nextNotes);
      setFiles(nextFiles);
      setTypedOpen(nextTypedOpen);
      setHasHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (step >= 1 && step <= 3) {
      window.localStorage.setItem(ONBOARDING_STEP_KEY, String(step));
    } else {
      window.localStorage.removeItem(ONBOARDING_STEP_KEY);
    }
  }, [hasHydrated, step]);

  useEffect(() => {
    if (!hasHydrated) return;

    window.localStorage.setItem(
      ONBOARDING_DRAFT_KEY,
      JSON.stringify({
        name,
        role,
        companyName,
        linkedIn,
        notes,
        files,
      }),
    );
  }, [hasHydrated, name, role, companyName, linkedIn, notes, files]);

  async function handleListen() {
    if (listening) return;

    setListening(true);
    setTypedOpen(false);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setTypedOpen(true);
    let typed = "";
    for (const character of rambleText) {
      typed += character;
      setNotes(typed);
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
    setListening(false);
    setDoneFlash(true);
    window.setTimeout(() => setDoneFlash(false), 1200);
  }

  function handleSkipToDemo() {
    completeOnboarding({
      founderName: "Aakash Puri",
      founderRole: "CEO & Founder",
      companyName: "Totem Interactive",
      linkedIn: "https://www.linkedin.com/in/aakash-puri-a44aa594/",
      notes: rambleText,
      files: ["totem_interactive_deck.pdf", "velocity_memo.docx"],
    });
    router.push("/processing");
  }

  function finishOnboarding() {
    completeOnboarding({
      founderName: name || "Aakash Puri",
      founderRole: role || "CEO & Founder",
      companyName: companyName || "Totem Interactive",
      linkedIn: linkedIn || "https://www.linkedin.com/in/aakash-puri-a44aa594/",
      notes: notes || rambleText,
      files,
    });
    setStep(4);
    setTimeout(() => {
      router.push("/processing");
    }, 1500);
  }

  if (!hasHydrated) {
    return <main className="min-h-screen bg-[var(--surface)]" />;
  }

  const steps = [
    { num: 1, title: "Your details" },
    { num: 2, title: "Company details" },
    { num: 3, title: "Upload materials" },
  ];

  return (
    <main className="flex min-h-screen w-full bg-[var(--surface)] text-[var(--text-primary)]" data-theme="app">
      
      {/* LEFT PANE - Branding and Progress */}
      <div className="hidden w-1/3 flex-col bg-[var(--bg)] border-r border-[var(--border)] p-10 lg:flex relative">
        <Link className="flex items-center gap-2 mb-16" href="/">
          <div className="flex size-7 items-center justify-center rounded-[8px] bg-[var(--text-primary)] text-[var(--bg)]">
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                d="M12 2L2 22h20L12 2zm0 6l5 10h-10l5-10z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
            Fundme.ai
          </span>
        </Link>

        <div className="flex-1">
          <div className="text-[28px] font-semibold tracking-[-0.03em] mb-8">
            Tell us about your startup.
          </div>
          <div className="flex flex-col gap-6">
            {steps.map((s) => {
              const isActive = step === s.num;
              const isPast = step > s.num;
              return (
                <div key={s.num} className="flex items-center gap-4">
                  <div className={`flex size-8 items-center justify-center rounded-full border text-[14px] font-medium transition-colors ${isActive ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg)]' : isPast ? 'border-[var(--text-primary)] bg-transparent text-[var(--text-primary)]' : 'border-[var(--border-strong)] bg-transparent text-[var(--text-muted)]'}`}>
                    {isPast ? <CheckCircle2 className="size-5" /> : s.num}
                  </div>
                  <div className={`text-[15px] transition-colors ${isActive || isPast ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'}`}>
                    {s.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-[var(--border)]">
           <button 
             onClick={handleSkipToDemo}
             className="text-[14px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2"
           >
             Skip / Use Demo Data <ArrowRight className="size-3" />
           </button>
        </div>
      </div>

      {/* RIGHT PANE - Interaction */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12 pb-24 relative overflow-y-auto">
        <div className="w-full max-w-[560px] mx-auto relative pt-12 md:pt-0">
          
          {/* Mobile Header / Progress Context */}
          <div className="lg:hidden flex items-center justify-between mb-12">
            <Link className="flex items-center gap-2" href="/">
              <div className="flex size-6 items-center justify-center rounded-[6px] bg-[var(--text-primary)] text-[var(--bg)]">
                <svg className="size-3" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 6l5 10h-10l5-10z" fill="currentColor" /></svg>
              </div>
              <span className="text-[14px] font-bold">Fundme.ai</span>
            </Link>
            <div className="text-[13px] text-[var(--text-muted)] font-medium">Step {step} of 3</div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <h1 className="text-[32px] sm:text-[40px] font-semibold tracking-[-0.04em] leading-tight mb-3">
                    Tell us about yourself
                  </h1>
                  <p className="text-[16px] text-[var(--text-muted)]">
                    Let's start with your identity and role.
                  </p>
                </div>
                
                <div className="flex flex-col gap-5">
                  <Field>
                    <FieldLabel>Full Name</FieldLabel>
                    <Input 
                      placeholder="e.g. Aakash Puri" 
                      onChange={(e) => setName(e.target.value)} 
                      value={name} 
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Role</FieldLabel>
                    <Input 
                      placeholder="e.g. CEO & Founder"
                      onChange={(e) => setRole(e.target.value)} 
                      value={role} 
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Company Name</FieldLabel>
                    <Input 
                      placeholder="e.g. Totem Interactive"
                      onChange={(e) => setCompanyName(e.target.value)} 
                      value={companyName} 
                    />
                  </Field>
                  <Field>
                    <FieldLabel>LinkedIn URL</FieldLabel>
                    <Input 
                      placeholder="https://linkedin.com/in/..."
                      onChange={(e) => setLinkedIn(e.target.value)} 
                      value={linkedIn} 
                    />
                  </Field>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setStep(2)} size="lg" disabled={!name || !companyName}>
                    Continue <ArrowRight className="size-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center text-center w-full"
              >
                <div className="eyebrow mb-6">What are you building?</div>
                <button
                  className={`relative flex size-24 items-center justify-center rounded-full border ${
                    listening
                      ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg)] shadow-[0_0_0_12px_color-mix(in_srgb,var(--text-primary)_5%,transparent)]"
                      : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-sm hover:border-[var(--border-strong)]"
                  } transition-all duration-300`}
                  onClick={handleListen}
                  type="button"
                >
                  {listening && (
                    <div className="absolute inset-[-14px] flex items-center justify-center gap-1.5">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <span
                          className="w-1.5 animate-pulse rounded-full bg-white/60"
                          key={index}
                          style={{ height: `${12 + (index % 4) * 8}px`, animationDelay: `${index * 80}ms` }}
                        />
                      ))}
                    </div>
                  )}
                  <Mic className="relative z-10 size-10" />
                </button>
                <div className="mt-8 text-[32px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-tight">
                  Tap to speak and describe it naturally
                </div>
                <button 
                  className="mt-4 text-[15px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]" 
                  onClick={() => setTypedOpen(true)} 
                  type="button"
                >
                  prefer to type →
                </button>
                
                {doneFlash && <div className="mt-6 text-[15px] font-medium text-[var(--accent-green)]">Got it ✓</div>}

                {typedOpen && (
                  <motion.div animate={{ opacity: 1, y: 0 }} className="mt-10 w-full text-left" initial={{ opacity: 0, y: 24 }}>
                    <Textarea
                      className="min-h-[200px] text-[16px]"
                      placeholder="Start typing your startup pitch..."
                      onChange={(event) => setNotes(event.target.value)}
                      value={notes}
                    />
                  </motion.div>
                )}
                
                <div className="flex justify-between items-center w-full mt-10 pt-6 border-t border-[var(--border)]">
                   <button
                     className="text-[14px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                     onClick={() => setStep(1)}
                     type="button"
                   >
                     ← Back
                   </button>
                   <Button onClick={() => setStep(3)} size="lg" disabled={!notes && !listening}>
                     Continue <ArrowRight className="size-4 ml-1" />
                   </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-8 w-full"
              >
                <div>
                  <h1 className="text-[32px] sm:text-[40px] font-semibold tracking-[-0.04em] leading-tight mb-3">
                    Upload your materials
                  </h1>
                  <p className="text-[16px] text-[var(--text-muted)]">
                    Add your deck, memo, or previous application answers to help us understand you better. (Optional)
                  </p>
                </div>

                <FileUploadArea files={files} onChange={setFiles} />

                <div className="flex justify-between items-center mt-4 pt-6 border-t border-[var(--border)]">
                   <button
                     className="text-[14px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                     onClick={() => setStep(2)}
                     type="button"
                   >
                     ← Back
                   </button>
                   <Button onClick={finishOnboarding} size="lg">
                     {files.length > 0 ? "Complete & Process" : "Skip & Continue"} <ArrowRight className="size-4 ml-1" />
                   </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center space-y-6 pt-12"
              >
                <div className="relative size-16">
                  <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]" />
                  <div className="absolute inset-0 rounded-full border-4 border-[var(--text-primary)] border-t-transparent animate-spin" />
                </div>
                <div>
                  <div className="text-[24px] font-semibold tracking-tight">Processing your profile...</div>
                  <div className="text-[var(--text-muted)] mt-2">Uploading materials and preparing context</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Mobile Skip Demo Data */}
        <div className="lg:hidden absolute bottom-6 w-full flex justify-center">
            <button 
              onClick={handleSkipToDemo}
              className="text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Skip / Use Demo Data
            </button>
        </div>
      </div>
    </main>
  );
}
