"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

import { AssessmentProvider } from "@/components/assessment/assessment-provider";
import { DemoProvider } from "@/components/app/demo-provider";
import { isGrillPublicPath } from "@/lib/grill/public-routes";

export function RouteAppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isGrillPublicPath(pathname)) {
    return (
      <>
        {children}
        <Toaster position="top-right" theme="light" />
      </>
    );
  }

  return (
    <DemoProvider>
      <AssessmentProvider>{children}</AssessmentProvider>
      <Toaster position="top-right" theme="light" />
    </DemoProvider>
  );
}
