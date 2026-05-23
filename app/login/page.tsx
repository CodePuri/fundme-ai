import { redirect } from "next/navigation";

import { getSafeRedirect } from "@/lib/utils";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  // Security: Sanitize user input to prevent Open Redirect vulnerabilities.
  // The 'redirect_url' query parameter must be a relative path.
  const destination = getSafeRedirect(params.redirect, "/onboarding");
  redirect(`/sign-in?redirect_url=${encodeURIComponent(destination)}`);
}
