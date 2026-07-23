"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CircleUserRound, X } from "lucide-react";

import { ONBOARDING_STEP_KEY, useDemo } from "@/components/app/demo-provider";
import { Sidebar } from "@/components/app/sidebar";
import { NavSearch } from "@/components/startup-programs/nav-search";
import { BrandLockup } from "@/components/ui/brand-lockup";
import { buildAuthEntryHref } from "@/lib/auth-intent";

const pageTitles: Array<{ match: (pathname: string) => boolean; title: string }> = [
  { match: (pathname) => pathname === "/app/startup-profile", title: "Your Startup" },
  { match: (pathname) => pathname === "/app/founder-profile", title: "Your Profile" },
  { match: (pathname) => pathname === "/app/matches", title: "Your Matches" },
  { match: (pathname) => pathname === "/explore", title: "All Programs" },
  { match: (pathname) => pathname === "/app/applications", title: "Applications" },
  { match: (pathname) => pathname === "/app/tracker", title: "Tracker" },
  { match: (pathname) => pathname === "/app/settings", title: "Settings" },
  { match: (pathname) => pathname.startsWith("/app/workspace/"), title: "Application Workspace" },
  { match: (pathname) => pathname.startsWith("/app/programs/"), title: "Program Details" },
];

function buildProtectedDestination(pathname: string, search: string) {
  return search ? `${pathname}${search}` : pathname;
}

export function DashboardFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, hasHydrated, dismissResumeBanner, markTrackerVisited } = useDemo();

  useEffect(() => {
    if (!hasHydrated || state.isAuthenticated || pathname === "/search" || pathname === "/app/preview") {
      return;
    }

    const liveSearch =
      typeof window === "undefined" ? "" : window.location.search;
    const destination = buildProtectedDestination(pathname, liveSearch);
    const entryPath = pathname === "/explore" ? "/search" : "/";
    const entryParams =
      entryPath === "/search"
        ? new URLSearchParams(liveSearch.replace(/^\?/, ""))
        : new URLSearchParams();
    const href = buildAuthEntryHref({
      entryPath,
      entryParams,
      intent: {
        action: "default",
        destination,
      },
    });
    router.replace(href);
  }, [hasHydrated, pathname, router, state.isAuthenticated]);

  useEffect(() => {
    if (pathname === "/app/tracker") {
      markTrackerVisited();
    }
  }, [markTrackerVisited, pathname]);

  const pageTitle = useMemo(
    () => pageTitles.find((item) => item.match(pathname))?.title ?? "Fundme.ai",
    [pathname],
  );

  const resumeStep =
    hasHydrated && typeof window !== "undefined" ? window.localStorage.getItem(ONBOARDING_STEP_KEY) : null;
  const showResumeBanner =
    hasHydrated && !state.resumeBannerDismissed && (resumeStep === "2" || resumeStep === "3");

  if (pathname === "/app/preview") {
    return (
      <div className="min-h-screen bg-[#f6f1ea] text-[#171513]" data-theme="public">
        <header className="sticky top-0 z-30 border-b border-black/8 bg-[#f6f1ea]/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link aria-label="FundMe home" href="/"><BrandLockup size="sm" /></Link>
            <div className="flex items-center gap-2">
              <Link className="hidden text-xs font-semibold text-[#6f685f] hover:text-[#171513] sm:block" href="/assessment/result">Assessment</Link>
              <Link className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold hover:border-black/20" href="/search">Explore</Link>
              <span aria-label="Preview profile" className="grid size-10 place-items-center rounded-full bg-[#171513] text-white"><CircleUserRound className="size-4" /></span>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1180px] px-4 py-7 sm:px-6 sm:py-10">{children}</main>
      </div>
    );
  }

  if (!hasHydrated || !state.isAuthenticated) {
    return <div className="min-h-screen bg-[var(--bg)]" data-theme="app" />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] lg:flex" data-theme="app">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
          <div className="page-frame flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center xl:px-8">
            <div className="flex min-w-0 items-center justify-between gap-4 lg:w-[220px] lg:flex-none">
              <div className="truncate text-[18px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                Welcome back, {state.founderProfile?.name?.split(" ")[0] || "Aakash"}
              </div>
              <div aria-label="Notifications" className="relative lg:hidden">
                <Bell className="size-5 text-[var(--text-muted)]" />
                {state.trackerNotificationVisible ? (
                  <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-amber-400" />
                ) : null}
              </div>
            </div>

            <div className="w-full lg:flex-1">
              <Suspense
                fallback={
                  <div className="app-input flex h-10 items-center rounded-[10px] px-4 text-sm text-[var(--text-muted)]">
                    Search startup programs, sectors, or themes
                  </div>
                }
              >
                <NavSearch />
              </Suspense>
            </div>

            <div aria-label="Notifications" className="relative hidden lg:block">
              <Bell className="size-5 text-[var(--text-muted)]" />
              {state.trackerNotificationVisible ? (
                <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-amber-400" />
              ) : null}
            </div>
          </div>
        </header>

        {showResumeBanner ? (
          <div className="border-b border-[var(--border)] bg-[var(--surface-elevated)]">
            <div className="page-frame flex items-center justify-between gap-4 px-4 py-3 sm:px-6 xl:px-8">
              <div className="text-[14px] text-[var(--text-muted)]">Welcome back, Arjun</div>
              <div className="flex items-center gap-3">
                <Link className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)]" href="/onboarding">
                  Continue →
                </Link>
                <button
                  aria-label="Dismiss welcome banner"
                  className="text-[var(--text-faint)] transition-colors hover:text-[var(--text-primary)]"
                  onClick={dismissResumeBanner}
                  type="button"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <main className="page-frame min-h-[calc(100vh-73px)] px-4 py-6 sm:px-6 xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
