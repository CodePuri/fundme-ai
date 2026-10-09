import { AssessmentShell } from "@/components/assessment/assessment-shell";
import { FundingReadinessReport } from "@/components/assessment/funding-readiness-report";
import { getAssessmentViewer } from "@/lib/assessment/viewer";

export default async function AssessmentResultPage() {
  const { userId, resolved } = await getAssessmentViewer();
  return <AssessmentShell activeStage="result"><FundingReadinessReport viewerId={userId} identityResolved={resolved} /></AssessmentShell>;
}
