import { AnalysisProgress } from "@/components/assessment/analysis-progress";
import { AssessmentShell } from "@/components/assessment/assessment-shell";
import { getAssessmentViewer } from "@/lib/assessment/viewer";

export default async function AssessmentAnalyzingPage() {
  const { userId, resolved } = await getAssessmentViewer();
  return <AssessmentShell activeStage="analyzing"><AnalysisProgress ownerId={userId} identityResolved={resolved} /></AssessmentShell>;
}
