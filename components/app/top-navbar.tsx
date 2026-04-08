"use client";

import Link from "next/link";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { Button } from "@/components/ui/button";

export function TopNavbar({
  rightSlot,
  className = "",
}: {
  rightSlot?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur ${className}`}>
      <div className="page-frame flex items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:px-8">
        <Link className="flex items-center gap-3" href="/">
          <BrandLockup />
        </Link>

        <div className="flex items-center gap-2">
          {rightSlot ?? (
            <>
              <Link href="/">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="secondary">Get Started →</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
