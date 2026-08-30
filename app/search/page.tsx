import { Suspense } from "react";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Startup Programs | Fundme",
  description: "Search and filter top startup accelerators, grants, cloud credits, and fellowships. Draft your application in one click.",
};

import { PublicAuthController } from "@/components/public/public-auth-controller";
import { SearchShell } from "@/components/startup-programs/search-shell";
import { StartupProgramsPage } from "@/components/startup-programs/startup-programs-page";
import { StartupProgramsSearchBar } from "@/components/startup-programs/startup-programs-search-bar";

export default function SearchPage() {
  return (
    <>
      <SearchShell
        headerContent={
          <Suspense
            fallback={
              <div className="mx-auto h-[58px] w-full max-w-[920px] rounded-full border border-black/8 bg-white shadow-[0_18px_40px_rgba(17,17,17,0.06)]" />
            }
          >
            <StartupProgramsSearchBar className="mx-auto w-full max-w-[920px]" />
          </Suspense>
        }
      >
        
        {/* Personalized Opportunity Gate / Preview */}
        <section aria-label="Personalized Opportunity Matching" className="mb-6 rounded-[22px] border border-orange-200/80 bg-gradient-to-r from-orange-50/80 to-amber-50/50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff6b3d]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#963b1a]">
                Personalized Matching Preview
              </span>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-[var(--foreground)] sm:text-xl">
                FundMe uses your assessment to identify targeted funding opportunities
              </h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed sm:text-sm">
                Public programs below are browseable without an account. Complete your free funding fit diagnosis to unlock personalized match scores, investor thesis alignment, and tailored recommendations.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href="/assessment"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#171513] px-5 text-xs font-semibold text-white transition hover:bg-[#302d29]"
              >
                Get Assessed to Match
              </a>
            </div>
          </div>
        </section>
        <section aria-label="Opportunity categories" className="mb-7 rounded-[20px] border border-black/8 bg-white/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8d8578]">Explore by opportunity type</p>
              <p className="mt-1 text-sm text-[#4f4942]">The current public data is program-led; broader categories are Preview signposts, not live matching.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {["Investors", "Accelerators", "Incubators", "Grants/programs"].map((category) => (
                <span className="rounded-full border border-black/8 bg-[#f6f1ea] px-3 py-1.5" key={category}>{category}</span>
              ))}
            </div>
          </div>
        </section>
        <Suspense
          fallback={
            <div className="editorial-panel rounded-[24px] px-4 py-10 text-sm text-[#6d665e]">
              Loading startup programs…
            </div>
          }
        >
          <StartupProgramsPage
            description="Explore accelerators, grants, fellowships, cloud credits, and founder programs."
            mode="public"
            title="Find startup programs worth applying to"
          />
        </Suspense>
      </SearchShell>
      <Suspense fallback={null}>
        <PublicAuthController
          fallbackIntent={{
            action: "browse",
            destination: "/assessment",
          }}
        />
      </Suspense>
    </>
  );
}
