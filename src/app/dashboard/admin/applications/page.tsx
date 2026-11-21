import ApplicationsView from "@/components/dashboard/admin/applications-view";
import { requireRole } from "@/lib/auth-helpers";

export default async function AdminApplicationsPage() {
  await requireRole("admin");

  return <ApplicationsView />;
}
