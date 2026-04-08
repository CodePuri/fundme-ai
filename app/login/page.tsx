import { redirect } from "next/navigation";

import { buildAuthEntryHref } from "@/lib/auth-intent";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const destination = params.redirect || "/onboarding";
  const entryPath = destination.startsWith("/explore") ? "/search" : "/";

  redirect(
    buildAuthEntryHref({
      entryPath,
      intent: {
        action: "default",
        destination,
      },
    }),
  );
}
