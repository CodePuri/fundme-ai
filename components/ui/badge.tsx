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
