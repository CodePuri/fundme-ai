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
    <ClerkProvider>
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
