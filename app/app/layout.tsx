import { DashboardFrame } from "@/components/app/dashboard-frame";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DashboardFrame>{children}</DashboardFrame>;
}
