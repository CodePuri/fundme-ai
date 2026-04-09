"use client";

import { cn } from "@/lib/utils";
import { startupProgramsFilterOptions, type StartupProgramFilters } from "@/lib/startup-programs";

export function FiltersBar({
  filters,
  onChange,
  mode,
}: {
  filters: StartupProgramFilters;
  onChange: (key: keyof Omit<StartupProgramFilters, "q">, value: string) => void;
  mode: "public" | "app";
}) {
  const selectClassName = cn(
    "h-9 rounded-[10px] border px-3 text-[12px] outline-none transition-colors",
    mode === "public" &&
      "border-black/8 bg-white text-[#2f2a24] focus:border-[#ff6b3d]/35 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,107,61,0.08)]",
    mode === "app" &&
      "border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:bg-[var(--surface-elevated)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]",
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-b px-4 py-3",
        mode === "public" && "border-black/8 bg-[#faf6f0]",
        mode === "app" && "border-[var(--border)] bg-[var(--surface)]",
      )}
    >
      <select
        aria-label="Filter by geography"
        className={selectClassName}
        onChange={(event) => onChange("geography", event.target.value)}
        value={filters.geography}
      >
        <option value="">{startupProgramsFilterOptions.geography[0]}</option>
        {startupProgramsFilterOptions.geography.slice(1).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by stage"
        className={selectClassName}
        onChange={(event) => onChange("stage", event.target.value)}
        value={filters.stage}
      >
        <option value="">{startupProgramsFilterOptions.stage[0]}</option>
        {startupProgramsFilterOptions.stage.slice(1).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by check size"
        className={selectClassName}
        onChange={(event) => onChange("checkSize", event.target.value)}
        value={filters.checkSize}
      >
        <option value="">{startupProgramsFilterOptions.checkSize[0]}</option>
        {startupProgramsFilterOptions.checkSize.slice(1).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by sector"
        className={selectClassName}
        onChange={(event) => onChange("sector", event.target.value)}
        value={filters.sector}
      >
        <option value="">{startupProgramsFilterOptions.sector[0]}</option>
        {startupProgramsFilterOptions.sector.slice(1).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by program type"
        className={selectClassName}
        onChange={(event) => onChange("programType", event.target.value)}
        value={filters.programType}
      >
        <option value="">{startupProgramsFilterOptions.programType[0]}</option>
        {startupProgramsFilterOptions.programType.slice(1).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by equity model"
        className={selectClassName}
        onChange={(event) => onChange("equityFree", event.target.value ? "true" : "")}
        value={filters.equityFree}
      >
        <option value="">{startupProgramsFilterOptions.equityFree[0]}</option>
        <option value="true">Equity-free only</option>
      </select>

      <select
        aria-label="Filter by application state"
        className={selectClassName}
        onChange={(event) => onChange("applicationsOpen", event.target.value ? "true" : "")}
        value={filters.applicationsOpen}
      >
        <option value="">{startupProgramsFilterOptions.applicationsOpen[0]}</option>
        <option value="true">Applications open</option>
      </select>

      <select
        aria-label="Filter by program format"
        className={selectClassName}
        onChange={(event) => onChange("format", event.target.value)}
        value={filters.format}
      >
        <option value="">{startupProgramsFilterOptions.format[0]}</option>
        {startupProgramsFilterOptions.format.slice(1).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
