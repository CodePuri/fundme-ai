"use client";

import type { StartupProgramSuggestion } from "@/lib/startup-programs";
import { cn } from "@/lib/utils";

type SuggestionGroup = {
  type: StartupProgramSuggestion["type"];
  items: StartupProgramSuggestion[];
};

export function SearchSuggestionsDropdown({
  groups,
  activeIndex,
  listboxId,
  onHoverIndex,
  onSelect,
}: {
  groups: SuggestionGroup[];
  activeIndex: number;
  listboxId: string;
  onHoverIndex: (index: number) => void;
  onSelect: (suggestion: StartupProgramSuggestion) => void;
}) {
  if (groups.length === 0) {
    return (
      <div className="editorial-panel absolute left-0 right-0 top-[calc(100%+8px)] z-40 rounded-[18px] p-3">
        <div className="text-[13px] text-[#6d665e]">No startup program suggestions match that query.</div>
      </div>
    );
  }

  const indexedGroups = groups.map((group, groupIndex) => ({
    ...group,
    startIndex: groups
      .slice(0, groupIndex)
      .reduce((total, currentGroup) => total + currentGroup.items.length, 0),
  }));

  return (
    <div
      className="editorial-panel absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-[340px] overflow-y-auto rounded-[18px]"
      id={listboxId}
      role="listbox"
    >
      {indexedGroups.map((group) => (
        <div className="border-b border-black/6 last:border-b-0" key={group.type}>
          <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8578]">
            {group.type}
          </div>
          <div className="pb-2">
            {group.items.map((item, itemIndex) => {
              const index = group.startIndex + itemIndex;
              const active = index === activeIndex;

              return (
                <button
                  aria-selected={active}
                  className={cn(
                    "flex w-full flex-col items-start gap-1 px-4 py-2.5 text-left transition-colors",
                    active ? "bg-[#fff2ec]" : "hover:bg-[#faf6f0]",
                  )}
                  key={item.id}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onSelect(item);
                  }}
                  onMouseEnter={() => onHoverIndex(index)}
                  role="option"
                  type="button"
                >
                  <span className="text-[14px] font-medium text-[#111111]">{item.label}</span>
                  {item.helperText ? (
                    <span className="text-[12px] leading-5 text-[#6d665e]">{item.helperText}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
