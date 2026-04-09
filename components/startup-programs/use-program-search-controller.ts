"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  buildStartupProgramFiltersFromParams,
  buildStartupProgramSearchHref,
  getStartupProgramSuggestions,
  type StartupProgramFilters,
  type StartupProgramSuggestion,
} from "@/lib/startup-programs";

export function useProgramSearchController(basePath: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const committedFilters = useMemo(
    () => buildStartupProgramFiltersFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const [draftQuery, setDraftQuery] = useState(committedFilters.q);
  const [isDirty, setIsDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const visibleQuery = isDirty ? draftQuery : committedFilters.q;
  const deferredQuery = useDeferredValue(visibleQuery);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const suggestionGroups = useMemo(
    () => getStartupProgramSuggestions(deferredQuery),
    [deferredQuery],
  );
  const flatSuggestions = useMemo(
    () => suggestionGroups.flatMap((group) => group.items),
    [suggestionGroups],
  );

  function commitQuery(nextQuery: string, nextFilters?: Partial<StartupProgramFilters>) {
    const trimmedQuery = nextQuery.trim();
    const mergedFilters: StartupProgramFilters = {
      ...committedFilters,
      ...nextFilters,
      q: trimmedQuery,
    };
    const href = buildStartupProgramSearchHref(mergedFilters, basePath);

    setDraftQuery(trimmedQuery);
    setIsDirty(false);
    startTransition(() => {
      router.push(href, { scroll: false });
    });

    setOpen(false);
    setActiveIndex(-1);
  }

  function selectSuggestion(suggestion: StartupProgramSuggestion) {
    commitQuery(suggestion.appliedFilters?.q ?? suggestion.query, suggestion.appliedFilters);
  }

  function updateDraftQuery(value: string) {
    setDraftQuery(value);
    setIsDirty(true);
    setOpen(true);
    setActiveIndex(-1);
  }

  return {
    activeIndex,
    committedFilters,
    flatSuggestions,
    inputRef,
    open,
    suggestionGroups,
    visibleQuery,
    wrapperRef,
    commitQuery,
    selectSuggestion,
    setActiveIndex,
    setOpen,
    updateDraftQuery,
  };
}

