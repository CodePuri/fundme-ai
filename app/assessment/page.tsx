"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Link2,
  Sparkles,
  LoaderCircle,
  FileUp,
  PenLine,
  User,
  Lightbulb,
  Target,
  Mic,
  Upload,
  Zap
} from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { useAssessment } from "@/components/assessment/assessment-provider";
import { EASE_OUT } from "@/lib/animations";
import { Textarea } from "@/components/ui/textarea";

const sampleData = {
  website: "https://flowstate.ai",
  startup: "Flowstate AI",
  linkedin: "https://linkedin.com/in/sarah-chen-ai",
  notes: "We're building an AI-powered workflow tool for creative teams. Launched beta 3 months ago, 2,400 waitlist signups, 12 paying teams. Currently pre-seed, bootstrapped with some angel backing. Our edge is real-time collaboration on AI-generated content pipelines.",
};

function SourceInput({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  icon: any;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b8276] mb-3">
        <Icon className="size-3.5 text-[#b5ad9f]" />
        {label}
        {required && <span className="text-[#ff6b3d]">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-2xl border border-black/[0.08] bg-white/80 px-4 text-[14px] text-[#171513] placeholder:text-[#b5ad9f] focus:border-[#ff6b3d]/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ff6b3d]/5 transition-all"
        />
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  const router = useRouter();
  const {
    state,
    setWebsiteUrl,
    setStartupName,
    setLinkedInUrl,
    setStartupNotes,
    setUploadedFiles
  } = useAssessment();
  const shouldReduceMotion = useReducedMotion();

  const [website, setWebsite] = useState(state.websiteUrl);
  const [startup, setStartup] = useState(state.startupName);
  const [linkedin, setLinkedIn] = useState(state.linkedInUrl);
  const [notes, setNotes] = useState(state.startupNotes || "");
  const [files, setFiles] = useState<string[]>(state.uploadedFiles || []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!state.websiteUrl) {
      try {
        const savedUrl = window.localStorage.getItem("fundme-homepage-website");
        if (savedUrl) {
          setWebsite(savedUrl);
        }
      } catch {/* ignore */}
    }
  }, []);

  function handleStartAnalysis() {
    setError(null);
    if (!website.trim()) {
      setError("Enter your website URL to begin the scan.");
      return;
    }

    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[^\s]*)?$/i;
    const cleanUrl = website.trim();
    if (!urlPattern.test(cleanUrl)) {
      setError("Enter a valid website URL.");
      return;
    }

    setIsSubmitting(true);

    setWebsiteUrl(cleanUrl);
    setStartupName(startup.trim());
    setLinkedInUrl(linkedin.trim());
    setStartupNotes(notes.trim());
    setUploadedFiles(files);

    setTimeout(() => {
      router.push("/assessment/analyzing");
    }, 400);
  }

  function handleUseSample() {
    setWebsite(sampleData.website);
    setStartup(sampleData.startup);
    setLinkedIn(sampleData.linkedin);
    setNotes(sampleData.notes);
  }

  function handleFileClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.docx,.doc,.txt,.ppt,.pptx";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const newFiles = Array.from(target.files).map((f) => f.name);
        const unique = newFiles.filter((n) => !files.includes(n));
        setFiles([...files, ...unique]);
      }
    };
    input.click();
  }

  function removeFile(name: string) {
    setFiles(files.filter((f) => f !== name));
  }

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171513]" data-theme="public">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e7ddd0] bg-[#f6f1ea]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-4 sm:px-6 xl:px-8 py-3">
          <Link href="/">
            <BrandLockup />
          </Link>
          <div className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b8276]">
            Source Input Console
          </div>
        </div>
      </header>

      <div className="flex min-h-screen flex-col items-center px-4 pt-28 pb-28 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="w-full max-w-[600px]"
        >
          {/* Hero */}
          <div className="mb-10 text-center">
            <h1 className="instrument-serif text-[36px] italic leading-[1.1] text-[#171513] sm:text-[48px]">
              Scan your <br />
              <span className="text-[#ff6b3d] not-italic font-bold">funding readiness.</span>
            </h1>
            <p className="mt-4 text-[15px] leading-[1.6] text-[#6f685f] max-w-[480px] mx-auto">
              Drop your sources. We&apos;ll scan your signals against real accelerator criteria.
            </p>
          </div>

          <div className="space-y-10">
            {/* Intake Console */}
            <div className="rounded-[32px] border border-black/[0.05] bg-white p-6 sm:p-8 shadow-[0_24px_48px_rgba(0,0,0,0.04)]">
              <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#8b8276]">
                <Zap className="size-3.5 text-[#ff6b3d]" />
                Source Inputs
                <div className="ml-auto">
                  <button
                    onClick={handleUseSample}
                    className="rounded-full border border-black/[0.08] bg-[#f6f1ea] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8b8276] hover:text-[#171513] transition-colors"
                    type="button"
                  >
                    Use sample startup
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Primary Source: Website */}
                <SourceInput
                  icon={Globe}
                  label="Startup Website"
                  type="url"
                  placeholder="google.com"
                  value={website}
                  onChange={setWebsite}
                  required
                />

                {/* Secondary Sources: Name + LinkedIn */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <SourceInput
                    icon={User}
                    label="Startup Name"
                    placeholder="e.g. Flowstate AI"
                    value={startup}
                    onChange={setStartup}
                  />
                  <SourceInput
                    icon={Link2}
                    label="LinkedIn Profile"
                    type="url"
                    placeholder="linkedin.com/in/..."
                    value={linkedin}
                    onChange={setLinkedIn}
                  />
                </div>

                {/* Pitch Deck Upload */}
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b8276] mb-3">
                    <FileUp className="size-3.5 text-[#b5ad9f]" />
                    Pitch Deck
                  </label>
                  <button
                    onClick={handleFileClick}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-black/[0.08] bg-[#f6f1ea]/30 px-5 py-8 text-[13px] text-[#8b8276] hover:border-[#ff6b3d]/30 hover:bg-[#fff5f0]/50 transition-all"
                    type="button"
                  >
                    <Upload className="size-5 text-[#b5ad9f]" />
                    <span className="font-medium">Click to upload deck</span>
                    <span className="text-[11px]">PDF, DOCX, PPT</span>
                  </button>
                  {files.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {files.map((name) => (
                        <span key={name} className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1.5 text-[11px] font-medium text-[#171513]">
                          <FileUp className="size-3 text-[#ff6b3d]" />
                          {name.length > 24 ? name.slice(0, 24) + "..." : name}
                          <button onClick={() => removeFile(name)} className="ml-0.5 text-[#b5ad9f] hover:text-[#171513]">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Startup Notes with mic affordance */}
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b8276] mb-3">
                    <Mic className="size-3.5 text-[#b5ad9f]" />
                    Startup Notes
                  </label>
                  <div className="relative">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Describe your startup naturally... What problem are you solving? Why now?"
                      className="min-h-[120px] rounded-2xl border-black/[0.08] bg-[#f6f1ea]/20 text-[14px] p-5 leading-relaxed placeholder:text-[#b5ad9f] focus:border-[#ff6b3d]/30 focus:ring-4 focus:ring-[#ff6b3d]/5"
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[10px] text-[#b5ad9f]">
                      <Mic className="size-3" />
                      <span>Voice recording coming soon</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[13px] text-[#ff6b3d] font-bold text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  onClick={handleStartAnalysis}
                  disabled={isSubmitting}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#171513] px-8 text-[16px] font-bold text-white shadow-[0_16px_32px_rgba(0,0,0,0.12)] transition-all hover:bg-black disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="size-5 animate-spin" />
                      Initializing scan...
                    </>
                  ) : (
                    <>
                      Start funding scan
                      <ArrowRight className="size-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Outcome Previews */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-black/[0.04] bg-white/60 p-4 text-center">
                <User className="size-4 text-[#8b8276]" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8b8276]">
                  Founder Signal
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-black/[0.04] bg-white/60 p-4 text-center">
                <Target className="size-4 text-[#8b8276]" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8b8276]">
                  Startup Clarity
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-black/[0.04] bg-white/60 p-4 text-center">
                <Sparkles className="size-4 text-[#8b8276]" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8b8276]">
                  Opportunity Fit
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
