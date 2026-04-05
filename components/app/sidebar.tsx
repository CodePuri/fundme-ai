"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
  Cog,
  FilePenLine,
  FolderUp,
  LayoutDashboard,
  Sparkles,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app/upload", label: "Upload", icon: FolderUp },
  { href: "/app/startup-profile", label: "Startup Profile", icon: Building2 },
  { href: "/app/founder-profile", label: "Founder Profile", icon: UserRound },
  { href: "/app/matches", label: "Matches", icon: Sparkles },
  { href: "/app/programs/yc-w26", label: "YC Detail", icon: BriefcaseBusiness },
  { href: "/app/workspace/yc-w26", label: "Application", icon: FilePenLine },
  { href: "/app/tracker", label: "Tracker", icon: LayoutDashboard },
  { href: "/app/settings", label: "Settings", icon: Cog },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-white/10 bg-[#0a0c12]/90 px-5 py-6 lg:flex">
      <Link className="group flex items-center gap-3" href="/">
        <div className="flex size-10 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
          F
        </div>
        <div>
          <div className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            Fundme.ai
          </div>
          <div className="text-xs text-white/45">Founder workflow engine</div>
        </div>
      </Link>

      <div className="mt-10 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/60 transition hover:-translate-y-0.5 hover:bg-white/6 hover:text-white",
                active && "bg-white/8 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
              )}
              href={href}
              key={href}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
        <div className="text-xs uppercase tracking-[0.24em] text-white/35">Demo mode</div>
        <p className="mt-3 text-sm leading-6 text-white/65">
          All intelligence, Gmail sync, and profile extraction are intentionally mocked for a clean
          pitch-worthy workflow.
        </p>
      </div>
    </aside>
  );
}
