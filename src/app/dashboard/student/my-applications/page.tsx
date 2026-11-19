import MyApplicationsView from "@/components/dashboard/student/my-applications-view";
import { requireRole } from "@/lib/auth-helpers";

export default async function MyApplicationsPage() {
  await requireRole("student");

  return <MyApplicationsView />;
}
