import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Sparkles, Share2, Copy } from "lucide-react";
import { getPublicShareReport } from "@/lib/assessment/share";
import { ScoreRing } from "@/components/assessment/funding-readiness-report";
import { Button } from "@/components/ui/button";
import { PublicShareCard } from "./share-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const report = await getPublicShareReport(shareToken);

  if (!report) {
    return {
      title: "Funding Readiness Assessment — FundMe",
      description: "Get assessed before you apply to investors.",
    };
  }

  const title = `${report.startupName} Funding Readiness: ${report.readinessScore}/100 — FundMe`;
  const description = `${report.verdict} — ${report.conciseVerdict}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "FundMe",
      images: [
        {
          url: "/fundme-logo.png",
          width: 800,
          height: 600,
          alt: "FundMe Funding Readiness Report",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const report = await getPublicShareReport(shareToken);

  if (!report) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[880px]">
        {/* Header navigation */}
        <header className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--foreground)]">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--foreground)] text-xs text-white">
              F
            </div>
            FundMe
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
              Verified Diagnosis
            </span>
            <Link href={`/assessment?ref=${report.referralCode}`}>
              <Button size="sm" className="hidden text-xs sm:inline-flex">
                Get Assessed Free
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Share Card Component */}
        <PublicShareCard report={report} />

        {/* Footer CTA */}
        <footer className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 text-center shadow-xs sm:p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            See what investors will question about your startup
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--text-secondary)]">
            Add the founder context and pitch deck you already have. Get a deterministic score, evidence analysis, and actionable next steps in 2 minutes.
          </p>
          <div className="mt-5 flex justify-center">
            <Link href={`/assessment?ref=${report.referralCode}`}>
              <Button size="lg" className="gap-2 px-6">
                Start your free assessment
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-xs text-[var(--text-secondary)]">
            No credit card required · Instant evidence-backed diagnosis
          </p>
        </footer>
      </div>
    </div>
  );
}
