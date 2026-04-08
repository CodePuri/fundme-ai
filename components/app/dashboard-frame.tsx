"use client";

import { Suspense, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { useDemo } from "@/components/app/demo-provider";
import { Sidebar } from "@/components/app/sidebar";
import { NavSearch } from "@/components/startup-programs/nav-search";
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
  const { state, markTrackerVisited } = useDemo();

  useEffect(() => {
    if (state.isAuthenticated || pathname === "/search") {
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
  }, [pathname, router, state.isAuthenticated]);

  useEffect(() => {
    if (pathname === "/app/tracker") {
      markTrackerVisited();
    }
  }, [markTrackerVisited, pathname]);

  const pageTitle = useMemo(
    () => pageTitles.find((item) => item.match(pathname))?.title ?? "Fundme.ai",
    [pathname],
  );

  if (!state.isAuthenticated) {
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
                {pageTitle}
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

        <main className="page-frame min-h-[calc(100vh-73px)] px-4 py-6 sm:px-6 xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
