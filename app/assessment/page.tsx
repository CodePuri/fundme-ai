"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";
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
  Zap,
  Layout
} from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { useAssessment } from "@/components/assessment/assessment-provider";
import { EASE_OUT } from "@/lib/animations";
import { FileUploadArea } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea";

function SourceCard({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-4 rounded-[24px] border p-5 transition-all duration-300 ${
        isActive 
          ? "border-[#ff6b3d] bg-white shadow-[0_12px_32px_rgba(255,107,61,0.08)] ring-1 ring-[#ff6b3d]" 
          : "border-black/[0.06] bg-white/60 hover:bg-white"
      }`}
    >
      <div className={`flex size-10 items-center justify-center rounded-xl ${isActive ? "bg-[#ff6b3d] text-white" : "bg-[#f6f1ea] text-[#8b8276]"}`}>
        <Icon className="size-5" />
      </div>
      <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#171513]">{label}</span>
    </button>
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
  const shouldReduceMotion = useSafeReducedMotion();

  const [website, setWebsite] = useState(state.websiteUrl);
  const [startup, setStartup] = useState(state.startupName);
  const [linkedin, setLinkedIn] = useState(state.linkedInUrl);
  const [notes, setNotes] = useState(state.startupNotes || "");
  const [files, setFiles] = useState<string[]>(state.uploadedFiles || []);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from homepage localStorage key only once
  useEffect(() => {
    if (!state.websiteUrl) {
      try {
        const savedUrl = window.localStorage.getItem("fundme-homepage-website");
        if (savedUrl) {
          setWebsite(savedUrl);
          // Only update local state, provider will be updated on submit
        }
      } catch {/* ignore */}
    }
  }, []); // Run only once on mount

  function handleStartAnalysis() {
    setError(null);
    if (!website.trim()) {
      setError("Please enter your website URL to begin the scan.");
      return;
    }

    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[^\s]*)?$/i;
    const cleanUrl = website.trim();
    if (!urlPattern.test(cleanUrl)) {
      setError("Please enter a valid website URL.");
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

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171513]" data-theme="public">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e7ddd0] bg-[#f6f1ea]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-4 sm:px-6 xl:px-8 py-3">
          <Link href="/">
            <BrandLockup />
          </Link>
          <div className="hidden sm:block text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b8276]">
            Diagnosis Intake
          </div>
        </div>
      </header>

      <div className="flex min-h-screen flex-col items-center px-4 pt-28 pb-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="w-full max-w-[680px]"
        >
          {/* Hero Section */}
          <div className="mb-14 text-center">
            <h1 className="instrument-serif text-[44px] italic leading-[1.1] text-[#171513] sm:text-[64px]">
              The intelligent layer for<br />
              <span className="text-[#ff6b3d] not-italic font-bold">founder applications.</span>
            </h1>
            <p className="mt-6 text-[17px] leading-[1.6] text-[#6f685f] max-w-[580px] mx-auto">
              Drop your website to scan your positioning, founder signals, and startup clarity against real accelerator patterns.
            </p>
          </div>

          <div className="space-y-12">
            {/* Main Intake Console */}
            <div className="rounded-[40px] border border-black/[0.05] bg-white p-8 sm:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.04)]">
              <div className="space-y-10">
                {/* Website Input Group */}
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-[0.15em] text-[#8b8276] mb-4">
                    Startup Website <span className="text-[#ff6b3d]">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#b5ad9f]" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="google.com"
                      className="h-16 w-full rounded-2xl border border-black/[0.08] bg-[#f6f1ea]/40 pl-12 pr-4 text-[17px] font-medium text-[#171513] placeholder:text-[#b5ad9f] focus:border-[#ff6b3d]/30 focus:outline-none focus:ring-4 focus:ring-[#ff6b3d]/5 transition-all"
                    />
                  </div>
                </div>

                {/* Secondary Inputs Grid */}
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-[0.15em] text-[#8b8276] mb-4">
                      Startup Name
                    </label>
                    <input
                      type="text"
                      value={startup}
                      onChange={(e) => setStartup(e.target.value)}
                      placeholder="e.g. Flowstate AI"
                      className="h-14 w-full rounded-2xl border border-black/[0.08] bg-[#f6f1ea]/40 px-5 text-[16px] font-medium text-[#171513] placeholder:text-[#b5ad9f] focus:border-[#ff6b3d]/30 focus:outline-none focus:ring-4 focus:ring-[#ff6b3d]/5 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-[0.15em] text-[#8b8276] mb-4">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <Link2 className="absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-[#b5ad9f]" />
                      <input
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="linkedin.com/in/..."
                        className="h-14 w-full rounded-2xl border border-black/[0.08] bg-[#f6f1ea]/40 pl-12 pr-4 text-[16px] font-medium text-[#171513] placeholder:text-[#b5ad9f] focus:border-[#ff6b3d]/30 focus:outline-none focus:ring-4 focus:ring-[#ff6b3d]/5 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Pitch Deck */}
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-[0.15em] text-[#8b8276] mb-4 flex items-center gap-2">
                    <FileUp className="size-4" />
                    Pitch Deck (Optional)
                  </label>
                  <FileUploadArea files={files} onChange={setFiles} className="min-h-[140px] rounded-[24px] border-dashed border-black/[0.1] bg-[#f6f1ea]/20" />
                </div>

                {/* Startup Notes */}
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-[0.15em] text-[#8b8276] mb-4 flex items-center gap-2">
                    <PenLine className="size-4" />
                    Startup Notes / Ramble
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your startup naturally... What problem are you solving? Why now?"
                    className="min-h-[140px] rounded-[24px] border-black/[0.08] bg-[#f6f1ea]/20 text-[16px] p-6 leading-relaxed placeholder:text-[#b5ad9f] focus:border-[#ff6b3d]/30 focus:ring-4 focus:ring-[#ff6b3d]/5"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[14px] text-[#ff6b3d] font-bold text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  onClick={handleStartAnalysis}
                  disabled={isSubmitting}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                  className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-full bg-[#171513] px-8 text-[17px] font-bold text-white shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all hover:bg-black disabled:opacity-60"
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 px-2">
                <User className="size-4 text-[#8b8276]" />
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8b8276]">
                  Founder Signal<br /><span className="text-[10px] font-medium opacity-60">Background analysis</span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2">
                <Target className="size-4 text-[#8b8276]" />
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8b8276]">
                  Startup Clarity<br /><span className="text-[10px] font-medium opacity-60">Positioning scan</span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2">
                <Sparkles className="size-4 text-[#8b8276]" />
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8b8276]">
                  Opportunity Radar<br /><span className="text-[10px] font-medium opacity-60">Match identification</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
