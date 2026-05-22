import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

import "./globals.css";

import { DemoProvider } from "@/components/app/demo-provider";

export const metadata: Metadata = {
  title: "Fundme — Get assessed before you apply",
  description:
    "Fundme helps founders assess their startup profile, pitch direction, and funding readiness before applying to accelerators, grants, credits, and founder programs.",
  openGraph: {
    title: "Fundme — Get assessed before you apply",
    description:
      "Fundme helps founders assess their startup profile, pitch direction, and funding readiness before applying to accelerators, grants, credits, and founder programs.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-[family-name:var(--font-sans)]">
          <DemoProvider>
            {children}
            <Toaster position="top-right" theme="light" />
          </DemoProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
