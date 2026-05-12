"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { ONBOARDING_DRAFT_KEY } from "@/components/app/demo-provider";

export default function ThankYouPage() {
  const { user } = useUser();
  const [draftData, setDraftData] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (saved) {
        setDraftData(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const firstName = user?.firstName ?? user?.fullName?.split(" ")[0] ?? draftData?.name?.split(" ")[0] ?? null;
  const resolvedEmail = user?.emailAddresses?.[0]?.emailAddress ?? draftData?.email ?? "your submitted email";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-[520px] w-full"
      >
        <div className="mb-10">
          <BrandLockup />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
          className="flex size-20 items-center justify-center rounded-full bg-[#fff5f0] border border-[#ff6b3d]/10 mb-8"
        >
          <CheckCircle2 className="size-9 text-[#ff6b3d]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff5f0] border border-[#ff6b3d]/10 text-[#ff6b3d] text-[12px] font-bold uppercase tracking-wider mb-6"
        >
          <Sparkles className="size-3" /> Assessment Scheduled
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-[40px] sm:text-[48px] font-semibold tracking-[-0.04em] leading-[1.1] text-black"
        >
          {firstName ? `Thanks, ${firstName}!` : "Intake Successful!"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4 }}
          className="mt-6 text-[18px] text-black/50 leading-relaxed max-w-[420px]"
        >
          We&apos;ve securely stored your assessment profile. Our advisory team will evaluate your deck and startup roadmap shortly.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="mt-10 text-[13px] text-black/30 font-medium"
        >
          Updates will be routed to <span className="text-black/60 underline decoration-black/10 underline-offset-4">{resolvedEmail}</span>
        </motion.p>
      </motion.div>
    </main>
  );
}
