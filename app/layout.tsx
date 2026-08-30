import { Suspense } from "react";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import type { Metadata } from "next";
import { Toaster } from "sonner";

import "./globals.css";

import { DemoProvider } from "@/components/app/demo-provider";

import { AssessmentProvider } from "@/components/assessment/assessment-provider";
import { RouteClerkProvider } from "@/components/providers/route-clerk-provider";

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
    <RouteClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Geist+Sans:wght@400;500;600;700&family=Cormorant+Garamond:wght@500;600;700&family=Instrument+Serif:ital@0;1&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />
        </head>
        <body className="font-[family-name:var(--font-sans)]">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "Fundme",
                "url": "https://tryfundme.in",
                "description": "Assess your startup profile, pitch direction, and funding readiness before applying to accelerators, grants, credits, and founder programs.",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "All",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              })
            }}
          />
          <Suspense fallback={null}><PostHogProvider><GoogleAnalytics /></PostHogProvider></Suspense>
          <DemoProvider>
            <AssessmentProvider>
              {children}
            </AssessmentProvider>
            <Toaster position="top-right" theme="light" />
          </DemoProvider>
        </body>
      </html>
    </RouteClerkProvider>
  );
}
