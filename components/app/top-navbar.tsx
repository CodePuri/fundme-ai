"use client";

import Link from "next/link";
import { Search } from "lucide-react";

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
    <div className={`border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur ${className}`} data-theme="public">
      <div className="page-frame flex items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:px-8">
        <Link className="flex items-center gap-3" href="/">
          <BrandLockup surface="plate" />
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/search">
            <Button variant="ghost">
              <Search className="size-4" />
              Search
            </Button>
          </Link>
          {rightSlot ?? (
            <>
              <Link href="/">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/app/matches?auth=1">
                <Button variant="secondary">Get Started →</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
