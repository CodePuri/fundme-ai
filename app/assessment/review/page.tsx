import { AssessmentShell } from "@/components/assessment/assessment-shell";
import { AssessmentRouteGate } from "@/components/assessment/assessment-route-gate";
import { SubmissionReview } from "@/components/assessment/submission-review";

export default function AssessmentReviewPage() {
  return <AssessmentShell activeStage="review"><AssessmentRouteGate stage="review"><SubmissionReview /></AssessmentRouteGate></AssessmentShell>;
}
