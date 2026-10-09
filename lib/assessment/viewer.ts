import { auth } from "@clerk/nextjs/server";

export async function getAssessmentViewer(): Promise<{ userId: string | null; resolved: boolean }> {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return { userId: null, resolved: true };
  }

  try {
    return { userId: (await auth()).userId, resolved: true };
  } catch {
    return { userId: null, resolved: false };
  }
}
