import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-white/72",
        className,
      )}
    >
      {children}
    </span>
  );
}
