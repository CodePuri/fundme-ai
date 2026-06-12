import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

import "./globals.css";

import { DemoProvider } from "@/components/app/demo-provider";

import { AssessmentProvider } from "@/components/assessment/assessment-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://tryfundme.in"),
  title: "Fundme — Get assessed before you apply",
  description:
    "Assess your startup profile, pitch direction, and funding readiness before applying to accelerators, grants, credits, and founder programs.",
  openGraph: {
    title: "Fundme — Get assessed before you apply",
    description:
      "Assess your startup profile, pitch direction, and funding readiness before applying to accelerators, grants, credits, and founder programs.",
    url: "https://tryfundme.in",
    siteName: "Fundme",
    images: [
      {
        url: "/og/fundme-og.png",
        width: 1200,
        height: 630,
        alt: "Fundme — Stop pitching blind. Get assessed before you apply.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fundme — Get assessed before you apply",
    description:
      "Assess your startup profile, pitch direction, and funding readiness before applying to accelerators, grants, credits, and founder programs.",
    images: ["/og/fundme-og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          formButtonPrimary: "bg-[#171513] hover:bg-[#2a2622] text-[14px] font-medium normal-case shadow-none",
          card: "shadow-[0_20px_50px_rgba(18,15,11,0.06)] border border-black/8 rounded-[28px] bg-white",
          headerTitle: "text-[#171513] font-semibold tracking-[-0.03em] text-[24px]",
          headerSubtitle: "text-[#645d54] text-[15px]",
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className="font-[family-name:var(--font-sans)]">
          <DemoProvider>
            <AssessmentProvider>
              {children}
            </AssessmentProvider>
            <Toaster position="top-right" theme="light" />
          </DemoProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
