import { redirect } from "next/navigation";
import { getSafeRedirect } from "../../lib/utils";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  // 🛡️ Security: Validate and sanitize redirect URL to prevent Open Redirect
  const destination = getSafeRedirect(params.redirect, "/onboarding");
  redirect(`/sign-in?redirect_url=${encodeURIComponent(destination)}`);
}
