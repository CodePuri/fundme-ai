import type { Metadata } from "next";
import { Toaster } from "sonner";

import "./globals.css";

import { DemoProvider } from "@/components/app/demo-provider";

export const metadata: Metadata = {
  title: "Fundme.ai",
  description: "Founder workflow demo for startup applications.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-[family-name:var(--font-sans)]">
        <DemoProvider>
          {children}
          <Toaster position="top-right" theme="dark" />
        </DemoProvider>
      </body>
    </html>
  );
}
