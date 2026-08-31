import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getLatestAssessmentForUser } from "@/lib/assessment/database";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;

  if (userId) {
    if (params.redirect_url) {
      redirect(params.redirect_url);
    }
    try {
      const latest = await getLatestAssessmentForUser(userId);
      if (latest.hasAssessment) {
        redirect("/app/preview");
      } else {
        redirect("/assessment");
      }
    } catch {
      redirect("/app/preview");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <SignUp
        fallbackRedirectUrl="/app/preview"
        forceRedirectUrl={params.redirect_url || undefined}
      />
    </main>
  );
}
