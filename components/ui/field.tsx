import { cn } from "@/lib/utils";

export function Field({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-2.5", className)}>{children}</div>;
}

export function FieldLabel({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      className={cn("text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]", className)}
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}

export function FieldHint({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("text-[12px] leading-6 text-[var(--text-faint)]", className)}>{children}</p>;
}
