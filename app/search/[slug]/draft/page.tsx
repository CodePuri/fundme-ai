import { notFound, redirect } from "next/navigation";

import { getStartupProgramBySlug } from "@/lib/startup-programs";

export default async function SearchDraftCompatibilityRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = getStartupProgramBySlug(slug);

  if (!program) {
    notFound();
  }

  redirect(`/app/workspace/${program.workflow_slug}`);
}

