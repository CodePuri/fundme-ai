import { AssessmentShell } from "@/components/assessment/assessment-shell";
import { IntakeGrid } from "@/components/assessment/intake-grid";

export default function AssessmentPage() {
  return <AssessmentShell activeStage="intake"><IntakeGrid /></AssessmentShell>;
}
