import { cn } from "@/lib/utils";

type PanelTone = "default" | "muted" | "elevated" | "amber";

export function Panel({
  children,
  className,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: PanelTone;
}) {
  return (
    <section
      className={cn(
        "rounded-[14px] border p-5",
        tone === "default" && "border-[var(--border)] bg-[var(--surface)]",
        tone === "muted" && "border-[var(--border)] bg-[var(--surface-elevated)]",
        tone === "elevated" && "border-[var(--border)] bg-[var(--surface-elevated)]",
        tone === "amber" && "border-amber-400/18 bg-amber-400/10",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>{children}</div>;
}

export function PanelBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mt-5", className)}>{children}</div>;
}

export function PanelTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-[18px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]", className)}>
      {children}
    </h2>
  );
}

export function PanelDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("mt-2 text-[14px] leading-7 text-[var(--text-muted)]", className)}>{children}</p>;
}

export function PanelMeta({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("text-[12px] text-[var(--text-muted)]", className)}>{children}</div>;
}
