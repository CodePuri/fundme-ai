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
        tone === "neutral" && "border-zinc-800 bg-zinc-900 text-zinc-400",
        tone === "blue" && "border-blue-400/18 bg-blue-400/10 text-blue-300",
        tone === "green" && "border-green-400/18 bg-green-400/10 text-green-300",
        tone === "amber" && "border-amber-400/18 bg-amber-400/10 text-amber-300",
        className,
      )}
    >
      {children}
    </span>
  );
}
