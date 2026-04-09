"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

import { SearchSuggestionsDropdown } from "./search-suggestions-dropdown";
import { useProgramSearchController } from "./use-program-search-controller";

const LISTBOX_ID = "startup-programs-search-listbox";

export function StartupProgramsSearchBar({ className }: { className?: string }) {
  const {
    activeIndex,
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
  } = useProgramSearchController("/search");

  return (
    <div className={cn("relative", className)} ref={wrapperRef}>
      <div className="rounded-full border border-black/8 bg-white p-1 shadow-[0_18px_40px_rgba(17,17,17,0.06)]">
        <div className="flex items-center gap-2">
          <div className="pointer-events-none pl-4 text-[#8d8578]">
            <Search className="size-5" />
          </div>
          <input
            aria-autocomplete="list"
            aria-controls={open ? LISTBOX_ID : undefined}
            aria-expanded={open}
            aria-haspopup="listbox"
            className="min-w-0 flex-1 bg-transparent px-1 py-3 text-[15px] text-[#111111] outline-none placeholder:text-[#8d8578]"
            onChange={(event) => {
              updateDraftQuery(event.target.value);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
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
                inputRef.current?.blur();
              }
            }}
            placeholder="Search startup programs, sectors, or themes"
            ref={inputRef}
            role="combobox"
            value={visibleQuery}
          />
          <button
            className="shrink-0 rounded-full bg-[#ff6b3d] px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#f45d2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b3d]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            onClick={() => commitQuery(visibleQuery)}
            type="button"
          >
            Search
          </button>
        </div>
      </div>

      {open ? (
        <SearchSuggestionsDropdown
          activeIndex={activeIndex}
          groups={suggestionGroups}
          listboxId={LISTBOX_ID}
          onHoverIndex={setActiveIndex}
          onSelect={selectSuggestion}
        />
      ) : null}
    </div>
  );
}
