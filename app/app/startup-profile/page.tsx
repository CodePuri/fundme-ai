"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const fields: Array<{ key: keyof ReturnType<typeof useDemo>["state"]["startupProfile"]; label: string; multiline?: boolean }> = [
  { key: "companyName", label: "Company name" },
  { key: "tagline", label: "Tagline" },
  { key: "stage", label: "Stage" },
  { key: "sector", label: "Sector" },
  { key: "location", label: "Location" },
  { key: "teamSize", label: "Team size" },
  { key: "traction", label: "Traction", multiline: true },
  { key: "problem", label: "Problem", multiline: true },
  { key: "solution", label: "Solution", multiline: true },
  { key: "businessModel", label: "Business model", multiline: true },
  { key: "competitiveEdge", label: "Competitive edge", multiline: true },
  { key: "fundraisingAsk", label: "Fundraising ask", multiline: true },
  { key: "useOfFunds", label: "Use of funds", multiline: true },
];

export default function StartupProfilePage() {
  const { state, updateStartupField } = useDemo();
  const profile = state.startupProfile;

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">Generated profile</div>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold">
            Startup Profile
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/56">
            This profile is presented as AI-extracted from your uploaded material, but every field
            is editable so the founder can tighten the story before applying.
          </p>
        </div>
        <Link href="/app/founder-profile">
          <Button>
            View Founder Profile
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel rounded-[32px] p-6">
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map(({ key, label, multiline }) => (
              <div className={multiline ? "md:col-span-2" : ""} key={String(key)}>
                <div className="mb-2 text-sm text-white/52">{label}</div>
                {multiline ? (
                  <Textarea
                    onChange={(event) => updateStartupField(key as never, event.target.value)}
                    value={String(profile[key])}
                  />
                ) : (
                  <Input
                    onChange={(event) => updateStartupField(key as never, event.target.value)}
                    value={String(profile[key])}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-[32px] p-6">
            <div className="text-sm text-white/52">Uploaded inputs</div>
            <div className="mt-4 flex flex-wrap gap-3">
              {profile.uploadedAssets.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-amber-300/18 bg-amber-300/[0.04] p-6">
            <div className="flex items-center gap-3 text-amber-100">
              <AlertTriangle className="size-4" />
              Missing information
            </div>
            <div className="mt-4 space-y-3">
              {profile.missingInfo.map((item) => (
                <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-white/72" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <div className="text-sm text-white/52">Extraction confidence</div>
            <div className="mt-4 text-4xl font-semibold text-cyan-200">94%</div>
            <p className="mt-3 text-sm leading-7 text-white/55">
              The startup wedge, founder history, and market narrative appear consistently across
              uploaded materials and previous YC answers.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
