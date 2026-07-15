import type { Metadata } from "next";

import { GrillClient } from "./grill-client";

export const metadata: Metadata = {
  title: "Funding Grill Preview | Fundme",
  description:
    "Stress-test your founder profile, startup evidence, and pitch deck with Fundme's deterministic Funding Readiness rubric.",
  robots: { index: false, follow: false },
};

export default function GrillPage() {
  return <GrillClient />;
}
