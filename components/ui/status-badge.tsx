import { type MatchLabel, type ProgramStatus } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "blue" | "green" | "amber";

export function statusTone(status: ProgramStatus): Tone {
  switch (status) {
    case "Submitted":
      return "blue";
    case "Interview Scheduled":
      return "amber";
    case "Accepted":
    case "Ready":
      return "green";
    case "Rejected":
    case "Drafting":
    default:
      return "neutral";
  }
}

export function fitTone(label: MatchLabel): Tone {
  switch (label) {
    case "Strong Match":
      return "green";
    case "Good Match":
      return "amber";
    case "Possible Match":
    default:
      return "neutral";
  }
}

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        tone === "neutral" && "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-muted)]",
        tone === "blue" && "border-blue-500/18 bg-blue-500/10 text-blue-700",
        tone === "green" && "border-green-500/18 bg-green-500/10 text-green-700",
        tone === "amber" && "border-amber-500/18 bg-amber-500/10 text-amber-700",
        className,
      )}
    >
      {children}
    </span>
  );
}
