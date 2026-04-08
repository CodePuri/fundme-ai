import { redirect } from "next/navigation";

export default function LegacyProcessingPage() {
  redirect("/app/matches");
}
