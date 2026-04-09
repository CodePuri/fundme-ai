import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "neutral",
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "blue" | "green" | "amber";
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium tracking-[-0.01em]",
        size === "sm" && "px-2.5 py-1 text-[11px]",
        size === "md" && "px-3 py-1 text-xs",
        tone === "neutral" && "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]",
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
