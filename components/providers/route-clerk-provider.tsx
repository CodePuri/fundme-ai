"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

import { isGrillPublicPath } from "@/lib/grill/public-routes";

export function RouteClerkProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isGrillPublicPath(pathname)) return children;

  return (
    <ClerkProvider
      appearance={{
        layout: {
          logoImageUrl: "/fundme-logo.png",
          logoPlacement: "inside",
          socialButtonsPlacement: "bottom",
        },
        variables: {
          colorPrimary: "#ff6b3d",
          colorText: "#171513",
          fontFamily: "var(--font-sans)",
          colorBackground: "#ffffff",
        },
        elements: {
          formButtonPrimary:
            "bg-[#171513] hover:bg-[#2a2622] text-[14px] font-medium normal-case shadow-none",
          card: "shadow-[0_20px_50px_rgba(18,15,11,0.06)] border border-black/8 rounded-[28px] bg-white",
          headerTitle:
            "text-[#171513] font-semibold tracking-[-0.03em] text-[24px]",
          headerSubtitle: "text-[#645d54] text-[15px]",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
