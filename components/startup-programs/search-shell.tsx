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
      <header className="border-b border-black/8 bg-[#f6f1ea]/94 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center xl:px-8">
          <Link className="shrink-0" href="/">
            <BrandLockup />
          </Link>
          <div className="min-w-0 flex-1">{headerContent}</div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 xl:px-8">{children}</main>
    </div>
  );
}
