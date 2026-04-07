"use client";

import type { ComponentType } from "react";
import Link from "next/link";
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
    <aside className="sticky top-0 hidden h-screen w-[248px] flex-col border-r border-zinc-900 bg-black px-4 py-5 lg:flex">
      <Link className="flex items-center gap-3 rounded-[10px] px-2 py-2" href="/">
        <BrandLockup surface="plate" />
      </Link>

      <div className="mt-8 flex flex-col gap-6">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="px-3 text-[11px] uppercase tracking-[0.14em] text-zinc-600">
              {section.label}
            </div>
            <nav className="mt-2 flex flex-col gap-1">
              {section.items.map(({ href, label, icon: Icon, tracker, reset }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-r-xl border-l-2 border-transparent px-3 py-2.5 text-[13px] text-zinc-500 transition-colors",
                      "hover:bg-zinc-950 hover:text-white",
                      active && "border-l-white bg-zinc-950 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]",
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

      <div className="mt-auto border-t border-zinc-900 pt-4">
        <div className="rounded-[12px] bg-zinc-950 px-3 py-3">
          <div className="text-[13px] font-medium text-white">Arjun Mehta</div>
          <div className="mt-1 text-[12px] text-zinc-500">Flowstate AI</div>
        </div>
      </div>
    </aside>
  );
}
