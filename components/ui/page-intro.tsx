import { cn } from "@/lib/utils";

export function PageIntro({
  kicker,
  title,
  description,
  action,
  className,
}: {
  kicker: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-6", className)}>
      <div>
        <div className="section-kicker">{kicker}</div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="section-copy mt-3 max-w-2xl text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}
