import { redirect } from "next/navigation";

import { sanitizeInternalRedirect } from "@/lib/security/redirects";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const params = await searchParams;
  const destination = sanitizeInternalRedirect(params.redirect, "/onboarding");
  redirect(`/sign-in?redirect_url=${encodeURIComponent(destination)}`);
}
