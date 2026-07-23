"use client";

import { startTransition, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mic, CheckCircle2, LoaderCircle, PenIcon, User, Sparkles, FileText } from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";

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
import { mapOnboardingToAssessment } from "@/components/assessment/onboarding-bridge";
import { PhoneInputField, PhoneData } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";

const defaultPitchText =
  "Building an automated platform that helps founders prepare institutional-grade application materials and securely manage funding intake rounds efficiently.";

type OnboardingDraft = {
  step?: number;
  name?: string;
  role?: string;
  companyName?: string;
  email?: string;
  linkedIn?: string;
  websiteUrl?: string;
  xUrl?: string;
  notes?: string;
  files?: string[];
  imported?: boolean;
  phone?: string;
  phoneData?: PhoneData | null;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { completeOnboarding } = useDemo();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [fileMeta, setFileMeta] = useState<{name: string; size: number; type: string}[]>([]);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [phoneData, setPhoneData] = useState<PhoneData | null>(null);
  
  // Voice feature state
  const [listening, setListening] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "processing" | "captured">("idle");
  const [voiceErrorText, setVoiceErrorText] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const recognitionTimeoutRef = useRef<number | null>(null);
  const baseNotesRef = useRef<string>("");
  const isManualStopRef = useRef<boolean>(false); // Track absolute termination intent
  const notesRef = useRef<string>(notes);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const [hasImported, setHasImported] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Derived first name with robust regex sanitization
  const derivedFirstName = useMemo(() => {
    if (!name.trim()) return "";
    const cleaned = name.trim().replace(/[^a-zA-Z\s]/g, "");
    const first = cleaned.split(/\s+/)[0];
    if (!first || first.length < 2 || first.toLowerCase() === "validation" || first.toLowerCase() === "tester") {
      return "";
    }
    return first;
  }, [name]);

  // Letter count validator (35 to 500 letters)
  const letterCount = useMemo(() => {
    return notes ? notes.length : 0;
  }, [notes]);

  // Step 1 Validation checks
  const isEmailValid = useMemo(() => {
    if (!email.trim()) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const isWebsiteValid = useMemo(() => {
    if (!websiteUrl.trim()) return true;
    return /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/.test(websiteUrl.trim().replace(/^https?:\/\//, ''));
  }, [websiteUrl]);

  const isLinkedInValid = useMemo(() => {
    if (!linkedIn.trim()) return true;
    return linkedIn.toLowerCase().includes("linkedin.com");
  }, [linkedIn]);

  const isXValid = useMemo(() => {
    if (!xUrl.trim()) return true;
    const lower = xUrl.toLowerCase();
    return lower.includes("x.com") || lower.includes("twitter.com");
  }, [xUrl]);

  const isPhoneValid = useMemo(() => {
    if (!phone) return false;
    return isValidPhoneNumber(phone);
  }, [phone]);

  const isStep1Valid = useMemo(() => {
    return (
      name.trim().length > 0 &&
      role.trim().length > 0 &&
      companyName.trim().length > 0 &&
      isEmailValid &&
      isWebsiteValid &&
      isLinkedInValid &&
      isXValid &&
      isPhoneValid
    );
  }, [name, role, companyName, isEmailValid, isWebsiteValid, isLinkedInValid, isXValid, isPhoneValid]);

  const placeholderText = "Describe your idea naturally.\nWhat problem are you solving?\nWho is it for?\nWhy you?\nWhy now?";

  // Redirect already-submitted users straight to /thank-you
  useEffect(() => {
    if (!isClerkLoaded || !isSignedIn) return;
    async function checkSubmission() {
      try {
        const res = await fetch("/api/onboarding");
        const data = await res.json();
        if (data.submitted) {
          mapOnboardingToAssessment();
          window.location.assign("/assessment");
        }
      } catch {/* ignore, let user proceed */}
    }
    checkSubmission();
  }, [isClerkLoaded, isSignedIn, router]);

  // Client-side local storage rehydration
  useEffect(() => {
    const savedStep = window.localStorage.getItem(ONBOARDING_STEP_KEY);
    const savedDraft = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);
    
    let nextName = "";
    let nextRole = "";
    let nextCompanyName = "";
    let nextEmail = "";
    let nextLinkedIn = "";
    let nextWebsiteUrl = "";
    let nextXUrl = "";
    let nextNotes = "";
    let nextFiles: string[] = [];
    let nextStep = 0;
    let nextImported = false;
    let nextPhone = "";
    let nextPhoneData: PhoneData | null = null;

    if (savedStep && parseInt(savedStep) >= 1 && parseInt(savedStep) <= 4) {
      nextStep = Number(savedStep);
    }

    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as OnboardingDraft;
        if (parsed.name) nextName = parsed.name;
        if (parsed.role) nextRole = parsed.role;
        if (parsed.companyName) nextCompanyName = parsed.companyName;
        if (parsed.email) nextEmail = parsed.email;
        if (parsed.linkedIn) nextLinkedIn = parsed.linkedIn;
        if (parsed.websiteUrl) nextWebsiteUrl = parsed.websiteUrl;
        if (parsed.xUrl) nextXUrl = parsed.xUrl;
        if (parsed.notes) nextNotes = parsed.notes;
        if (parsed.files) nextFiles = parsed.files;
        if (parsed.imported) nextImported = parsed.imported;
        if (parsed.phone) nextPhone = parsed.phone;
        if (parsed.phoneData) nextPhoneData = parsed.phoneData;

        if (parsed.email && nextStep === 0) {
          nextStep = 1;
        }
      } catch {
        window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
      }
    }

    startTransition(() => {
      if (nextStep < 5) setStep(nextStep);
      else setStep(4);
      
      setName(nextName);
      setRole(nextRole);
      setCompanyName(nextCompanyName);
      setEmail(nextEmail);
      setLinkedIn(nextLinkedIn);
      setWebsiteUrl(nextWebsiteUrl);
      setXUrl(nextXUrl);
      setNotes(nextNotes);
      setFiles(nextFiles);
      setHasImported(nextImported);
      setPhone(nextPhone);
      setPhoneData(nextPhoneData);
      setHasHydrated(true);
    });
  }, []);

  // Sync draft state back to cache
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
        email,
        linkedIn,
        websiteUrl,
        xUrl,
        notes,
        files,
        imported: hasImported,
        phone,
        phoneData
      })
    );
  }, [hasHydrated, name, role, companyName, email, linkedIn, websiteUrl, xUrl, notes, files, hasImported, phone, phoneData]);

  // Loading assessment dynamic messages array
  const loadingStepsArray = useMemo(() => {
    return [
      "Securing your founder profile",
      "Reading your startup context",
      "Understanding your startup context",
      "Checking missing funding signals",
      "Preparing your early funding assessment"
    ];
  }, []);

  // Step 5 inline processing timers
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
        if (submissionId) {
          router.push(`/account-save?submissionId=${submissionId}`);
        } else {
          router.push("/account-save");
        }
      }, 400);
      return () => clearTimeout(t);
    }
  }, [step, elapsed, router, submissionId]);

  // Forceful session teardown ensuring absolute termination intent
  const terminateSession = (status: "idle" | "captured" = "idle") => {
    isManualStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch {}
    }
    if (recognitionTimeoutRef.current) {
      window.clearTimeout(recognitionTimeoutRef.current);
      recognitionTimeoutRef.current = null;
    }
    setListening(false);
    setVoiceState(status);
  };

  const stopRecognition = () => {
    const hasContent = notesRef.current.trim().split(/\s+/).filter(Boolean).length > 0;
    terminateSession(hasContent ? "captured" : "idle");
  };

  const handleListen = () => {
    setVoiceErrorText(null);

    if (listening) {
      terminateSession("captured");
      return;
    }

    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceErrorText("Voice input is unavailable in this browser. Please type your idea instead.");
      return;
    }

    isManualStopRef.current = false;

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      baseNotesRef.current = notes ? notes.trim() : "";

      recognition.onstart = () => {
        setListening(true);
        setVoiceState("listening");
        
        // Ensure hard ceiling of exactly 2 minutes
        if (!recognitionTimeoutRef.current) {
          recognitionTimeoutRef.current = window.setTimeout(() => {
            const hasContent = notesRef.current.trim().split(/\s+/).filter(Boolean).length > 0;
            terminateSession(hasContent ? "captured" : "idle");
          }, 120000);
        }
      };

      recognition.onresult = (event: any) => {
        let finalStr = "";
        let interimStr = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript;
          } else {
            interimStr += event.results[i][0].transcript;
          }
        }
        
        const base = baseNotesRef.current;
        const sep = base && !base.endsWith(" ") && !base.endsWith("\n") ? " " : "";
        const nextCombined = base + sep + finalStr + (interimStr ? " " + interimStr : "");
        setNotes(nextCombined);

        if (finalStr.trim()) {
          setVoiceTranscript((prev) => (prev ? prev + " " + finalStr.trim() : finalStr.trim()));
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === "no-speech") {
          // Soft native audio drop; rely on onend to auto-restart smoothly without setting state to captured
          return;
        }
        console.error("Speech recognition error", event.error);
        terminateSession("idle");
        setVoiceErrorText("We couldn’t capture your voice clearly. Please try again or type your idea instead.");
      };

      recognition.onend = () => {
        if (isManualStopRef.current) return;

        // If not manually halted and timeout hasn't elapsed, auto-restart the listener loop seamlessly
        if (recognitionTimeoutRef.current) {
          try {
            baseNotesRef.current = notesRef.current ? notesRef.current.trim() : "";
            recognition.start();
          } catch {
            terminateSession("idle");
          }
        } else {
          const hasContent = notesRef.current.trim().split(/\s+/).filter(Boolean).length > 0;
          terminateSession(hasContent ? "captured" : "idle");
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setVoiceErrorText("Voice input is unavailable in this browser. Please type your idea instead.");
      terminateSession("idle");
    }
  };

  // Cleanup native listeners on component dismount
  useEffect(() => {
    return () => {
      terminateSession("idle");
    };
  }, []);

  async function finishOnboarding() {
    const resolvedName = name || "Priya Sharma";
    const resolvedRole = role || "Founder";
    const resolvedCompany = companyName || "Orbit Labs";
    const resolvedLinkedIn = linkedIn || "https://linkedin.com/in/yourname";
    const resolvedNotes = notes || defaultPitchText;

    completeOnboarding({
      founderName: resolvedName,
      founderRole: resolvedRole,
      companyName: resolvedCompany,
      linkedIn: resolvedLinkedIn,
      notes: resolvedNotes,
      files,
    });

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resolvedName,
          role: resolvedRole,
          companyName: resolvedCompany,
          email,
          linkedIn: resolvedLinkedIn,
          notes: resolvedNotes,
          websiteUrl,
          xUrl,
          files,
          filesMetadata: fileMeta,
          voiceTranscript,
          sourceRoute: "/onboarding",
          phoneData,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save profile");
      }

      const data = await res.json().catch(() => ({}));
      if (data.submissionId) {
        setSubmissionId(data.submissionId);
      }

      setIsSubmitting(false);
      setStep(5);
    } catch (e: any) {
      setIsSubmitting(false);
      setSubmitError(e?.message || "We couldn't save your profile right now. Please try again.");
    }
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
            <div className="text-[12px] font-bold text-black/30 uppercase tracking-[0.2em] mb-2">{step === 0 ? "Welcome" : `Step ${step} of 4`}</div>
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
            Stop pitching blindly. Get your founder profile assessed before you apply.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-black/40">
            Fundme helps founders secure capital by automating the boring parts of the application process.
          </p>
        </div>
      </div>

      {/* Right Panel: Content (Genuinely mobile-first container) */}
      <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
        {/* Mobile Header (Compact & Sticky) */}
        <div className="flex lg:hidden items-center justify-between px-4 py-2.5 border-b border-black/[0.03] bg-white/95 backdrop-blur-md sticky top-0 z-50 shrink-0">
          <BrandLockup size="sm" />
          <div className="text-[11px] font-bold text-[#ff6b3d] tracking-wider">{step === 0 ? "WELCOME" : `STEP ${step}/4`}</div>
        </div>

        <div className="flex-1 overflow-y-auto pt-3 pb-[calc(3rem+env(safe-area-inset-bottom))] lg:pt-16 lg:pb-32 px-4 sm:px-12 xl:px-24">
          <div className="w-full max-w-[680px] mx-auto">
            <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4 sm:gap-8 w-full max-w-[480px] mx-auto pt-4 sm:pt-8"
              >
                <div className="mb-1 sm:mb-2 text-center">
                  <h1 className="text-[26px] sm:text-[42px] font-semibold tracking-[-0.04em] leading-[1.1] text-black">
                    Start your free funding assessment
                  </h1>
                  <p className="text-[13px] sm:text-[16px] text-black/50 mt-2 sm:mt-4 leading-snug">
                    Enter your email so Team Fundme can send your assessment update.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-3 sm:gap-6 mt-1 sm:mt-4">
                  <Field className="gap-1 sm:gap-2.5">
                    <FieldLabel className="text-[11px] sm:text-[13px] font-bold text-black uppercase tracking-wider mb-0.5 sm:mb-2.5">Email <span className="text-[#ff6b3d]">*</span></FieldLabel>
                    <Input
                      type="email"
                      className={`h-10 sm:h-12 rounded-[10px] sm:rounded-[12px] bg-black/[0.02] border transition-all text-[14px] sm:text-[16px] px-3 sm:px-4 ${email && !isEmailValid ? "border-[#ff6b3d] bg-[#fff5f0]" : "border-black/5 focus:bg-white"}`}
                      placeholder="founder@startup.com"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                    />
                    {email && !isEmailValid && (
                      <div className="text-[11px] text-[#ff6b3d] mt-0.5 font-medium">Please enter a valid email address.</div>
                    )}
                  </Field>
                  <PhoneInputField 
                    value={phone} 
                    onChange={(val, data) => { setPhone(val); setPhoneData(data); }}
                    error={phone && !isPhoneValid ? "Please enter a valid phone number." : null} 
                  />
                  <Field className="gap-1 sm:gap-2.5">
                    <FieldLabel className="text-[11px] sm:text-[13px] font-bold text-black uppercase tracking-wider mb-0.5 sm:mb-2.5 flex items-center justify-between">
                      LinkedIn URL 
                      <span className="text-black/30 font-normal lowercase tracking-normal">(Optional)</span>
                    </FieldLabel>
                    <Input
                      className={`h-10 sm:h-12 rounded-[10px] sm:rounded-[12px] bg-black/[0.02] border transition-all text-[14px] sm:text-[16px] px-3 sm:px-4 ${linkedIn && !isLinkedInValid ? "border-[#ff6b3d] bg-[#fff5f0]" : "border-black/5 focus:bg-white"}`}
                      placeholder="https://linkedin.com/in/yourname"
                      onChange={(e) => setLinkedIn(e.target.value)}
                      value={linkedIn}
                    />
                  </Field>
                </div>

                <div className="flex flex-col items-center sm:items-end pt-4 sm:pt-8 border-t border-black/5 mt-3 sm:mt-6 gap-2">
                  <Button 
                    onClick={() => setStep(1)} 
                    size="lg" 
                    className="h-10 sm:h-12 w-full sm:w-auto px-8 sm:px-10 rounded-[10px] sm:rounded-full text-[14px] sm:text-[16px]" 
                    disabled={!isEmailValid || (linkedIn.length > 0 && !isLinkedInValid) || !isPhoneValid}
                  >
                    Continue to assessment <ArrowRight className="size-4 ml-2" />
                  </Button>
                  <div className="text-[12px] text-black/40 text-center sm:text-right w-full sm:w-auto">
                    We&rsquo;ll never sell your data.
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4 sm:gap-8"
              >
                <div className="mb-1 sm:mb-2">
                  <h1 className="text-[26px] sm:text-[42px] font-semibold tracking-[-0.04em] leading-[1.1] text-black">
                    Tell us about yourself
                  </h1>
                  <p className="text-[13px] sm:text-[18px] text-black/50 mt-1 sm:mt-4 max-w-[480px] leading-snug">
                    Stop pitching blindly. Get your founder profile assessed before you apply.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mt-1 sm:mt-4">
                  <Field className="gap-1 sm:gap-2.5">
                    <FieldLabel className="text-[11px] sm:text-[13px] font-bold text-black uppercase tracking-wider mb-0.5 sm:mb-2.5">Full Name <span className="text-[#ff6b3d]">*</span></FieldLabel>
                    <Input 
                      className="h-10 sm:h-12 rounded-[10px] sm:rounded-[12px] bg-black/[0.02] border-black/5 focus:bg-white transition-all text-[14px] sm:text-[16px] px-3 sm:px-4"
                      placeholder="e.g. Priya Sharma" 
                      onChange={(e) => setName(e.target.value)} 
                      value={name} 
                    />
                  </Field>
                  <Field className="gap-1 sm:gap-2.5">
                    <FieldLabel className="text-[11px] sm:text-[13px] font-bold text-black uppercase tracking-wider mb-0.5 sm:mb-2.5">Role <span className="text-[#ff6b3d]">*</span></FieldLabel>
                    <Input 
                      className="h-10 sm:h-12 rounded-[10px] sm:rounded-[12px] bg-black/[0.02] border-black/5 focus:bg-white transition-all text-[14px] sm:text-[16px] px-3 sm:px-4"
                      placeholder="e.g. Founder"
                      onChange={(e) => setRole(e.target.value)} 
                      value={role} 
                    />
                  </Field>
                  <Field className="gap-1 sm:gap-2.5 md:col-span-2">
                    <FieldLabel className="text-[11px] sm:text-[13px] font-bold text-black uppercase tracking-wider mb-0.5 sm:mb-2.5">Company Name <span className="text-[#ff6b3d]">*</span></FieldLabel>
                    <Input
                      className="h-10 sm:h-12 rounded-[10px] sm:rounded-[12px] bg-black/[0.02] border-black/5 focus:bg-white transition-all text-[14px] sm:text-[16px] px-3 sm:px-4"
                      placeholder="e.g. Orbit Labs"
                      onChange={(e) => setCompanyName(e.target.value)}
                      value={companyName}
                    />
                  </Field>
                  <Field className="gap-1 sm:gap-2.5 md:col-span-2">
                    <FieldLabel className="text-[11px] sm:text-[13px] font-bold text-black uppercase tracking-wider mb-0.5 sm:mb-2.5">Email <span className="text-[#ff6b3d]">*</span></FieldLabel>
                    <Input
                      type="email"
                      className={`h-10 sm:h-12 rounded-[10px] sm:rounded-[12px] bg-black/[0.02] border transition-all text-[14px] sm:text-[16px] px-3 sm:px-4 ${email && !isEmailValid ? "border-[#ff6b3d] bg-[#fff5f0]" : "border-black/5 focus:bg-white"}`}
                      placeholder="founder@startup.com"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                    />
                    {email && !isEmailValid && (
                      <div className="text-[11px] text-[#ff6b3d] mt-0.5 font-medium">Please enter a valid email address with @ and domain.</div>
                    )}
                  </Field>
                  <Field className="gap-1 sm:gap-2.5 md:col-span-2">
                    <FieldLabel className="text-[11px] sm:text-[13px] font-bold text-black uppercase tracking-wider mb-0.5 sm:mb-2.5">Website URL</FieldLabel>
                    <Input
                      className={`h-10 sm:h-12 rounded-[10px] sm:rounded-[12px] bg-black/[0.02] border transition-all text-[14px] sm:text-[16px] px-3 sm:px-4 ${websiteUrl && !isWebsiteValid ? "border-[#ff6b3d] bg-[#fff5f0]" : "border-black/5 focus:bg-white"}`}
                      placeholder="https://yourstartup.com"
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      value={websiteUrl}
                    />
                    {websiteUrl && !isWebsiteValid && (
                      <div className="text-[11px] text-[#ff6b3d] mt-0.5 font-medium">Please enter a reasonable URL format (e.g. example.com).</div>
                    )}
                  </Field>
                  <Field className="gap-1 sm:gap-2.5">
                    <FieldLabel className="text-[11px] sm:text-[13px] font-bold text-black uppercase tracking-wider mb-0.5 sm:mb-2.5">LinkedIn URL</FieldLabel>
                    <Input
                      className={`h-10 sm:h-12 rounded-[10px] sm:rounded-[12px] bg-black/[0.02] border transition-all text-[14px] sm:text-[16px] px-3 sm:px-4 ${linkedIn && !isLinkedInValid ? "border-[#ff6b3d] bg-[#fff5f0]" : "border-black/5 focus:bg-white"}`}
                      placeholder="https://linkedin.com/in/yourname"
                      onChange={(e) => setLinkedIn(e.target.value)}
                      value={linkedIn}
                    />
                    {linkedIn && !isLinkedInValid && (
                      <div className="text-[11px] text-[#ff6b3d] mt-0.5 font-medium">URL must contain linkedin.com.</div>
                    )}
                  </Field>
                  <Field className="gap-1 sm:gap-2.5">
                    <FieldLabel className="text-[11px] sm:text-[13px] font-bold text-black uppercase tracking-wider mb-0.5 sm:mb-2.5">X (Twitter) URL</FieldLabel>
                    <Input
                      className={`h-10 sm:h-12 rounded-[10px] sm:rounded-[12px] bg-black/[0.02] border transition-all text-[14px] sm:text-[16px] px-3 sm:px-4 ${xUrl && !isXValid ? "border-[#ff6b3d] bg-[#fff5f0]" : "border-black/5 focus:bg-white"}`}
                      placeholder="https://x.com/yourhandle"
                      onChange={(e) => setXUrl(e.target.value)}
                      value={xUrl}
                    />
                    {xUrl && !isXValid && (
                      <div className="text-[11px] text-[#ff6b3d] mt-0.5 font-medium">URL must contain x.com or twitter.com.</div>
                    )}
                  </Field>
                </div>

                <div className="flex justify-end pt-4 sm:pt-8 border-t border-black/5 mt-3 sm:mt-6">
                  <Button onClick={() => setStep(2)} size="lg" className="h-10 sm:h-12 px-8 sm:px-10 rounded-full text-[14px] sm:text-[16px]" disabled={!isStep1Valid}>
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
                className="flex flex-col gap-4 sm:gap-8 w-full"
              >
                <div className="mb-1 sm:mb-2">
                  <h1 className="text-[26px] sm:text-[42px] font-semibold tracking-[-0.04em] leading-[1.1] text-black">
                    {derivedFirstName ? `Tell us what you’re building, ${derivedFirstName}.` : "Tell us what you’re building."}
                  </h1>
                  <p className="text-[13px] sm:text-[18px] text-black/50 mt-1 sm:mt-4 max-w-[520px] leading-snug">
                    Describe your idea naturally using voice input or type directly below. You can edit the transcribed notes freely.
                  </p>
                </div>

                {voiceErrorText && (
                  <div className="w-full p-3 rounded-[12px] bg-[#fff5f0] border border-[#ff6b3d]/20 text-[#ff6b3d] text-[12px] text-center font-medium">
                    {voiceErrorText}
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-4 sm:gap-8 items-stretch md:items-start mt-1 sm:mt-2">
                  {/* Voice Controls */}
                  <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-[16px] sm:rounded-[24px] bg-black/[0.02] border border-black/5 w-full md:w-[240px] shrink-0 text-center">
                    <button
                      className={`relative flex size-20 sm:size-24 items-center justify-center rounded-full border transition-all duration-500 ${
                        voiceState === "listening"
                          ? "border-[#ff6b3d] bg-[#ff6b3d] text-white shadow-[0_0_0_12px_rgba(255,107,61,0.1)] scale-105"
                          : voiceState === "processing"
                          ? "border-amber-500 bg-amber-50 text-amber-600 animate-pulse"
                          : voiceState === "captured"
                          ? "border-[#22c55e] bg-[#f0fdf4] text-[#22c55e]"
                          : "border-black/5 bg-white text-black hover:scale-105 hover:bg-black/[0.01] shadow-sm"
                      }`}
                      onClick={handleListen}
                      type="button"
                    >
                      {voiceState === "listening" && (
                        <div className="absolute inset-[-16px] flex items-center justify-center gap-[3px] opacity-80 pointer-events-none">
                          {Array.from({ length: 10 }).map((_, index) => {
                             const h = 6 + Math.random() * 20;
                             return (
                              <motion.span
                                key={index}
                                className="w-[2px] rounded-full bg-white"
                                animate={{ height: [`${h}px`, `${h * 1.4}px`, `${h}px`] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: index * 0.05, ease: "easeInOut" }}
                              />
                             )
                          })}
                        </div>
                      )}
                      {voiceState === "captured" ? (
                        <CheckCircle2 className="size-8 sm:size-10" />
                      ) : (
                        <Mic className={`relative z-10 ${voiceState === "listening" ? "size-8 sm:size-10" : "size-6 sm:size-8 opacity-60"}`} />
                      )}
                    </button>
                    <div className="mt-3 sm:mt-4 text-[14px] sm:text-[15px] font-semibold text-black">
                      {voiceState === "listening" ? "Listening..." : voiceState === "processing" ? "Processing audio..." : voiceState === "captured" ? "Captured!" : "Tap to speak"}
                    </div>
                    
                    {listening ? (
                      <button
                        type="button"
                        onClick={stopRecognition}
                        className="mt-2.5 px-3.5 py-1 rounded-full bg-[#ff6b3d] text-white text-[11px] font-bold tracking-wide uppercase shadow-sm hover:bg-[#ff6b3d]/90 transition-all"
                      >
                        Stop recording
                      </button>
                    ) : (
                      <div className="text-[11px] sm:text-[12px] text-black/40 mt-1">
                        Voice transcription mode
                      </div>
                    )}
                  </div>

                  {/* Text Mode */}
                  <div className="flex-1 w-full text-left flex flex-col">
                    <Textarea
                      className={`min-h-[160px] sm:min-h-[240px] text-[14px] sm:text-[16px] rounded-[16px] sm:rounded-[24px] bg-black/[0.02] border focus:bg-white p-4 sm:p-6 leading-relaxed resize-y transition-all ${
                        notes.length > 0 && (letterCount < 35 || letterCount > 500)
                          ? "border-[#ff6b3d]/40 focus:border-[#ff6b3d]"
                          : "border-black/5 focus:border-black/20"
                      }`}
                      placeholder={placeholderText}
                      onChange={(event) => setNotes(event.target.value)}
                      value={notes}
                    />
                    
                    {/* Letter Counter Rules Display */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-2 px-1 text-[11px] sm:text-[12px]">
                      <span className={`font-medium transition-colors ${
                        letterCount === 0 ? "text-black/40" : letterCount < 35 || letterCount > 500 ? "text-[#ff6b3d]" : "text-[#22c55e]"
                      }`}>
                        {letterCount < 35 
                          ? `Please add ${35 - letterCount} more letters so we can understand what you’re building.` 
                          : letterCount > 500 
                          ? `You are ${letterCount - 500} letters over the limit. Keep it under 500 letters for now.`
                          : "Good context. Ready to continue."}
                      </span>
                      <div className="text-right shrink-0">
                        <div className={`font-semibold tracking-tight transition-colors ${
                          letterCount > 0 && (letterCount < 35 || letterCount > 500) ? "text-[#ff6b3d]" : "text-black/40"
                        }`}>
                          {letterCount} / 500 letters
                        </div>
                        <div className="text-[10px] text-black/30 font-medium leading-none mt-0.5">
                          Minimum 35 letters
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center w-full mt-6 sm:mt-12 pt-4 sm:pt-8 border-t border-black/5">
                   <button
                     className="text-[13px] sm:text-[15px] font-bold text-black/30 hover:text-black transition-colors"
                     onClick={() => {
                       if (listening) stopRecognition();
                       setStep(1);
                     }}
                     type="button"
                   >
                     ← Go Back
                   </button>
                   <Button 
                     onClick={() => {
                       if (listening) stopRecognition();
                       setStep(3);
                     }} 
                     size="lg" 
                     className="h-10 sm:h-12 px-6 sm:px-10 rounded-full text-[14px] sm:text-[16px]" 
                     disabled={letterCount < 35 || letterCount > 500}
                   >
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
                className="flex flex-col gap-4 sm:gap-10 w-full"
              >
                <div className="mb-1 sm:mb-2">
                  <h1 className="text-[26px] sm:text-[42px] font-semibold tracking-[-0.04em] leading-[1.1] text-black">
                    Upload your materials
                  </h1>
                  <p className="text-[13px] sm:text-[18px] text-black/50 mt-1 sm:mt-4 max-w-[480px] leading-snug">
                    Add your pitch deck, memo, or previous application answers to help the AI understand your roadmap.
                  </p>
                </div>

                <div className="mt-1 sm:mt-4 bg-black/[0.01] rounded-[20px] sm:rounded-[32px] p-1.5 sm:p-2 border border-black/5">
                   <FileUploadArea 
                     files={files} 
                     onChange={setFiles} 
                     onFilesAdded={(newFiles) => {
                       setFileMeta(prev => [
                         ...prev, 
                         ...newFiles.map(f => ({ name: f.name, size: f.size, type: f.type || "application/octet-stream" }))
                       ]);
                     }}
                   />
                </div>

                <div className="flex justify-between items-center mt-6 sm:mt-12 pt-4 sm:pt-8 border-t border-black/5">
                   <button
                     className="text-[13px] sm:text-[15px] font-bold text-black/30 hover:text-black transition-colors"
                     onClick={() => setStep(2)}
                     type="button"
                   >
                     ← Go Back
                   </button>
                   <Button onClick={() => setStep(4)} size="lg" className="h-10 sm:h-12 px-6 sm:px-10 rounded-full text-[14px] sm:text-[16px]">
                     {files.length > 0 ? "Review Everything" : "Skip for now"} <ArrowRight className="size-4 ml-2" />
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
                className="flex flex-col gap-4 sm:gap-10 w-full"
              >
                <div className="mb-1 sm:mb-2">
                  <h1 className="text-[26px] sm:text-[42px] font-semibold tracking-[-0.04em] leading-[1.1] text-black">
                    Review and Confirm
                  </h1>
                  <p className="text-[13px] sm:text-[18px] text-black/50 mt-1 sm:mt-4 max-w-[480px] leading-snug">
                    Check your details before we prepare your early funding assessment.
                  </p>
                </div>

                {submitError && (
                  <div className="p-3 sm:p-4 rounded-[12px] sm:rounded-[16px] bg-[#fff5f0] border border-[#ff6b3d]/20 text-[#ff6b3d] text-[12px] sm:text-[13px] text-center font-medium">
                    {submitError}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:gap-4 mt-1 sm:mt-4">
                  <div className="p-4 sm:p-6 rounded-[16px] sm:rounded-[24px] bg-black/[0.02] border border-black/5 flex flex-col gap-3 group hover:bg-white hover:shadow-sm transition-all relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="size-10 sm:size-12 shrink-0 rounded-[12px] sm:rounded-[16px] bg-[#fff5f0] border border-[#ff6b3d]/10 flex items-center justify-center text-[#ff6b3d]">
                          <User className="size-5 sm:size-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] sm:text-[13px] font-bold text-black/30 uppercase tracking-tighter truncate">Founder Profile</div>
                          <div className="text-[14px] sm:text-[17px] font-semibold text-black truncate">{name || "Priya Sharma"} {role ? `• ${role}` : ""}</div>
                        </div>
                      </div>
                      <PenIcon className="size-4 text-black/20 group-hover:text-black cursor-pointer shrink-0 ml-2" onClick={() => setStep(1)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-black/5 text-[13px] sm:text-[14px]">
                      <div className="truncate"><span className="text-black/40">Company:</span> <span className="font-medium text-black">{companyName || "Orbit Labs"}</span></div>
                      <div className="truncate"><span className="text-black/40">Email:</span> <span className="font-medium text-black">{email || "Not provided"}</span></div>
                      {websiteUrl && <div className="truncate"><span className="text-black/40">Website:</span> <span className="font-medium text-black">{websiteUrl}</span></div>}
                      {linkedIn && <div className="truncate"><span className="text-black/40">LinkedIn:</span> <span className="font-medium text-black">{linkedIn}</span></div>}
                      {xUrl && <div className="truncate"><span className="text-black/40">X:</span> <span className="font-medium text-black">{xUrl}</span></div>}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 rounded-[16px] sm:rounded-[24px] bg-black/[0.02] border border-black/5 flex items-center justify-between group hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="size-10 sm:size-12 shrink-0 rounded-[12px] sm:rounded-[16px] bg-[#f5f0ff] border border-purple-500/10 flex items-center justify-center text-purple-600">
                        <Sparkles className="size-5 sm:size-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-[13px] font-bold text-black/30 uppercase tracking-tighter truncate">Startup Pitch</div>
                        <div className="text-[13px] sm:text-[15px] font-medium text-black/80 line-clamp-2 max-w-[420px] mt-0.5">{notes || "Captured pitch description..."}</div>
                      </div>
                    </div>
                    <PenIcon className="size-4 text-black/20 group-hover:text-black cursor-pointer shrink-0 ml-2" onClick={() => setStep(2)} />
                  </div>

                  <div className="p-4 sm:p-6 rounded-[16px] sm:rounded-[24px] bg-black/[0.02] border border-black/5 flex items-center justify-between group hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="size-10 sm:size-12 shrink-0 rounded-[12px] sm:rounded-[16px] bg-[#f0f7ff] border border-blue-500/10 flex items-center justify-center text-blue-600">
                        <FileText className="size-5 sm:size-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-[13px] font-bold text-black/30 uppercase tracking-tighter truncate">Documents</div>
                        <div className="text-[14px] sm:text-[17px] font-semibold text-black truncate">{files.length} material{files.length !== 1 ? "s" : ""} uploaded</div>
                        {fileMeta.length > 0 && (
                          <div className="text-[11px] sm:text-[12px] text-black/40 mt-0.5 truncate">
                            {fileMeta.map(f => `${f.name}`).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <PenIcon className="size-4 text-black/20 group-hover:text-black cursor-pointer shrink-0 ml-2" onClick={() => setStep(3)} />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 sm:mt-12 pt-4 sm:pt-8 border-t border-black/5">
                   <button
                     className="text-[13px] sm:text-[15px] font-bold text-black/30 hover:text-black transition-colors"
                     onClick={() => setStep(3)}
                     type="button"
                   >
                     ← Go Back
                   </button>
                   <Button onClick={finishOnboarding} disabled={isSubmitting} size="lg" className="h-11 sm:h-14 px-8 sm:px-10 rounded-full text-[14px] sm:text-[16px] font-bold bg-[#ff6b3d] hover:bg-[#ff6b3d]/90 shadow-lg shadow-[#ff6b3d]/10 text-white">
                     {isSubmitting ? "Submitting..." : "Submit for assessment"}
                   </Button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 sm:py-20 px-2"
              >
                <div className="text-center mb-10 sm:mb-16">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff5f0] border border-[#ff6b3d]/10 text-[#ff6b3d] text-[11px] sm:text-[12px] font-bold uppercase tracking-wider mb-4 sm:mb-6"
                    >
                      <LoaderCircle className="size-3 animate-spin" /> Preparing
                    </motion.div>
                    <motion.h1 
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="text-[24px] sm:text-[40px] font-semibold tracking-[-0.04em] leading-tight text-black max-w-[500px] mx-auto"
                    >
                      Fundme is preparing the early-access assessment.
                    </motion.h1>
                </div>

                <div className="w-full max-w-[440px] flex flex-col gap-2.5 sm:gap-3">
                   {loadingStepsArray.map((text, i) => {
                      const activeIndex = Math.min(4, Math.floor(elapsed / 1000));
                      const done = i < activeIndex || elapsed >= 5000;
                      const active = i === activeIndex && elapsed < 5000;
                      return (
                         <motion.div 
                           initial={{ opacity: 0, scale: 0.96 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: i * 0.08 }}
                           key={text + i} 
                           className={`flex items-center gap-3 sm:gap-4 rounded-[16px] sm:rounded-[20px] border p-3 sm:p-4 transition-all duration-300 ${
                             active 
                               ? "bg-white shadow-md border-black/10 scale-[1.02] z-10 text-black" 
                               : done 
                               ? "bg-black/[0.02] border-transparent opacity-70 text-black" 
                               : "bg-transparent border-black/5 opacity-30 text-black"
                           }`}
                         >
                           {done ? (
                             <div className="flex size-5 sm:size-[26px] shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-white">
                               <CheckCircle2 className="size-3 sm:size-3.5" />
                             </div>
                           ) : active ? (
                             <div className="flex size-5 sm:size-[26px] shrink-0 items-center justify-center rounded-full border-2 border-[#ff6b3d] border-t-transparent animate-spin" />
                           ) : (
                             <div className="flex size-5 sm:size-[26px] shrink-0 items-center justify-center rounded-full border border-black/10">
                               <span className="size-1 sm:size-1.5 rounded-full bg-black/10" />
                             </div>
                           )}
                           <span className="text-[13px] sm:text-[15px] font-semibold tracking-tight truncate block">{text}</span>
                         </motion.div>
                       )
                   })}
                 </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
