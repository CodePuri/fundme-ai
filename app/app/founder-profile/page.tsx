"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Panel, PanelBody } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

const leftColumn = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "location", label: "Location" },
  { key: "linkedIn", label: "LinkedIn" },
] as const;

const rightColumn = [
  { key: "background", label: "Background" },
  { key: "domainExpertise", label: "Domain Expertise" },
  { key: "previousStartupInfo", label: "Experience" },
  { key: "credibility", label: "Credibility" },
] as const;

export default function FounderProfilePage() {
  const { state, updateFounderField } = useDemo();
  const [editing, setEditing] = useState(false);
  const initials = state.founderProfile.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <PageShell>
      <div>
        <div className="eyebrow">Your Profile</div>
        <h1 className="mt-3 text-[38px] font-semibold leading-none tracking-[-0.04em] text-white">
          Your Profile
        </h1>
        <p className="mt-4 max-w-[760px] text-[14px] leading-7 text-zinc-500">
          Programs do not just read the startup. They read the founder too. Keep this sharp.
        </p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-zinc-800 text-[24px] font-semibold tracking-[-0.04em]">
            {initials}
          </div>
          <div>
            <div className="font-[family-name:var(--font-display)] text-[34px] leading-none tracking-[-0.04em] text-white">
              {state.founderProfile.name}
            </div>
            <div className="mt-1 text-[16px] text-zinc-500">{state.founderProfile.role}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setEditing((current) => !current)} variant="ghost">
            Edit Profile
          </Button>
          {editing ? (
            <Button onClick={() => setEditing(false)} variant="secondary">
              Save
            </Button>
          ) : null}
          <Link href="/app/matches">
            <Button>See Matches</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-[12px] border border-amber-400/18 bg-amber-400/10 p-4">
        <div className="text-[13px] font-medium text-amber-300">Missing information</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {state.founderProfile.missingInfo.map((item) => (
            <Badge key={item} size="sm" tone="amber">
              {item}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelBody className="mt-0 grid gap-5">
            {leftColumn.map((field) => (
              <Field key={field.key}>
                <FieldLabel>{field.label}</FieldLabel>
                {editing ? (
                  <Input
                    onChange={(event) => updateFounderField(field.key, event.target.value)}
                    value={String(state.founderProfile[field.key])}
                  />
                ) : (
                  <div className="group flex min-h-11 items-center justify-between rounded-[8px] border border-zinc-800 bg-black px-3.5 text-[14px] text-white">
                    <span>{String(state.founderProfile[field.key])}</span>
                    <Pencil className="size-3.5 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                )}
              </Field>
            ))}

            <Field>
              <FieldLabel>Skills</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {state.founderProfile.skills.map((skill) => (
                  <span
                    className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Field>
          </PanelBody>
        </Panel>

        <div className="grid gap-4">
          {rightColumn.map((field) => (
            <Panel key={field.key}>
              <PanelBody className="mt-0">
                <FieldLabel className="text-[11px]">{field.label}</FieldLabel>
                {editing ? (
                  <Textarea
                    className="mt-3"
                    onChange={(event) => updateFounderField(field.key, event.target.value)}
                    value={String(state.founderProfile[field.key])}
                  />
                ) : (
                  <blockquote className="group mt-3 rounded-[10px] bg-zinc-900 px-4 py-4 text-[14px] leading-7 text-white">
                    <div className="flex items-start justify-between gap-3">
                      <span>{String(state.founderProfile[field.key])}</span>
                      <Pencil className="mt-1 size-3.5 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </blockquote>
                )}
              </PanelBody>
            </Panel>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
