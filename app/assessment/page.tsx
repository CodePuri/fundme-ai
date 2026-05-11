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
  Zap
} from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { useAssessment } from "@/components/assessment/assessment-provider";
import { EASE_OUT } from "@/lib/animations";
import { FileUploadArea } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea";

function OutcomePreviewCard({ 
  icon: Icon, 
  label, 
  colorClass, 
  delay 
}: { 
  icon: any; 
  label: string; 
  colorClass: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
      className="flex flex-col items-center gap-2.5 rounded-[20px] border border-black/[0.06] bg-white/60 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
    >
      <div className={`flex size-10 items-center justify-center rounded-full ${colorClass}`}>
        <Icon className="size-5" />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8b8276] text-center">{label}</span>
    </motion.div>
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

  // Sync state changes to provider
  useEffect(() => {
    setUploadedFiles(files);
  }, [files, setUploadedFiles]);

  // Hydrate from homepage localStorage key
  useEffect(() => {
    if (!state.websiteUrl) {
      try {
        const savedUrl = window.localStorage.getItem("fundme-homepage-website");
        if (savedUrl) {
          setWebsite(savedUrl);
          setWebsiteUrl(savedUrl);
        }
      } catch {/* ignore */}
    }
  }, [state.websiteUrl, setWebsiteUrl]);

  function handleStartAnalysis() {
    setError(null);
    if (!website.trim()) {
      setError("Please enter your website URL to begin the diagnosis.");
      return;
    }

    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[^\s]*)?$/i;
    const cleanUrl = website.trim();
    if (!urlPattern.test(cleanUrl)) {
      setError("Please enter a valid website URL.");
      return;
    }

    setIsSubmitting(true);
    
    // Save all to provider
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
          <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#8b8276]">
            Diagnosis Intake
          </div>
        </div>
      </header>

      <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="w-full max-w-[800px]"
        >
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd0] bg-white/92 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#8b8276] mb-6"
            >
              <Sparkles className="size-3 text-[#ff6b3d]" />
              Intelligence Engine v1.0
            </motion.div>
            <h1 className="text-[36px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#171513] sm:text-[48px]">
              Founder Diagnosis
            </h1>
            <p className="mt-4 text-[18px] leading-[1.6] text-[#6f685f] max-w-[540px] mx-auto">
              Drop your materials. We'll scan your positioning, founder signal, and readiness against real program criteria.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            {/* Form Side */}
            <div className="space-y-8 rounded-[32px] border border-black/[0.05] bg-white/50 p-6 sm:p-8 backdrop-blur-sm">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b8276] mb-2.5">
                    Website URL <span className="text-[#ff6b3d]">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#b5ad9f]" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourstartup.com"
                      className="h-12 w-full rounded-[14px] border border-black/[0.08] bg-white pl-11 pr-4 text-[15px] text-[#171513] placeholder:text-[#b5ad9f] focus:border-[#ff6b3d]/30 focus:outline-none focus:ring-4 focus:ring-[#ff6b3d]/5 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b8276] mb-2.5">
                    Startup Name
                  </label>
                  <input
                    type="text"
                    value={startup}
                    onChange={(e) => setStartup(e.target.value)}
                    placeholder="e.g. Flowstate AI"
                    className="h-12 w-full rounded-[14px] border border-black/[0.08] bg-white px-4 text-[15px] text-[#171513] placeholder:text-[#b5ad9f] focus:border-[#ff6b3d]/30 focus:outline-none focus:ring-4 focus:ring-[#ff6b3d]/5 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b8276] mb-2.5">
                    LinkedIn Profile
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#b5ad9f]" />
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="linkedin.com/in/..."
                      className="h-12 w-full rounded-[14px] border border-black/[0.08] bg-white pl-11 pr-4 text-[15px] text-[#171513] placeholder:text-[#b5ad9f] focus:border-[#ff6b3d]/30 focus:outline-none focus:ring-4 focus:ring-[#ff6b3d]/5 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b8276] mb-2.5 flex items-center gap-2">
                  <FileUp className="size-3.5" />
                  Pitch Deck (Optional)
                </label>
                <div className="bg-black/[0.01] rounded-[20px] p-1.5 border border-black/[0.04]">
                  <FileUploadArea files={files} onChange={setFiles} className="min-h-[140px]" />
                </div>
                <p className="mt-2 text-[11px] text-[#b5ad9f]">
                  We store only file metadata for analysis.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b8276] mb-2.5 flex items-center gap-2">
                  <PenLine className="size-3.5" />
                  Startup Notes / Ramble
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your startup naturally... What problem are you solving? Why now?"
                  className="min-h-[120px] rounded-[20px] bg-white border-black/[0.08] text-[15px] p-5 leading-relaxed placeholder:text-[#b5ad9f] focus:border-[#ff6b3d]/30 focus:ring-4 focus:ring-[#ff6b3d]/5"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[13px] text-[#ff6b3d] font-semibold"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                onClick={handleStartAnalysis}
                disabled={isSubmitting}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                className="inline-flex h-15 w-full items-center justify-center gap-3 rounded-full bg-[#171513] px-8 text-[16px] font-bold text-white shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all hover:bg-[#2a2622] disabled:opacity-60 disabled:pointer-events-none"
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

            {/* Preview / Outcome Side */}
            <div className="space-y-6">
              <div className="rounded-[24px] border border-black/[0.05] bg-white/40 p-6 backdrop-blur-sm">
                <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#171513] mb-5">Diagnosis Outcome</h3>
                <div className="grid grid-cols-2 gap-3">
                  <OutcomePreviewCard 
                    icon={User} 
                    label="Founder Signal" 
                    colorClass="bg-[#f5f0ff] text-[#8b5cf6]" 
                    delay={0.2}
                  />
                  <OutcomePreviewCard 
                    icon={Lightbulb} 
                    label="Startup Clarity" 
                    colorClass="bg-[#f0f7ff] text-[#60a5fa]" 
                    delay={0.3}
                  />
                  <OutcomePreviewCard 
                    icon={FileUp} 
                    label="Pitch Readiness" 
                    colorClass="bg-[#fff5f0] text-[#ff6b3d]" 
                    delay={0.4}
                  />
                  <OutcomePreviewCard 
                    icon={Target} 
                    label="Opportunity Radar" 
                    colorClass="bg-[#f0fff4] text-[#22c55e]" 
                    delay={0.5}
                  />
                </div>

                <div className="mt-8 rounded-[16px] bg-[#171513]/[0.02] p-4 border border-black/[0.04]">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#8b8276] mb-2">
                    <Zap className="size-3 text-[#ff6b3d]" />
                    Instant Synthesis
                  </div>
                  <p className="text-[12px] leading-[1.6] text-[#6f685f]">
                    Our engine compares your data against patterns from 100+ global accelerators and top-tier VCs.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[12px] text-[#8b8276]">
                  Takes ~3 minutes. No account required to start.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
