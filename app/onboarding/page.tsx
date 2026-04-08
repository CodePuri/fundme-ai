import { redirect } from "next/navigation";

export default function OnboardingRedirectPage() {
  redirect("/app/startup-profile");
}

