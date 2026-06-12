import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Free Assessment | Fundme",
  description: "Stop pitching blind. Get your founder profile and startup context assessed before applying to accelerators.",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
