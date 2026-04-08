import { type StartupProgramFilters } from "@/lib/startup-programs";

export type AuthIntentAction = "default" | "browse" | "apply" | "draft";

export type AuthIntent = {
  action: AuthIntentAction;
  destination: string;
  query?: string;
  filters?: Partial<StartupProgramFilters>;
  programSlug?: string;
};

export function serializeAuthIntent(intent: AuthIntent) {
  return JSON.stringify(intent);
}

export function parseAuthIntent(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<AuthIntent>;

    if (!parsed.destination || !parsed.action) {
      return null;
    }

    return parsed as AuthIntent;
  } catch {
    return null;
  }
}

export function buildAuthEntryHref({
  entryPath,
  entryParams,
  intent,
}: {
  entryPath: string;
  entryParams?: URLSearchParams;
  intent: AuthIntent;
}) {
  const next = new URLSearchParams(entryParams?.toString() ?? "");
  next.set("auth", "1");
  next.set("intent", serializeAuthIntent(intent));
  const query = next.toString();
  return query ? `${entryPath}?${query}` : entryPath;
}

export function stripAuthQuery(searchParams: URLSearchParams) {
  const next = new URLSearchParams(searchParams.toString());
  next.delete("auth");
  next.delete("intent");
  return next;
}

