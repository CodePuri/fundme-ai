"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { buildStartupProgramSearchHref } from "@/lib/startup-programs";
import { cn } from "@/lib/utils";

import { SearchSuggestionsDropdown } from "./search-suggestions-dropdown";
import { useProgramSearchController } from "./use-program-search-controller";

const DROPDOWN_ID = "startup-program-search-suggestions";

export function NavSearch({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isProgramsPage = pathname === "/explore";
  const focusRequested = isProgramsPage && searchParams.get("focus") === "1";
  const {
    activeIndex,
    committedFilters,
    flatSuggestions,
    inputRef,
    open,
    selectSuggestion,
    setActiveIndex,
    setOpen,
    suggestionGroups,
    updateDraftQuery,
    visibleQuery,
    wrapperRef,
    commitQuery,
  } = useProgramSearchController("/explore");

  useEffect(() => {
    if (!focusRequested) return;

    inputRef.current?.focus();

    const params = new URLSearchParams(searchParams.toString());
    params.delete("focus");
    const href = params.toString() ? `/explore?${params.toString()}` : "/explore";
    router.replace(href, { scroll: false });
  }, [focusRequested, inputRef, router, searchParams]);

  function navigateToPrograms() {
    const href = buildStartupProgramSearchHref(
      {
        ...committedFilters,
        q: visibleQuery.trim(),
      },
      "/explore",
    );
    const params = new URLSearchParams(href.split("?")[1] ?? "");
    params.set("focus", "1");
    router.push(params.toString() ? `/explore?${params.toString()}` : "/explore?focus=1");
  }

  return (
    <div className={cn("relative", className)} ref={wrapperRef}>
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-faint)]"
          />
          <input
            aria-autocomplete="list"
            aria-controls={open ? DROPDOWN_ID : undefined}
            aria-expanded={open}
            aria-haspopup="listbox"
            className="app-input h-10 w-full rounded-[10px] pl-10 pr-4 text-sm"
            onChange={(event) => {
              if (!isProgramsPage) return;
              updateDraftQuery(event.target.value);
            }}
            onFocus={() => {
              if (!isProgramsPage) {
                navigateToPrograms();
                return;
              }

              setOpen(true);
            }}
            onKeyDown={(event) => {
              if (!isProgramsPage) {
                if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
                  event.preventDefault();
                  navigateToPrograms();
                }
                return;
              }

              if (event.key === "ArrowDown") {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((current) =>
                  flatSuggestions.length === 0 ? -1 : (current + 1) % flatSuggestions.length,
                );
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((current) =>
                  flatSuggestions.length === 0
                    ? -1
                    : current <= 0
                      ? flatSuggestions.length - 1
                      : current - 1,
                );
              }

              if (event.key === "Enter") {
                event.preventDefault();

                if (open && activeIndex >= 0 && flatSuggestions[activeIndex]) {
                  selectSuggestion(flatSuggestions[activeIndex]);
                  return;
                }

                commitQuery(visibleQuery);
              }

              if (event.key === "Escape") {
                setOpen(false);
                setActiveIndex(-1);
              }
            }}
            onMouseDown={(event) => {
              if (!isProgramsPage) {
                event.preventDefault();
                navigateToPrograms();
              }
            }}
            placeholder="Search startup programs, sectors, or themes"
            readOnly={!isProgramsPage}
            ref={inputRef}
            role="combobox"
            value={isProgramsPage ? visibleQuery : ""}
          />

          {open && isProgramsPage ? (
            <SearchSuggestionsDropdown
              activeIndex={activeIndex}
              groups={suggestionGroups}
              listboxId={DROPDOWN_ID}
              onHoverIndex={setActiveIndex}
              onSelect={selectSuggestion}
            />
          ) : null}
        </div>

        <Button
          className="min-w-[88px]"
          onClick={() => {
            if (!isProgramsPage) {
              navigateToPrograms();
              return;
            }

            commitQuery(visibleQuery);
          }}
          size="sm"
          variant="secondary"
        >
          Search
        </Button>
      </div>
    </div>
  );
}
