"use client";

import type { ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Compass,
  FilePenLine,
  LayoutDashboard,
  PlusCircle,
  Settings2,
  Sparkles,
  UserRound,
} from "lucide-react";

import { useDemo } from "@/components/app/demo-provider";
import { BrandLockup } from "@/components/ui/brand-lockup";
import { cn } from "@/lib/utils";

type SidebarItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  tracker?: boolean;
  reset?: boolean;
};

const sections: Array<{ label: string; items: SidebarItem[] }> = [
  {
    label: "Workspace",
    items: [
      { href: "/onboarding", label: "Add New Idea", icon: PlusCircle, reset: true },
      { href: "/app/startup-profile", label: "Startup Profile", icon: Building2 },
      { href: "/app/founder-profile", label: "Founder Profile", icon: UserRound },
    ],
  },
  {
    label: "Opportunities",
    items: [
      { href: "/app/matches", label: "Matches", icon: Sparkles },
      { href: "/explore", label: "Explore", icon: Compass },
      { href: "/app/applications", label: "Applications", icon: FilePenLine },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/app/tracker", label: "Tracker", icon: LayoutDashboard, tracker: true },
      { href: "/app/settings", label: "Settings", icon: Settings2 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, startNewIdea } = useDemo();

  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] flex-col border-r border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-5 lg:flex">
      <button className="flex items-center gap-3 rounded-[10px] px-2 py-2 text-left" onClick={() => router.push("/app/matches")} type="button">
        <BrandLockup />
      </button>

      <div className="mt-8 flex flex-col gap-6">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="px-3 text-[11px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
              {section.label}
            </div>
            <nav className="mt-2 flex flex-col gap-1">
              {section.items.map(({ href, label, icon: Icon, tracker, reset }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-[10px] border px-3 py-2.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-ring-offset)]",
                      "border-transparent text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]",
                      active && "border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm",
                    )}
                    key={href}
                    onClick={() => {
                      if (reset) {
                        startNewIdea();
                      }
                      router.push(href);
                    }}
                    type="button"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="size-3.5" />
                      <span>{label}</span>
                    </span>
                    {tracker && state.trackerNotificationVisible ? (
                      <span className="size-1.5 rounded-full bg-amber-400" />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-[var(--border)] pt-4">
        <div className="rounded-[12px] bg-[var(--surface)] px-3 py-3">
          <div className="text-[13px] font-medium text-[var(--text-primary)]">{state.founderProfile?.name || "Aakash Puri"}</div>
          <div className="mt-1 text-[12px] text-[var(--text-muted)]">{state.startupProfile?.companyName || "Totem Interactive"}</div>
        </div>
      </div>
    </aside>
  );
}
