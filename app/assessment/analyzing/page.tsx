import { AnalysisProgress } from "@/components/assessment/analysis-progress";
import { AssessmentShell } from "@/components/assessment/assessment-shell";

export default function AssessmentAnalyzingPage() {
  return <AssessmentShell activeStage="analyzing"><AnalysisProgress /></AssessmentShell>;
}
