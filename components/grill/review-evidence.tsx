import { AlertTriangle, CheckCircle2, FileText, Pencil } from "lucide-react";

import type { GrillIntake, MissingInformation } from "@/lib/grill/types";

function EvidenceBlock({
  children,
  interactionLocked,
  onEdit,
  title,
}: {
  children: React.ReactNode;
  interactionLocked: boolean;
  onEdit: () => void;
  title: string;
}) {
  return (
    <section className="border-t border-black/10 py-5 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[#171513]">{title}</h3>
        <button
          className="inline-flex size-8 items-center justify-center rounded-full border border-black/10 bg-white text-[#5e5750] hover:text-[#171513] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={interactionLocked}
          onClick={onEdit}
          title={`Edit ${title.toLowerCase()}`}
          type="button"
        >
          <Pencil aria-hidden="true" className="size-3.5" />
          <span className="sr-only">Edit {title.toLowerCase()}</span>
        </button>
      </div>
      {children}
    </section>
  );
}

export function ReviewEvidence({
  deckFile,
  intake,
  interactionLocked = false,
  missing,
  onEdit,
  profileFile,
}: {
  deckFile: File | null;
  intake: GrillIntake;
  interactionLocked?: boolean;
  missing: MissingInformation[];
  onEdit: (step: number) => void;
  profileFile: File | null;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
      <div className="rounded-lg border border-black/10 bg-white p-5 sm:p-6">
        <EvidenceBlock interactionLocked={interactionLocked} onEdit={() => onEdit(0)} title="Founder evidence">
          <div className="grid gap-3 text-sm leading-6 sm:grid-cols-2">
            <p><span className="block text-xs font-semibold text-[#7b736a]">Founder</span>{intake.founder.fullName}, {intake.founder.role}</p>
            <p><span className="block text-xs font-semibold text-[#7b736a]">Experience</span>{intake.founder.yearsExperience} years relevant</p>
            <p className="sm:col-span-2"><span className="block text-xs font-semibold text-[#7b736a]">Background</span>{intake.founder.background || "Not provided"}</p>
            <p className="sm:col-span-2"><span className="block text-xs font-semibold text-[#7b736a]">Achievements</span>{intake.founder.achievements || "Not provided"}</p>
          </div>
        </EvidenceBlock>
        <EvidenceBlock interactionLocked={interactionLocked} onEdit={() => onEdit(1)} title="Startup evidence">
          <div className="space-y-3 text-sm leading-6">
            <p><span className="block text-xs font-semibold text-[#7b736a]">Pitch</span>{intake.startup.oneLinePitch}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <p><span className="block text-xs font-semibold text-[#7b736a]">Problem</span>{intake.startup.problem}</p>
              <p><span className="block text-xs font-semibold text-[#7b736a]">Solution</span>{intake.startup.solution}</p>
              <p><span className="block text-xs font-semibold text-[#7b736a]">Traction</span>{intake.startup.traction || "Not provided"}</p>
              <p><span className="block text-xs font-semibold text-[#7b736a]">Funding ask</span>{intake.startup.fundingAsk || "Not provided"}</p>
            </div>
          </div>
        </EvidenceBlock>
        <EvidenceBlock interactionLocked={interactionLocked} onEdit={() => onEdit(2)} title="Uploaded evidence">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-black/10 p-3">
              <FileText aria-hidden="true" className="size-4 text-[#b44828]" />
              <span className="min-w-0"><span className="block text-xs font-semibold text-[#7b736a]">Profile</span><span className="block truncate">{profileFile?.name ?? "Pasted text only"}</span></span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-black/10 p-3">
              <FileText aria-hidden="true" className="size-4 text-[#b44828]" />
              <span className="min-w-0"><span className="block text-xs font-semibold text-[#7b736a]">Pitch deck</span><span className="block truncate">{deckFile?.name ?? "Not provided"}</span></span>
            </div>
          </div>
        </EvidenceBlock>
      </div>

      <aside className="self-start rounded-lg border border-black/10 bg-[#171513] p-5 text-white sm:p-6">
        <div className="flex items-center gap-2 text-sm font-bold">
          {missing.length ? <AlertTriangle aria-hidden="true" className="size-4 text-[#ff9b7b]" /> : <CheckCircle2 aria-hidden="true" className="size-4 text-[#59d18c]" />}
          Evidence check
        </div>
        {missing.length ? (
          <ul className="mt-4 space-y-3">
            {missing.slice(0, 7).map((item) => (
              <li className="border-l-2 border-[#ff6b3d] pl-3" key={item.field}>
                <div className="text-xs font-bold text-white">{item.label}</div>
                <div className="mt-1 text-xs leading-5 text-white/65">{item.reason}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-white/70">Core evidence is present. The Grill will still challenge quality and consistency.</p>
        )}
      </aside>
    </div>
  );
}
