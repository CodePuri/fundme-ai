import Link from "next/link";
import { BrandLockup } from "@/components/ui/brand-lockup";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#eee3d6] px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center text-center max-w-[520px] w-full bg-[#f6f1ea] p-8 rounded-[28px] border border-black/10 shadow-[0_20px_50px_rgba(18,15,11,0.06)]">
        <div className="mb-8">
          <BrandLockup />
        </div>
        
        <h1 className="text-[32px] sm:text-[42px] font-semibold tracking-[-0.04em] leading-[1.1] text-[#171513]">
          Page not found.
        </h1>
        
        <p className="mt-4 sm:mt-6 text-[15px] sm:text-[16px] text-[#645d54] leading-relaxed max-w-[460px]">
          This Fundme page does not exist yet.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#171513] hover:bg-[#2a2622] transition-colors text-[14px] font-medium text-white min-w-[140px]"
          >
            Back to home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#fff8f1] border border-[#efcdb9] hover:bg-[#fcebde] transition-colors text-[14px] font-medium text-[#b15d37] min-w-[140px]"
          >
            Explore programs
          </Link>
        </div>
      </div>
    </main>
  );
}
