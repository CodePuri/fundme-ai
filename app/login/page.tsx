import { redirect } from "next/navigation";
import { getSafeRedirect } from "@/lib/utils";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const params = await searchParams;
  const destination = getSafeRedirect(params.redirect);
  redirect(`/sign-in?redirect_url=${encodeURIComponent(destination)}`);
}
