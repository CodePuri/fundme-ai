"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Flame, LoaderCircle } from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { Button } from "@/components/ui/button";
import { ONBOARDING_DRAFT_KEY } from "@/components/app/demo-provider";

type DraftData = {
  name?: string;
  companyName?: string;
  notes?: string;
  linkedIn?: string;
  websiteUrl?: string;
  xUrl?: string;
  files?: string[];
};

export default function RoastPage() {
  const router = useRouter();
  const [roast, setRoast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);
    let draft: DraftData = {};
    if (raw) {
      try {
        draft = JSON.parse(raw) as DraftData;
      } catch {
        // ignore malformed draft
      }
    }

    fetch("/api/roast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        companyName: draft.companyName,
        notes: draft.notes,
        linkedInUrl: draft.linkedIn,
        websiteUrl: draft.websiteUrl,
        xUrl: draft.xUrl,
        files: draft.files ?? [],
      }),
    })
      .then((res) => res.json())
      .then((data: { roast?: string }) => {
        setRoast(data.roast ?? "We couldn't complete the roast right now. Consider that a brief mercy — it won't last.");
        setLoading(false);
      })
      .catch(() => {
        setRoast("We couldn't complete the roast right now. Consider that a brief mercy — it won't last.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
        <div className="mb-10">
          <BrandLockup />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff5f0] border border-[#ff6b3d]/10 text-[#ff6b3d] text-[12px] font-bold uppercase tracking-wider">
            <LoaderCircle className="size-3 animate-spin" /> Sharpening the knives...
          </div>
          <p className="text-[15px] text-black/30 max-w-[280px] text-center">
            Our AI is reading everything you submitted. Brace yourself.
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Top brand */}
      <div className="flex items-center justify-center pt-10 pb-6 px-6">
        <BrandLockup />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 pb-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[680px] flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff5f0] border border-[#ff6b3d]/10 text-[#ff6b3d] text-[12px] font-bold uppercase tracking-wider mb-6"
          >
            <Flame className="size-3" /> Your deck, destroyed
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-[40px] sm:text-[48px] font-semibold tracking-[-0.04em] leading-[1.1] text-black mb-10"
          >
            We read everything.<br />Here&apos;s the truth.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full text-left rounded-[24px] border border-black/[0.08] bg-black/[0.015] p-8 sm:p-10"
          >
            <p className="text-[16px] sm:text-[17px] text-black leading-[1.75] whitespace-pre-wrap">
              {roast}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t border-black/5 px-6 py-5 flex justify-center">
        <Button
          onClick={() => router.push("/thank-you")}
          size="lg"
          className="h-14 px-12 rounded-full text-[16px] font-bold bg-[#ff6b3d] border-[#ff6b3d] text-white shadow-xl shadow-[#ff6b3d]/20 hover:bg-[#e85a2d] hover:border-[#e85a2d]"
        >
          Fix my deck →
        </Button>
      </div>
    </main>
  );
}
