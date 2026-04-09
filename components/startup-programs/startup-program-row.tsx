import Link from "next/link";

import { type StartupProgram } from "@/lib/startup-programs";
import { cn } from "@/lib/utils";

import { StartupProgramLogo } from "./startup-program-logo";

function renderChipOverflow(items: string[], maxVisible: number, mode: "public" | "app") {
  const visible = items.slice(0, maxVisible);
  const overflow = items.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((item) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]",
            mode === "public" && "border-black/6 bg-[#f3ede6] text-[#6d665e]",
            mode === "app" && "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-muted)]",
          )}
          key={item}
        >
          {item}
        </span>
      ))}
      {overflow > 0 ? (
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]",
            mode === "public" && "border-black/6 bg-[#f3ede6] text-[#6d665e]",
            mode === "app" && "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-muted)]",
          )}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

export function StartupProgramRow({
  program,
  mode,
  onApply,
  onDraft,
}: {
  program: StartupProgram;
  mode: "public" | "app";
  onApply?: (program: StartupProgram) => void;
  onDraft?: (program: StartupProgram) => void;
}) {
  const primaryHref = program.apply_url || program.website_url;
  const draftHref = `/app/workspace/${program.workflow_slug}`;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 border-b px-4 py-4 transition-colors last:border-b-0 xl:grid-cols-[2.2fr_1.1fr_0.95fr_1.15fr_1.8fr_220px] xl:items-center",
        mode === "public" && "border-black/8 hover:bg-[#fffaf5]",
        mode === "app" && "border-[var(--border)] hover:bg-[var(--surface-elevated)]",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <StartupProgramLogo name={program.name} slug={program.slug} />
        <div className="min-w-0">
          <div
            className={cn(
              "truncate text-[14px] font-semibold",
              mode === "public" && "text-[#111111]",
              mode === "app" && "text-[var(--text-primary)]",
            )}
          >
            {program.name}
          </div>
          <div
            className={cn(
              "mt-1 text-[12px]",
              mode === "public" && "text-[#6d665e]",
              mode === "app" && "text-[var(--text-muted)]",
            )}
          >
            {program.organization_type}, {program.program_type}
          </div>
          <div
            className={cn(
              "mt-1 text-[12px] leading-5",
              mode === "public" && "text-[#8d8578]",
              mode === "app" && "text-[var(--text-faint)]",
            )}
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {program.short_description}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {renderChipOverflow(program.display_geography_chips, 2, mode)}
      </div>

      <div
        className={cn(
          "text-[13px]",
          mode === "public" && "text-[#2f2a24]",
          mode === "app" && "text-[var(--text-primary)]",
        )}
      >
        {program.display_check_range}
      </div>

      <div className="space-y-1">
        {renderChipOverflow(program.display_stage_chips, 2, mode)}
      </div>

      <div
        className={cn(
          "text-[13px] leading-6",
          mode === "public" && "text-[#524b43]",
          mode === "app" && "text-[var(--text-muted)]",
        )}
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
          overflow: "hidden",
        }}
        title={program.display_thesis_snippet}
      >
        {program.display_thesis_snippet}
      </div>

      <div className="flex flex-col items-start gap-2 xl:items-end">
        {mode === "app" ? (
          <>
            <a
              className="inline-flex min-h-8 min-w-[156px] items-center justify-center rounded-[4px] border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-3 text-[12px] font-medium text-[var(--button-primary-text)] transition-colors hover:border-[var(--button-primary-border-hover)] hover:bg-[var(--button-primary-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-ring-offset)]"
              href={primaryHref}
              rel="noreferrer"
              target="_blank"
            >
              {program.display_primary_cta}
            </a>
            <Link
              className="inline-flex min-h-8 min-w-[156px] items-center justify-center rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[12px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-ring-offset)]"
              href={draftHref}
            >
              {program.display_secondary_cta}
            </Link>
          </>
        ) : (
          <>
            <button
              className="inline-flex min-h-8 min-w-[156px] items-center justify-center rounded-[4px] border border-[#ff6b3d] bg-[#ff6b3d] px-3 text-[12px] font-medium text-white transition-colors hover:border-[#f45d2e] hover:bg-[#f45d2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b3d]/28 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              onClick={() => onApply?.(program)}
              type="button"
            >
              {program.display_primary_cta}
            </button>
            <button
              className="inline-flex min-h-8 min-w-[156px] items-center justify-center rounded-[4px] border border-black/8 bg-white px-3 text-[12px] font-medium text-[#2f2a24] transition-colors hover:bg-[#faf6f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b3d]/18 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              onClick={() => onDraft?.(program)}
              type="button"
            >
              {program.display_secondary_cta}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
