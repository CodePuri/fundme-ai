import { redirect } from "next/navigation";
import { getSafeRedirect } from "@/lib/utils";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;

  // Security concern: Sanitize redirect_url to prevent Open Redirect vulnerabilities.
  // The provided URL must be a relative path to avoid redirecting users to malicious external sites.
  const destination = getSafeRedirect(params.redirect, "/onboarding");

  redirect(`/sign-in?redirect_url=${encodeURIComponent(destination)}`);
}
