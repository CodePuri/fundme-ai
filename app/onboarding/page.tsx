"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mic, CheckCircle2, LoaderCircle, PenIcon, Plus } from "lucide-react";

import {
  ONBOARDING_DRAFT_KEY,
  ONBOARDING_STEP_KEY,
  useDemo,
} from "@/components/app/demo-provider";
import { TopNavbar } from "@/components/app/top-navbar";
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
  imported?: boolean;
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

  const [hasImported, setHasImported] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [elapsed, setElapsed] = useState(0);

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
    let nextImported = false;

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
        if (parsed.imported) nextImported = parsed.imported;
      } catch {
        window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
      }
    }

    startTransition(() => {
      if (nextStep < 4) setStep(nextStep); // Don't hydrate back into processing step automatically
      else setStep(3);
      
      setName(nextName);
      setRole(nextRole);
      setCompanyName(nextCompanyName);
      setLinkedIn(nextLinkedIn);
      setNotes(nextNotes);
      setFiles(nextFiles);
      setTypedOpen(nextTypedOpen);
      setHasImported(nextImported);
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
        imported: hasImported
      })
    );
  }, [hasHydrated, name, role, companyName, linkedIn, notes, files, hasImported]);

  // Step 4 Inline processing timer
  useEffect(() => {
    if (step !== 4) {
      setElapsed(0);
      return;
    }
    const timer = window.setInterval(() => {
      setElapsed((current) => {
        const next = current + 100;
        if (next >= 5000) {
          window.clearInterval(timer);
          return 5000;
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step !== 4) return;
    if (elapsed >= 5000) {
      const t = setTimeout(() => {
        router.push("/app/matches");
      }, 500);
      return () => clearTimeout(t);
    }
  }, [step, elapsed, router]);

  async function handleListen() {
    if (listening) return;

    setListening(true);
    setTypedOpen(false);
    await new Promise((resolve) => setTimeout(resolve, 6000));
    setTypedOpen(true);
    let typed = "";
    for (const character of rambleText) {
      typed += character;
      setNotes(typed);
      await new Promise((resolve) => setTimeout(resolve, 20));
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
    setStep(4);
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
  }

  if (!hasHydrated) {
    return <main className="min-h-screen bg-[var(--bg)]" data-theme="app" />;
  }

  return (
    <main className="flex flex-col min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)]" data-theme="app">
      <TopNavbar hideSidebarToggle />

      <div className="flex flex-1 flex-col items-center justify-start p-6 sm:p-12 pb-24 relative overflow-y-auto">
        <div className="w-full max-w-[640px] mx-auto relative pt-8 md:pt-16">
          
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
                    Let's start with your identity and background.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field>
                    <FieldLabel>Full Name <span className="text-red-500">*</span></FieldLabel>
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
                  <Field className="md:col-span-2">
                    <FieldLabel>LinkedIn URL</FieldLabel>
                    <Input 
                      placeholder="https://linkedin.com/in/..."
                      onChange={(e) => setLinkedIn(e.target.value)} 
                      value={linkedIn} 
                    />
                  </Field>
                  <Field className="md:col-span-2">
                    <FieldLabel>Company Name <span className="text-red-500">*</span></FieldLabel>
                    <Input 
                      placeholder="e.g. Totem Interactive"
                      onChange={(e) => setCompanyName(e.target.value)} 
                      value={companyName} 
                    />
                  </Field>
                </div>

                <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-elevated)] p-6 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div>
                       <div className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Autofill your background with LinkedIn</div>
                       <div className="text-[13px] text-[var(--text-muted)] mt-1.5 leading-relaxed md:max-w-[340px]">The import may take a few seconds to populate and could have missing data. Please review the results and make any necessary edits.</div>
                     </div>
                     <Button 
                       variant="secondary" 
                       disabled={isImporting || hasImported} 
                       className="whitespace-nowrap"
                       onClick={async () => {
                         setIsImporting(true);
                         await new Promise(r => setTimeout(r, 2000));
                         setIsImporting(false);
                         setHasImported(true);
                         setName("Aakash Puri");
                         setRole("CEO & Founder");
                         setCompanyName("Totem Interactive");
                         setLinkedIn("https://www.linkedin.com/in/aakash-puri-a44aa594/");
                       }}
                     >
                        {isImporting ? <><LoaderCircle className="animate-spin size-4 mr-2" /> Importing...</> : hasImported ? "Imported ✓" : "Import from LinkedIn"}
                     </Button>
                  </div>
                </div>

                <AnimatePresence>
                {hasImported && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col gap-10">
                     {/* Education Block */}
                     <div>
                       <div className="flex items-center justify-between mb-5 border-b border-[var(--border)] pb-3">
                         <div className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)] uppercase">Education <span className="text-red-500">*</span></div>
                         <Button variant="ghost" size="sm" className="h-7 text-[12px]"><Plus className="size-3 mr-1"/> Add</Button>
                       </div>
                       
                       <div className="flex flex-col gap-5">
                         <div className="flex justify-between items-start group">
                           <div>
                             <div className="text-[14px] font-medium text-[var(--text-primary)]">Thakur College of Science & Commerce</div>
                             <div className="text-[13px] text-[var(--text-muted)] mt-0.5">Bachelor's degree, Mass Communication</div>
                           </div>
                           <div className="flex items-center gap-3">
                             <span className="text-[13px] text-[var(--text-muted)] whitespace-nowrap">Jan 2019 - Jan 2022</span>
                             <PenIcon className="size-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors" />
                           </div>
                         </div>

                         <div className="flex justify-between items-start group">
                           <div>
                             <div className="text-[14px] font-medium text-[var(--text-primary)]">RD & SH National College</div>
                             <div className="text-[13px] text-[var(--text-muted)] mt-0.5">Arts & Media Management</div>
                           </div>
                           <div className="flex items-center gap-3">
                             <span className="text-[13px] text-[var(--text-muted)] whitespace-nowrap">Jan 2017 - Jan 2019</span>
                             <PenIcon className="size-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors" />
                           </div>
                         </div>

                         <div className="flex justify-between items-start group">
                           <div>
                             <div className="text-[14px] font-medium text-[var(--text-primary)]">Pinnacle High International School</div>
                             <div className="text-[13px] text-[var(--text-muted)] mt-0.5">IGCSE</div>
                           </div>
                           <div className="flex items-center gap-3">
                             <span className="text-[13px] text-[var(--text-muted)] whitespace-nowrap">Jan 2012 - Jan 2018</span>
                             <PenIcon className="size-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors" />
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Work History Block */}
                     <div>
                       <div className="flex items-center justify-between mb-5 border-b border-[var(--border)] pb-3">
                         <div className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)] uppercase">Work History <span className="text-red-500">*</span></div>
                         <Button variant="ghost" size="sm" className="h-7 text-[12px]"><Plus className="size-3 mr-1"/> Add</Button>
                       </div>

                       <div className="flex flex-col gap-6">
                         <div className="flex flex-col md:flex-row md:justify-between md:items-start group gap-2">
                           <div className="max-w-[440px]">
                             <div className="text-[14px] font-medium text-[var(--text-primary)]">Totem Interactive - Chief Executive Officer</div>
                             <div className="text-[13px] text-[var(--text-muted)] leading-relaxed mt-2">Currently, here at Totem Interactive, we're on to solving real world problems and are our way to empower businesses and creators with innovative app development and web solutions using our rich experience...</div>
                           </div>
                           <div className="flex items-center gap-3 md:pt-0 pt-2">
                             <span className="text-[13px] text-[var(--text-muted)] whitespace-nowrap">Apr 2022 - Present</span>
                             <PenIcon className="size-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors" />
                           </div>
                         </div>

                         <div className="flex flex-col md:flex-row md:justify-between md:items-start group gap-2">
                           <div className="max-w-[440px]">
                             <div className="text-[14px] font-medium text-[var(--text-primary)]">CrazyLabs - 2022 Batch of Crazy Hubs</div>
                             <div className="text-[13px] text-[var(--text-muted)] leading-relaxed mt-2">The hubs gave my spontaneous burst of creativity the structure and understanding of what makes games truly fun. Tested and deployed multiple Hyper-casual prototypes with them...</div>
                           </div>
                           <div className="flex items-center gap-3 md:pt-0 pt-2">
                             <span className="text-[13px] text-[var(--text-muted)] whitespace-nowrap">Jan 2023 - Nov 2023</span>
                             <PenIcon className="size-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors" />
                           </div>
                         </div>

                         <div className="flex flex-col md:flex-row md:justify-between md:items-start group gap-2">
                           <div className="max-w-[440px]">
                             <div className="text-[14px] font-medium text-[var(--text-primary)]">Self-employed - Independent Filmmaker</div>
                           </div>
                           <div className="flex items-center gap-3">
                             <span className="text-[13px] text-[var(--text-muted)] whitespace-nowrap">Aug 2019 - Aug 2021</span>
                             <PenIcon className="size-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors" />
                           </div>
                         </div>
                       </div>
                     </div>
                  </motion.div>
                )}
               </AnimatePresence>
                
                <div className="flex justify-end pt-8 border-t border-[var(--border)] mt-4">
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
                className="flex flex-col items-center justify-center text-center w-full min-h-[500px]"
              >
                <div className="eyebrow mb-8">What are you building?</div>
                <button
                  className={`relative flex size-28 items-center justify-center rounded-full border ${
                    listening
                      ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg)] shadow-[0_0_0_12px_color-mix(in_srgb,var(--text-primary)_5%,transparent)]"
                      : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-md hover:border-[var(--border-strong)] hover:shadow-lg transition-all"
                  } duration-500`}
                  onClick={handleListen}
                  type="button"
                >
                  {listening && (
                    <div className="absolute inset-[-20px] flex items-center justify-center gap-[4px] opacity-80">
                      {Array.from({ length: 12 }).map((_, index) => {
                         const h = 10 + Math.random() * 24;
                         return (
                          <motion.span
                            key={index}
                            className="w-[3px] rounded-full bg-[var(--bg)]"
                            animate={{ height: [`${h}px`, `${h * 1.8}px`, `${h}px`] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.05, ease: "easeInOut" }}
                          />
                         )
                      })}
                    </div>
                  )}
                  <Mic className="relative z-10 size-12" />
                </button>
                <div className="mt-10 text-[32px] sm:text-[40px] font-semibold tracking-[-0.04em] leading-tight">
                  Tap to speak and <br/>describe it naturally
                </div>
                <button 
                  className="mt-6 text-[15px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] font-medium" 
                  onClick={() => setTypedOpen(true)} 
                  type="button"
                >
                  prefer to type →
                </button>
                
                {doneFlash && <div className="mt-8 text-[15px] font-semibold tracking-wide uppercase text-[var(--accent-green)] flex items-center gap-2"><CheckCircle2 className="size-4" /> Captured</div>}

                {typedOpen && (
                  <motion.div animate={{ opacity: 1, y: 0 }} className="mt-12 w-full text-left" initial={{ opacity: 0, y: 24 }}>
                    <Textarea
                      className="min-h-[160px] text-[16px] resize-none"
                      placeholder="Start typing your startup pitch..."
                      onChange={(event) => setNotes(event.target.value)}
                      value={notes}
                    />
                  </motion.div>
                )}
                
                <div className="flex justify-between items-center w-full mt-16 pt-6 border-t border-[var(--border)]">
                   <button
                     className="text-[14px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
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
                    Add your deck, memo, or previous application answers from your files.
                  </p>
                </div>

                <div className="mt-4">
                   <FileUploadArea files={files} onChange={setFiles} />
                </div>

                <div className="flex justify-between items-center mt-10 pt-6 border-t border-[var(--border)]">
                   <button
                     className="text-[14px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center fixed inset-0 z-50 bg-[var(--bg)]"
              >
                <div className="absolute inset-x-0 top-[73px] z-20 h-0.5 bg-[var(--border)]">
                   <motion.div animate={{ width: `${(elapsed / 5000) * 100}%` }} className="h-full bg-[var(--accent-amber)]" initial={{ width: 0 }} />
                </div>

                <div className="text-center mb-12 w-full">
                    <motion.h1 
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="text-[40px] sm:text-[52px] font-semibold tracking-tight leading-none"
                    >
                      Finding where you belong...
                    </motion.h1>
                </div>

                <div className="w-full max-w-[500px] flex flex-col gap-3 px-6">
                   {[
                     "Analyzing your startup", 
                     "Understanding your materials", 
                     "Preparing your founder profile", 
                     "Finding the right startup programs"
                   ].map((text, i) => {
                      const activeIndex = Math.min(3, Math.floor(elapsed / 1250));
                      const done = i < activeIndex || elapsed >= 5000;
                      const active = i === activeIndex && elapsed < 5000;
                      return (
                         <motion.div 
                           initial={{ opacity: 0, scale: 0.96 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: i * 0.1 }}
                           key={text} 
                           className="flex items-center gap-4 rounded-[12px] border border-[var(--border)] bg-[var(--surface-elevated)] p-4 shadow-sm"
                         >
                           {done ? (
                             <div className="flex size-[26px] items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--bg)] shadow-sm">
                               <CheckCircle2 className="size-3.5" />
                             </div>
                           ) : active ? (
                             <div className="flex size-[26px] items-center justify-center rounded-full border border-[var(--border-strong)]">
                               <LoaderCircle className="size-3.5 animate-spin text-[var(--text-primary)]" />
                             </div>
                           ) : (
                             <div className="flex size-[26px] items-center justify-center rounded-full border border-[var(--border)]">
                               <span className="size-1.5 rounded-full bg-[var(--text-muted)]" />
                             </div>
                           )}
                           <span className={done || active ? "text-[14px] text-[var(--text-primary)] font-medium tracking-tight" : "text-[14px] text-[var(--text-muted)] tracking-tight"}>{text}</span>
                         </motion.div>
                      )
                   })}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {step < 4 && (
          <div className="fixed bottom-6 right-8 opacity-40 hover:opacity-100 transition-opacity z-50">
             <button 
               onClick={handleSkipToDemo}
               className="text-[12px] font-medium tracking-wider uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--surface)] px-3 py-1.5 rounded-full border border-[var(--border)]"
             >
               Skip
             </button>
          </div>
        )}
      </div>
    </main>
  );
}
