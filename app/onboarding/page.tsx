"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mic, CheckCircle2, LoaderCircle, PenIcon, Plus, User, Sparkles, FileText, Layout } from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";

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
      if (nextStep < 5) setStep(nextStep); // Don't hydrate back into processing step automatically
      else setStep(4);
      
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
    if (step !== 5) {
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
    if (step !== 5) return;
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
    setStep(5);
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
    setStep(5);
  }

  if (!hasHydrated) {
    return <main className="min-h-screen bg-[var(--bg)]" data-theme="app" />;
  }

  return (
    <main className="flex h-screen w-full overflow-hidden bg-white" data-theme="app">
      {/* Left Panel: Branding & Progress */}
      <div className="hidden lg:flex w-[440px] flex-col justify-between p-12 onboarding-gradient border-r border-black/[0.03]">
        <div className="flex flex-col gap-16">
          <BrandLockup />
          
          <div className="flex flex-col gap-8">
            <div className="text-[12px] font-bold text-black/30 uppercase tracking-[0.2em] mb-2">Step {step} of 4</div>
            <div className="flex flex-col gap-0 relative">
              {[
                { id: 1, title: "Founder Profile", desc: "Your background" },
                { id: 2, title: "Startup Pitch", desc: "Your vision" },
                { id: 3, title: "Documents", desc: "Your materials" },
                { id: 4, title: "Review & Confirm", desc: "Final check" }
              ].map((s, i) => {
                const isCurrent = step === s.id;
                const isPast = step > s.id;
                return (
                  <div key={s.id} className="relative flex items-start gap-5 pb-10 last:pb-0 group">
                    {i < 3 && (
                      <div className={`absolute left-[11px] top-7 w-[2px] h-[calc(100%-12px)] transition-colors duration-500 ${isPast ? "bg-black/20" : "bg-black/5"}`} />
                    )}
                    <div className={`relative z-10 flex size-6 items-center justify-center rounded-full border-2 transition-all duration-500 ${isCurrent ? "bg-black border-black scale-110 shadow-lg" : isPast ? "bg-black border-black" : "bg-white border-black/10"}`}>
                      {isPast ? <CheckCircle2 className="size-3.5 text-white" /> : <div className={`size-1.5 rounded-full ${isCurrent ? "bg-white" : "bg-black/20"}`} />}
                    </div>
                    <div className="flex flex-col -mt-0.5">
                      <div className={`text-[15px] font-bold tracking-tight transition-colors duration-300 ${isCurrent || isPast ? "text-black" : "text-black/30"}`}>{s.title}</div>
                      <div className={`text-[13px] font-medium transition-colors duration-300 ${isCurrent || isPast ? "text-black/40" : "text-black/20"}`}>{s.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="max-w-[280px]">
          <h2 className="text-[26px] font-medium leading-[1.2] tracking-[-0.03em] text-black">
            Get access to your personal hub for clarity and productivity.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-black/40">
            Fundme helps founders secure capital by automating the boring parts of the application process.
          </p>
        </div>
      </div>

      {/* Right Panel: Content */}
      <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="flex lg:hidden items-center justify-between px-6 py-4 border-b border-black/[0.03] bg-white/50 backdrop-blur-md sticky top-0 z-50">
          <BrandLockup size="sm" />
          <div className="text-[12px] font-bold text-[#ff6b3d]">STEP {step}/4</div>
        </div>

        <div className="flex-1 overflow-y-auto pt-16 pb-32 px-6 sm:px-12 xl:px-24">
          <div className="w-full max-w-[680px] mx-auto">
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
                  <h1 className="text-[42px] font-semibold tracking-[-0.04em] leading-[1.1] text-black">
                    Tell us about yourself
                  </h1>
                  <p className="text-[18px] text-black/50 mt-4 max-w-[480px]">
                    Let's start with your identity and background. We'll use this to personalize your experience.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  <Field>
                    <FieldLabel className="text-[13px] font-bold text-black uppercase tracking-wider mb-2.5">Full Name <span className="text-[#ff6b3d]">*</span></FieldLabel>
                    <Input 
                      className="h-12 rounded-[12px] bg-black/[0.02] border-black/5 focus:bg-white transition-all text-[16px]"
                      placeholder="e.g. Aakash Puri" 
                      onChange={(e) => setName(e.target.value)} 
                      value={name} 
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-[13px] font-bold text-black uppercase tracking-wider mb-2.5">Role</FieldLabel>
                    <Input 
                      className="h-12 rounded-[12px] bg-black/[0.02] border-black/5 focus:bg-white transition-all text-[16px]"
                      placeholder="e.g. CEO & Founder"
                      onChange={(e) => setRole(e.target.value)} 
                      value={role} 
                    />
                  </Field>
                  <Field className="md:col-span-2">
                    <FieldLabel className="text-[13px] font-bold text-black uppercase tracking-wider mb-2.5">LinkedIn URL</FieldLabel>
                    <Input 
                      className="h-12 rounded-[12px] bg-black/[0.02] border-black/5 focus:bg-white transition-all text-[16px]"
                      placeholder="https://linkedin.com/in/..."
                      onChange={(e) => setLinkedIn(e.target.value)} 
                      value={linkedIn} 
                    />
                  </Field>
                  <Field className="md:col-span-2">
                    <FieldLabel className="text-[13px] font-bold text-black uppercase tracking-wider mb-2.5">Company Name <span className="text-[#ff6b3d]">*</span></FieldLabel>
                    <Input 
                      className="h-12 rounded-[12px] bg-black/[0.02] border-black/5 focus:bg-white transition-all text-[16px]"
                      placeholder="e.g. Totem Interactive"
                      onChange={(e) => setCompanyName(e.target.value)} 
                      value={companyName} 
                    />
                  </Field>
                </div>

                <div className="rounded-[24px] bg-[#fff5f0] border border-[#ff6b3d]/10 p-8 relative overflow-hidden group hover:border-[#ff6b3d]/20 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                     <div className="flex-1">
                       <div className="text-[17px] font-semibold text-black">Autofill from LinkedIn</div>
                       <div className="text-[14px] text-black/50 mt-2 leading-relaxed max-w-[380px]">We'll fetch your education and work history to jumpstart your profile. Review and edit any time.</div>
                     </div>
                     <Button 
                       variant="primary" 
                       disabled={isImporting || hasImported} 
                       className="h-12 px-8 rounded-full shadow-lg shadow-[#ff6b3d]/10 hover:shadow-[#ff6b3d]/20 transition-all"
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
                        {isImporting ? <><LoaderCircle className="animate-spin size-4 mr-2" /> Importing...</> : hasImported ? "Successfully Imported ✓" : "Import Now"}
                     </Button>
                  </div>
                </div>                <AnimatePresence>
                {hasImported && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-12 mt-12 bg-black/[0.01] p-8 rounded-[32px] border border-black/5">
                     {/* Education Block */}
                     <div>
                       <div className="flex items-center justify-between mb-8">
                         <div className="text-[13px] font-bold text-black uppercase tracking-wider">Education</div>
                         <Button variant="subtle" size="sm" className="h-8 px-4 rounded-full border-black/5"><Plus className="size-3.5 mr-1.5"/> Add School</Button>
                       </div>
                       
                       <div className="flex flex-col gap-6">
                         {[
                           { name: "Thakur College of Science & Commerce", desc: "Bachelor's degree, Mass Communication", period: "Jan 2019 - Jan 2022" },
                           { name: "RD & SH National College", desc: "Arts & Media Management", period: "Jan 2017 - Jan 2019" }
                         ].map((edu) => (
                          <div key={edu.name} className="flex justify-between items-start group p-4 rounded-[16px] hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-black/5">
                            <div>
                              <div className="text-[15px] font-semibold text-black">{edu.name}</div>
                              <div className="text-[14px] text-black/40 mt-1">{edu.desc}</div>
                              <div className="text-[12px] text-black/30 mt-2 font-medium">{edu.period}</div>
                            </div>
                            <PenIcon className="size-4 text-black/20 hover:text-black cursor-pointer transition-colors" />
                          </div>
                         ))}
                       </div>
                     </div>

                     {/* Work History Block */}
                     <div>
                       <div className="flex items-center justify-between mb-8">
                         <div className="text-[13px] font-bold text-black uppercase tracking-wider">Experience</div>
                         <Button variant="subtle" size="sm" className="h-8 px-4 rounded-full border-black/5"><Plus className="size-3.5 mr-1.5"/> Add Role</Button>
                       </div>

                       <div className="flex flex-col gap-6">
                         <div className="flex flex-col group p-4 rounded-[16px] hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-black/5">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-[15px] font-semibold text-black">Totem Interactive</div>
                                <div className="text-[14px] text-[#ff6b3d] font-bold mt-0.5">Chief Executive Officer</div>
                              </div>
                              <PenIcon className="size-4 text-black/20 hover:text-black cursor-pointer transition-colors" />
                            </div>
                            <div className="text-[14px] text-black/40 leading-relaxed mt-4 line-clamp-2">Currently, here at Totem Interactive, we're building the future of founder productivity and AI development...</div>
                            <div className="text-[12px] text-black/30 mt-4 font-medium italic">Apr 2022 - Present</div>
                         </div>

                         <div className="flex flex-col group p-4 rounded-[16px] hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-black/5">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-[15px] font-semibold text-black">CrazyLabs</div>
                                <div className="text-[14px] text-[#ff6b3d] font-bold mt-0.5">2022 Batch of Crazy Hubs</div>
                              </div>
                              <PenIcon className="size-4 text-black/20 hover:text-black cursor-pointer transition-colors" />
                            </div>
                            <div className="text-[14px] text-black/40 leading-relaxed mt-4 line-clamp-2">The hubs gave my spontaneous burst of creativity the structure and understanding of what makes products stick...</div>
                            <div className="text-[12px] text-black/30 mt-4 font-medium italic">Jan 2023 - Nov 2023</div>
                         </div>
                       </div>
                     </div>
                  </motion.div>
                )}
               </AnimatePresence>
                
                <div className="flex justify-end pt-12 border-t border-black/5 mt-8">
                  <Button onClick={() => setStep(2)} size="lg" className="h-12 px-10 rounded-full" disabled={!name || !companyName}>
                    Continue <ArrowRight className="size-4 ml-2" />
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
                className="flex flex-col items-center justify-center text-center w-full min-h-[40vh]"
              >
                <div className="text-[12px] font-bold text-[#ff6b3d] uppercase tracking-[0.2em] mb-12">Startup Pitch</div>
                
                <button
                  className={`relative flex size-32 items-center justify-center rounded-full border transition-all duration-500 ${
                    listening
                      ? "border-[#ff6b3d] bg-[#ff6b3d] text-white shadow-[0_0_0_20px_rgba(255,107,61,0.1)] scale-110"
                      : "border-black/5 bg-black/[0.02] text-black hover:scale-105 hover:bg-black/[0.04]"
                  }`}
                  onClick={handleListen}
                  type="button"
                >
                  {listening && (
                    <div className="absolute inset-[-30px] flex items-center justify-center gap-[4px] opacity-80">
                      {Array.from({ length: 16 }).map((_, index) => {
                         const h = 12 + Math.random() * 32;
                         return (
                          <motion.span
                            key={index}
                            className="w-[3px] rounded-full bg-white"
                            animate={{ height: [`${h}px`, `${h * 1.8}px`, `${h}px`] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.05, ease: "easeInOut" }}
                          />
                         )
                      })}
                    </div>
                  )}
                  <Mic className={`relative z-10 ${listening ? "size-14" : "size-12 opacity-40"}`} />
                </button>

                <div className="mt-16">
                  <h1 className="text-[36px] sm:text-[48px] font-semibold tracking-[-0.04em] leading-tight text-black">
                    Tap to speak and <br/>describe it naturally
                  </h1>
                  <p className="mt-6 text-[18px] text-black/40 max-w-[480px] mx-auto">
                    Just tell us what you're building, the problem you're solving, and why it matters. We'll handle the rest.
                  </p>
                </div>

                <div className="mt-10 flex flex-col items-center gap-4">
                  <button 
                    className="text-[15px] text-[#ff6b3d] hover:underline font-semibold" 
                    onClick={() => setTypedOpen(true)} 
                    type="button"
                  >
                    prefer to type →
                  </button>
                  
                  {doneFlash && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[14px] font-bold text-[#22c55e] flex items-center gap-2 bg-[#f0fdf4] px-4 py-2 rounded-full border border-[#22c55e]/10"
                    >
                      <CheckCircle2 className="size-4" /> Captured your thoughts
                    </motion.div>
                  )}
                </div>

                {typedOpen && (
                  <motion.div animate={{ opacity: 1, y: 0 }} className="mt-12 w-full text-left" initial={{ opacity: 0, y: 32 }}>
                    <Textarea
                      className="min-h-[220px] text-[17px] rounded-[16px] bg-black/[0.02] border-black/5 focus:bg-white p-6 leading-relaxed"
                      placeholder="I'm building a platform that..."
                      onChange={(event) => setNotes(event.target.value)}
                      value={notes}
                    />
                  </motion.div>
                )}
                
                <div className="flex justify-between items-center w-full mt-24 pt-8 border-t border-black/5">
                   <button
                     className="text-[15px] font-bold text-black/30 hover:text-black transition-colors"
                     onClick={() => setStep(1)}
                     type="button"
                   >
                     ← Go Back
                   </button>
                   <Button onClick={() => setStep(3)} size="lg" className="h-12 px-10 rounded-full" disabled={!notes && !listening}>
                     Continue <ArrowRight className="size-4 ml-2" />
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
                className="flex flex-col gap-10 w-full"
              >
                <div>
                  <h1 className="text-[42px] font-semibold tracking-[-0.04em] leading-[1.1] text-black">
                    Upload your materials
                  </h1>
                  <p className="text-[18px] text-black/50 mt-4 max-w-[480px]">
                    Add your pitch deck, memo, or previous application answers to help the AI understand your roadmap.
                  </p>
                </div>

                <div className="mt-4 bg-black/[0.01] rounded-[32px] p-2 border border-black/5">
                   <FileUploadArea files={files} onChange={setFiles} />
                </div>

                <div className="flex justify-between items-center mt-12 pt-8 border-t border-black/5">
                   <button
                     className="text-[15px] font-bold text-black/30 hover:text-black transition-colors"
                     onClick={() => setStep(2)}
                     type="button"
                   >
                     ← Go Back
                   </button>
                   <Button onClick={() => setStep(4)} size="lg" className="h-12 px-10 rounded-full">
                     {files.length > 0 ? "Review Everything" : "Skip for Now"} <ArrowRight className="size-4 ml-2" />
                   </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-10 w-full"
              >
                <div>
                  <h1 className="text-[42px] font-semibold tracking-[-0.04em] leading-[1.1] text-black">
                    Review and Confirm
                  </h1>
                  <p className="text-[18px] text-black/50 mt-4 max-w-[480px]">
                    Check your details before we start finding yours matches.
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                  <div className="p-6 rounded-[24px] bg-black/[0.02] border border-black/5 flex items-center justify-between group hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-[16px] bg-[#fff5f0] border border-[#ff6b3d]/10 flex items-center justify-center text-[#ff6b3d]">
                        <User className="size-6" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-black/30 uppercase tracking-tighter">Founder Profile</div>
                        <div className="text-[17px] font-semibold text-black">{name || "Aakash Puri"}</div>
                      </div>
                    </div>
                    <PenIcon className="size-4 text-black/20 group-hover:text-black cursor-pointer" onClick={() => setStep(1)} />
                  </div>

                  <div className="p-6 rounded-[24px] bg-black/[0.02] border border-black/5 flex items-center justify-between group hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-[16px] bg-[#f5f0ff] border border-purple-500/10 flex items-center justify-center text-purple-600">
                        <Sparkles className="size-6" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-black/30 uppercase tracking-tighter">Startup Pitch</div>
                        <div className="text-[17px] font-semibold text-black line-clamp-1 max-w-[300px]">{notes || "Captured pitch description..."}</div>
                      </div>
                    </div>
                    <PenIcon className="size-4 text-black/20 group-hover:text-black cursor-pointer" onClick={() => setStep(2)} />
                  </div>

                  <div className="p-6 rounded-[24px] bg-black/[0.02] border border-black/5 flex items-center justify-between group hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-[16px] bg-[#f0f7ff] border border-blue-500/10 flex items-center justify-center text-blue-600">
                        <FileText className="size-6" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-black/30 uppercase tracking-tighter">Documents</div>
                        <div className="text-[17px] font-semibold text-black">{files.length} material{files.length !== 1 ? "s" : ""} uploaded</div>
                      </div>
                    </div>
                    <PenIcon className="size-4 text-black/20 group-hover:text-black cursor-pointer" onClick={() => setStep(3)} />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-12 pt-8 border-t border-black/5">
                   <button
                     className="text-[15px] font-bold text-black/30 hover:text-black transition-colors"
                     onClick={() => setStep(3)}
                     type="button"
                   >
                     ← Go Back
                   </button>
                   <Button onClick={finishOnboarding} size="lg" className="h-14 px-12 rounded-full text-[16px] font-bold bg-[#ff6b3d] shadow-xl shadow-[#ff6b3d]/20">
                     Confirm and Submit
                   </Button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="text-center mb-16">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff5f0] border border-[#ff6b3d]/10 text-[#ff6b3d] text-[12px] font-bold uppercase tracking-wider mb-6"
                    >
                      <LoaderCircle className="size-3 animate-spin" /> Processing
                    </motion.div>
                    <motion.h1 
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="text-[48px] font-semibold tracking-[-0.04em] leading-tight text-black max-w-[500px] mx-auto"
                    >
                      Finding where you belong...
                    </motion.h1>
                </div>

                <div className="w-full max-w-[440px] flex flex-col gap-3">
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
                           className={`flex items-center gap-4 rounded-[20px] border p-4 transition-all duration-300 ${active ? "bg-white shadow-lg border-black/5 scale-[1.02] z-10" : done ? "bg-black/[0.02] border-transparent opacity-60" : "bg-transparent border-black/5 opacity-30"}`}
                         >
                           {done ? (
                             <div className="flex size-[26px] items-center justify-center rounded-full bg-[#22c55e] text-white">
                               <CheckCircle2 className="size-3.5" />
                             </div>
                           ) : active ? (
                             <div className="flex size-[26px] items-center justify-center rounded-full border-2 border-[#ff6b3d] border-t-transparent animate-spin" />
                           ) : (
                             <div className="flex size-[26px] items-center justify-center rounded-full border border-black/10">
                               <span className="size-1.5 rounded-full bg-black/10" />
                             </div>
                           )}
                           <span className="text-[15px] font-semibold text-black tracking-tight">{text}</span>
                         </motion.div>
                      )
                   })}
                 </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
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
