import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const destination = params.redirect || "/onboarding";
  redirect(`/sign-in?redirect_url=${encodeURIComponent(destination)}`);
}
