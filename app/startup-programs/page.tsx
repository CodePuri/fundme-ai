import { redirect } from "next/navigation";

type LegacyStartupProgramsRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyStartupProgramsRoute({
  searchParams,
}: LegacyStartupProgramsRouteProps) {
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (typeof value === "string") {
      params.set(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
    }
  }

  const href = params.toString() ? `/search?${params.toString()}` : "/search";
  redirect(href);
}
