"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function FounderProfilePage() {
  const { state, updateFounderField } = useDemo();
  const profile = state.founderProfile;

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">Generated profile</div>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold">
            Founder Profile
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/56">
            The founder story is extracted from notes, past applications, and the LinkedIn signal
            you provided, then organized into an editable profile.
          </p>
        </div>
        <Link href="/app/matches">
          <Button>
            See Matches
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel rounded-[32px] p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <div className="mb-2 text-sm text-white/52">Name</div>
              <Input onChange={(event) => updateFounderField("name", event.target.value)} value={profile.name} />
            </div>
            <div>
              <div className="mb-2 text-sm text-white/52">Role</div>
              <Input onChange={(event) => updateFounderField("role", event.target.value)} value={profile.role} />
            </div>
            <div>
              <div className="mb-2 text-sm text-white/52">Location</div>
              <Input onChange={(event) => updateFounderField("location", event.target.value)} value={profile.location} />
            </div>
            <div>
              <div className="mb-2 text-sm text-white/52">LinkedIn</div>
              <Input
                onChange={(event) => updateFounderField("linkedIn", event.target.value)}
                value={profile.linkedIn}
              />
            </div>
            <div className="md:col-span-2">
              <div className="mb-2 text-sm text-white/52">Founder background</div>
              <Textarea
                onChange={(event) => updateFounderField("background", event.target.value)}
                value={profile.background}
              />
            </div>
            <div className="md:col-span-2">
              <div className="mb-2 text-sm text-white/52">Domain expertise</div>
              <Textarea
                onChange={(event) => updateFounderField("domainExpertise", event.target.value)}
                value={profile.domainExpertise}
              />
            </div>
            <div className="md:col-span-2">
              <div className="mb-2 text-sm text-white/52">Previous startup info</div>
              <Textarea
                onChange={(event) => updateFounderField("previousStartupInfo", event.target.value)}
                value={profile.previousStartupInfo}
              />
            </div>
            <div className="md:col-span-2">
              <div className="mb-2 text-sm text-white/52">Why this founder is credible</div>
              <Textarea
                onChange={(event) => updateFounderField("credibility", event.target.value)}
                value={profile.credibility}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-[32px] p-6">
            <div className="text-sm text-white/52">Skills</div>
            <div className="mt-4 flex flex-wrap gap-3">
              {profile.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
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
            <div className="text-sm text-white/52">Signal summary</div>
            <p className="mt-3 text-sm leading-7 text-white/55">
              High founder-market fit. Story is strongest when framed around agency margin loss,
              workflow intimacy, and access to design partners.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
