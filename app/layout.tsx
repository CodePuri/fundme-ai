import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

import "./globals.css";

import { DemoProvider } from "@/components/app/demo-provider";

export const metadata: Metadata = {
  title: "Fundme.ai",
  description: "Founder workflow demo for startup applications.",
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
