"use client";

import { useState } from "react";
import Link from "next/link";
import { Mic, Sparkles } from "lucide-react";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Panel, PanelBody, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

type StartupFieldConfig = {
  key:
    | "companyName"
    | "tagline"
    | "stage"
    | "sector"
    | "location"
    | "problem"
    | "solution"
    | "traction"
    | "businessModel"
    | "fundraisingAsk"
    | "useOfFunds";
  label: string;
  multiline?: boolean;
};

const sections: Array<{ title: string; fields: StartupFieldConfig[] }> = [
  {
    title: "Core Identity",
    fields: [
      { key: "companyName", label: "Name" },
      { key: "tagline", label: "Tagline" },
      { key: "stage", label: "Stage" },
      { key: "sector", label: "Sector" },
      { key: "location", label: "Location" },
    ],
  },
  {
    title: "Problem & Solution",
    fields: [
      { key: "problem", label: "Problem", multiline: true },
      { key: "solution", label: "Solution", multiline: true },
    ],
  },
  {
    title: "Traction & Model",
    fields: [
      { key: "traction", label: "Traction", multiline: true },
      { key: "businessModel", label: "Model", multiline: true },
      { key: "fundraisingAsk", label: "Ask" },
      { key: "useOfFunds", label: "Use of funds", multiline: true },
    ],
  },
];

const quickFillData = {
  companyName: "Flowstate AI",
  tagline: "Real-time contract intelligence for agencies.",
  stage: "Pre-seed",
  sector: "B2B SaaS / LegalTech",
  location: "Mumbai, India",
  problem:
    "Agencies lose revenue from untracked scope creep because client requests expand in calls, email, and chat long before anyone updates the contract.",
  solution:
    "Flowstate AI detects scope creep in real time, quantifies impact, and auto-generates change orders before agencies ship free work.",
  traction:
    "87 signups, 3 active pilots, and $2,400/month in recovered revenue in the first 30 days.",
  businessModel: "SaaS at $299/month per agency.",
  fundraisingAsk: "$500K pre-seed",
  useOfFunds: "Product (60%), Sales (25%), Ops (15%)",
} satisfies Record<string, string>;

const voiceMock =
  "We built Flowstate AI after losing real agency margin to hidden scope creep. We catch the exact moment scope expands, measure the impact, and generate the paperwork needed to recover the revenue.";

export default function StartupProfilePage() {
  const { state, updateStartupField } = useDemo();
  const [listening, setListening] = useState(false);
  const [filling, setFilling] = useState(false);
  const [ramble, setRamble] = useState("");

  async function runQuickFill() {
    if (filling) {
      return;
    }

    setFilling(true);
    for (const [fieldIndex, [field, value]] of Object.entries(quickFillData).entries()) {
      await new Promise((resolve) => setTimeout(resolve, fieldIndex === 0 ? 0 : 350));
      let typed = "";
      for (const character of value) {
        typed += character;
        updateStartupField(field as keyof typeof quickFillData & keyof typeof state.startupProfile, typed);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
    }
    setFilling(false);
  }

  async function handleVoiceMock() {
    if (listening || filling) {
      return;
    }

    setListening(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setRamble(voiceMock);
    setListening(false);
    await runQuickFill();
  }

  return (
    <PageShell>
      <div>
        <div className="eyebrow">Your Startup</div>
        <h1 className="mt-3 text-[38px] font-semibold leading-none tracking-[-0.04em] text-[var(--text-primary)]">
          Your Startup
        </h1>
        <p className="mt-4 max-w-[760px] text-[14px] leading-7 text-[var(--text-muted)]">
          Built from your uploaded material. Edit anything. This powers your matches and drafts.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge size="sm">Extracted from uploaded materials</Badge>
        {state.startupProfile.uploadedAssets.map((asset) => (
          <Badge key={asset} size="sm">
            {asset}
          </Badge>
        ))}
      </div>

      <div className="rounded-[12px] border border-amber-400/18 bg-amber-400/10 p-4">
        <div className="text-[13px] font-medium text-amber-300">Missing information</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {state.startupProfile.missingInfo.map((item) => (
            <Badge key={item} size="sm" tone="amber">
              {item}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <Panel key={section.title}>
              <PanelHeader className="block">
                <PanelTitle>{section.title}</PanelTitle>
              </PanelHeader>
              <PanelBody className="grid gap-4 md:grid-cols-2">
                {section.fields.map((field) => (
                  <Field className={field.multiline ? "md:col-span-2" : ""} key={field.key}>
                    <FieldLabel>{field.label}</FieldLabel>
                    {field.multiline ? (
                      <Textarea
                        onChange={(event) =>
                          updateStartupField(
                            field.key as keyof typeof state.startupProfile,
                            event.target.value,
                          )
                        }
                        value={String(state.startupProfile[field.key as keyof typeof state.startupProfile])}
                      />
                    ) : (
                      <Input
                        onChange={(event) =>
                          updateStartupField(
                            field.key as keyof typeof state.startupProfile,
                            event.target.value,
                          )
                        }
                        value={String(state.startupProfile[field.key as keyof typeof state.startupProfile])}
                      />
                    )}
                  </Field>
                ))}
              </PanelBody>
            </Panel>
          ))}
        </div>

        <div className="sticky top-28 h-fit rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[18px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                Tell us more
              </div>
              <div className="mt-2 text-[14px] leading-7 text-[var(--text-muted)]">
                Just talk. We&apos;ll fill in the details.
              </div>
            </div>
            <button
              aria-label="Use voice mock"
              className={`relative flex size-10 items-center justify-center rounded-full border ${
                listening
                  ? "border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]"
                  : "border-[var(--border)] text-[var(--text-muted)]"
              }`}
              onClick={handleVoiceMock}
              type="button"
            >
              {listening ? (
                <div className="absolute inset-[-10px] flex items-center justify-center gap-1">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <span
                      className="w-1 animate-pulse rounded-full bg-[var(--button-primary-text)]/50"
                      key={index}
                      style={{ height: `${8 + (index % 3) * 6}px`, animationDelay: `${index * 70}ms` }}
                    />
                  ))}
                </div>
              ) : null}
              <Mic className={listening ? "animate-pulse" : ""} />
            </button>
          </div>

          <Textarea
            className="mt-5 min-h-[180px] bg-transparent text-[var(--text-primary)]"
            onChange={(event) => setRamble(event.target.value)}
            placeholder="Talk through the problem, traction, product, and why now."
            value={ramble}
          />

          <Button className="mt-5 w-full" onClick={runQuickFill} variant="ghost">
            {filling ? "Filling from voice note..." : "Fill from voice note"}
          </Button>

          <div className="mt-5 rounded-[12px] border border-[var(--border)] bg-[var(--bg)]/20 p-4">
            <div className="flex items-center gap-2 text-[13px] text-[var(--text-primary)]">
              <Sparkles className="size-4" />
              Structured extraction
            </div>
            <p className="mt-3 text-[14px] leading-7 text-[var(--text-muted)]">
              The strongest narrative remains consistent: agencies lose money to scope creep, and
              Flowstate catches the moment nobody else owns.
            </p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <Link href="/app/matches">
          <Button size="lg">See My Matches →</Button>
        </Link>
      </div>
    </PageShell>
  );
}
