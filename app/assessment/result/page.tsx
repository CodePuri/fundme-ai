import { AssessmentShell } from "@/components/assessment/assessment-shell";
import { FundingReadinessReport } from "@/components/assessment/funding-readiness-report";

export default function AssessmentResultPage() {
  return <AssessmentShell activeStage="result"><FundingReadinessReport /></AssessmentShell>;
}
