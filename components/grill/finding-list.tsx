import { AlertTriangle, CheckCircle2, CircleHelp } from "lucide-react";

import type { GrillFinding } from "@/lib/grill/types";

export function FindingList({
  empty,
  findings,
  tone = "warning",
}: {
  empty: string;
  findings: GrillFinding[];
  tone?: "positive" | "warning" | "neutral";
}) {
  if (findings.length === 0) {
    return <p className="text-sm leading-6 text-[#70685f]">{empty}</p>;
  }
  const Icon = tone === "positive" ? CheckCircle2 : tone === "neutral" ? CircleHelp : AlertTriangle;
  return (
    <ul className="divide-y divide-black/8">
      {findings.map((finding) => (
        <li className="flex gap-3 py-4 first:pt-0 last:pb-0" key={finding.id}>
          <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${tone === "positive" ? "text-[#2f955d]" : tone === "neutral" ? "text-[#4b7eb8]" : "text-[#c94134]"}`} />
          <div>
            <h3 className="text-sm font-bold text-[#171513]">{finding.title}</h3>
            <p className="mt-1 text-sm leading-6 text-[#70685f]">{finding.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
