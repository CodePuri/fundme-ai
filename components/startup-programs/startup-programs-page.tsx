"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useDemo } from "@/components/app/demo-provider";
import { buildAuthEntryHref } from "@/lib/auth-intent";
import {
  buildStartupProgramFiltersFromParams,
  buildStartupProgramSearchHref,
  defaultStartupProgramFilters,
  filterStartupPrograms,
  type StartupProgram,
  type StartupProgramFilters,
} from "@/lib/startup-programs";
import { cn } from "@/lib/utils";

import { FiltersBar } from "./filters-bar";
import { StartupProgramRow } from "./startup-program-row";

type ProgramsBrowserMode = "public" | "app";

function updateSearchParam(
  searchParams: URLSearchParams,
  key: keyof StartupProgramFilters,
  value: string,
) {
  const next = new URLSearchParams(searchParams.toString());

  if (value) {
    next.set(key, value);
  } else {
    next.delete(key);
  }

  return next;
}

export function StartupProgramsPage({
  mode,
  title,
  description,
}: {
  mode: ProgramsBrowserMode;
  title: string;
  description: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { state } = useDemo();

  const filters = useMemo(
    () => buildStartupProgramFiltersFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const basePath = mode === "public" ? "/search" : "/explore";
  const results = useMemo(() => filterStartupPrograms(filters), [filters]);
  const activeFiltersCount = useMemo(
    () =>
      Object.entries(filters).reduce((count, [key, value]) => {
        if (key === "q") return count;
        return value ? count + 1 : count;
      }, 0),
    [filters],
  );

  function openAuthFor(program: StartupProgram, action: "apply" | "draft") {
    const destination =
      action === "apply"
        ? `/app/programs/${program.workflow_slug}`
        : `/app/workspace/${program.workflow_slug}`;
    const entryHref = buildAuthEntryHref({
      entryPath: "/search",
      entryParams: new URLSearchParams(searchParams.toString()),
      intent: {
        action,
        destination,
        filters,
        programSlug: program.slug,
        query: filters.q,
      },
    });
    router.push(entryHref, { scroll: false });
  }

  function handlePublicAction(program: StartupProgram, action: "apply" | "draft") {
    if (state.isAuthenticated) {
      router.push(
        action === "apply"
          ? `/app/programs/${program.workflow_slug}`
          : `/app/workspace/${program.workflow_slug}`,
      );
      return;
    }

    openAuthFor(program, action);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1
          className={cn(
            "mt-3 font-semibold leading-none tracking-[-0.04em]",
            mode === "public" && "text-[34px] text-[#111111] sm:text-[40px]",
            mode === "app" && "text-[38px] text-[var(--text-primary)]",
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            "mt-4 max-w-[820px] text-[14px] leading-7",
            mode === "public" && "text-[#6d665e]",
            mode === "app" && "text-[var(--text-muted)]",
          )}
        >
          {description}
        </p>
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-[28px] border",
          mode === "public" && "editorial-panel border-black/8",
          mode === "app" && "border-[var(--border)] bg-[var(--bg)]",
        )}
      >
        <FiltersBar
          filters={filters}
          mode={mode}
          onChange={(key, value) => {
            const next = updateSearchParam(new URLSearchParams(searchParams.toString()), key, value);
            const href = next.toString() ? `${basePath}?${next.toString()}` : basePath;
            router.replace(href, { scroll: false });
          }}
        />

        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 text-[12px]",
            mode === "public" && "border-black/8 text-[#8d8578]",
            mode === "app" && "border-[var(--border)] text-[var(--text-muted)]",
          )}
        >
          <div>
            {results.length} startup programs
            {filters.q ? (
              <span className={cn("ml-2", mode === "public" ? "text-[#2f2a24]" : "text-[var(--text-primary)]")}>
                for “{filters.q}”
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <span>
              {activeFiltersCount > 0 ? `${activeFiltersCount} filters active` : "Sorted by editorial relevance"}
            </span>
            {activeFiltersCount > 0 ? (
              <button
                className={cn(
                  "transition-colors",
                  mode === "public" && "text-[#111111] hover:text-[#ff6b3d]",
                  mode === "app" && "text-[var(--text-primary)] hover:text-[var(--button-primary-bg)]",
                )}
                onClick={() =>
                  router.replace(buildStartupProgramSearchHref(defaultStartupProgramFilters, basePath), {
                    scroll: false,
                  })
                }
                type="button"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        <div
          className={cn(
            "hidden grid-cols-[2.2fr_1.1fr_0.95fr_1.15fr_1.8fr_220px] gap-4 border-b px-4 py-3 text-[11px] font-medium uppercase tracking-[0.12em] xl:grid",
            mode === "public" && "border-black/8 text-[#8d8578]",
            mode === "app" && "border-[var(--border)] text-[var(--text-faint)]",
          )}
        >
          <div>Program</div>
          <div>Geography</div>
          <div>Checks</div>
          <div>Stages</div>
          <div>Investment thesis</div>
          <div className="text-right">Actions</div>
        </div>

        {results.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <div
              className={cn(
                "text-[16px] font-medium",
                mode === "public" && "text-[#111111]",
                mode === "app" && "text-[var(--text-primary)]",
              )}
            >
              No programs match your current query.
            </div>
            <div
              className={cn(
                "mt-2 text-[13px]",
                mode === "public" && "text-[#6d665e]",
                mode === "app" && "text-[var(--text-muted)]",
              )}
            >
              Clear a filter or broaden the search to see more startup programs.
            </div>
          </div>
        ) : (
          results.map((program) => (
            <StartupProgramRow
              key={program.id}
              mode={mode}
              onApply={mode === "public" ? (item) => handlePublicAction(item, "apply") : undefined}
              onDraft={mode === "public" ? (item) => handlePublicAction(item, "draft") : undefined}
              program={program}
            />
          ))
        )}
      </div>
    </div>
  );
}
