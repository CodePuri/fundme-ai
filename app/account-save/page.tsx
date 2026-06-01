"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";

function AccountSaveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submissionId");
  const [hasStored, setHasStored] = useState(false);

  useEffect(() => {
    if (submissionId && !hasStored) {
      window.localStorage.setItem("fundme_submission_id_to_link", submissionId);
      setHasStored(true);
    }
  }, [submissionId, hasStored]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[480px] bg-white border border-black/5 rounded-2xl p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-[#ebfbf3] rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-[#00b050]" />
        </div>
        
        <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.04em] leading-[1.1] text-black mb-2">
          Save your assessment
        </h1>
        
        <p className="text-[13px] sm:text-[14px] text-[#00b050] font-medium tracking-tight mb-4">
          Your submission has already been received.
        </p>

        <p className="text-[15px] sm:text-[16px] text-black/60 leading-snug max-w-[360px] mb-8">
          Save your information so you can return to Fundme when your assessment is ready.
        </p>

        <div className="w-full flex flex-col gap-3">
          <SignUpButton mode="modal" fallbackRedirectUrl="/thank-you" forceRedirectUrl="/thank-you">
            <button className="w-full h-12 bg-black hover:bg-black/80 text-white rounded-[12px] sm:rounded-full font-medium text-[15px] transition-all flex items-center justify-center group">
              Save my information <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </SignUpButton>
        </div>

        <div className="mt-8 pt-6 border-t border-black/5 w-full">
          <Link 
            href="/" 
            className="text-[13px] text-black/40 hover:text-black/80 font-medium transition-colors"
          >
            Lose your progress
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AccountSavePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#ff6b3d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AccountSaveContent />
    </Suspense>
  );
}
