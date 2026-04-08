import { Suspense } from "react";

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
        <Suspense
          fallback={
            <div className="editorial-panel rounded-[24px] px-4 py-10 text-sm text-[#6d665e]">
              Loading startup programs…
            </div>
          }
        >
          <StartupProgramsPage
            description="Search accelerators, incubators, fellowships, and equity-free programs by thesis, geography, stage, and check profile."
            mode="public"
            title="Startup Programs"
          />
        </Suspense>
      </SearchShell>
      <Suspense fallback={null}>
        <PublicAuthController
          fallbackIntent={{
            action: "browse",
            destination: "/app/matches",
          }}
        />
      </Suspense>
    </>
  );
}
