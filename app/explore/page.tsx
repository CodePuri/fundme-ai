import { DashboardFrame } from "@/components/app/dashboard-frame";
import { StartupProgramsPage } from "@/components/startup-programs/startup-programs-page";

export default function ExplorePage() {
  return (
    <DashboardFrame>
      <StartupProgramsPage
        description="Search every accelerator, incubator, fellowship, and startup program in the signed-in workbench."
        mode="app"
        title="All Programs"
      />
    </DashboardFrame>
  );
}

