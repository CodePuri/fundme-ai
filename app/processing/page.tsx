import { redirect } from "next/navigation";

export default function ProcessingRedirectPage() {
  redirect("/app/matches");
}

