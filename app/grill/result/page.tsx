import type { Metadata } from "next";

import { ResultClient } from "./result-client";

export const metadata: Metadata = {
  title: "Funding Readiness Report | Fundme",
  description: "Your locally stored Fundme Funding Readiness Grill report.",
  robots: { index: false, follow: false },
};

export default function GrillResultPage() {
  return <ResultClient />;
}
