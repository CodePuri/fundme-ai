import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLockup } from "@/components/ui/brand-lockup";

export function SearchShell({
  headerContent,
  children,
}: {
  headerContent: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f1ea] text-[#111111]" data-theme="public">
      <header className="border-b border-black/8 bg-[#f6f1ea]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between xl:px-8">
          <div className="flex items-center gap-4 lg:w-auto">
            <Link className="shrink-0" href="/">
              <BrandLockup />
            </Link>
          </div>
          <div className="min-w-0 flex-1 lg:max-w-[700px]">{headerContent}</div>
          <div className="hidden shrink-0 lg:block">
            <Link
              className="rounded-full bg-[#171513] px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-[#2a2622]"
              href="/grill"
              style={{ color: "#ffffff" }}
            >
              Get assessed first
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 xl:px-8">{children}</main>
    </div>
  );
}
