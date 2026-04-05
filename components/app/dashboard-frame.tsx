"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Bell, X } from "lucide-react";

import { useDemo, ONBOARDING_STEP_KEY } from "@/components/app/demo-provider";
import { Sidebar } from "@/components/app/sidebar";

const pageTitles: Array<{ match: (pathname: string) => boolean; title: string }> = [
  { match: (pathname) => pathname === "/app/startup-profile", title: "Your Startup" },
  { match: (pathname) => pathname === "/app/founder-profile", title: "Your Profile" },
  { match: (pathname) => pathname === "/app/matches", title: "Your Matches" },
  { match: (pathname) => pathname === "/explore", title: "All Programs" },
  { match: (pathname) => pathname === "/app/applications", title: "In Progress" },
  { match: (pathname) => pathname === "/app/tracker", title: "Tracker" },
  { match: (pathname) => pathname === "/app/settings", title: "Settings" },
  { match: (pathname) => pathname.startsWith("/app/workspace/"), title: "Application Workspace" },
  { match: (pathname) => pathname.startsWith("/app/programs/"), title: "Program Details" },
];

export function DashboardFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, dismissResumeBanner, markTrackerVisited } = useDemo();

  useEffect(() => {
    if (pathname === "/app/tracker") {
      markTrackerVisited();
    }
  }, [markTrackerVisited, pathname]);

  const pageTitle = useMemo(() => {
    return pageTitles.find((item) => item.match(pathname))?.title ?? "Fundme.ai";
  }, [pathname]);

  const resumeStep =
    typeof window === "undefined" ? null : window.localStorage.getItem(ONBOARDING_STEP_KEY);

  const showResumeBanner =
    !state.resumeBannerDismissed && (resumeStep === "2" || resumeStep === "3");

  return (
    <div className="min-h-screen bg-black lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-zinc-900 bg-black/95 backdrop-blur">
          <div className="page-frame flex items-center justify-between px-4 py-4 sm:px-6 xl:px-8">
            <div className="text-[18px] font-semibold tracking-[-0.02em] text-white">{pageTitle}</div>
            <div aria-label="Notifications" className="relative">
              <Bell className="size-5 text-zinc-400" />
              {state.trackerNotificationVisible ? (
                <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-amber-400" />
              ) : null}
            </div>
          </div>
        </header>

        {showResumeBanner ? (
          <div className="border-b border-zinc-800 bg-zinc-900">
            <div className="page-frame flex items-center justify-between gap-4 px-6 py-3">
              <div className="text-[14px] text-zinc-300">Welcome back, Arjun</div>
              <div className="flex items-center gap-3">
                <Link className="text-[13px] text-zinc-400 hover:text-white" href="/onboarding">
                  Continue →
                </Link>
                <button
                  aria-label="Dismiss welcome banner"
                  className="text-zinc-500 transition-colors hover:text-white"
                  onClick={dismissResumeBanner}
                  type="button"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <main className="page-frame px-4 py-6 sm:px-6 xl:px-8">{children}</main>
      </div>
    </div>
  );
}
