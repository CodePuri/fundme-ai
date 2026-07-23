import { AssessmentShell } from "@/components/assessment/assessment-shell";
import { AssessmentRouteGate } from "@/components/assessment/assessment-route-gate";
import { MentorExperience } from "@/components/assessment/mentor-experience";

export default function AssessmentMentorPage() {
  return <AssessmentShell activeStage="mentor"><AssessmentRouteGate stage="mentor"><MentorExperience /></AssessmentRouteGate></AssessmentShell>;
}
