import AdminOverview from "@/components/dashboard/overview/admin-overview";
import { requireRole } from "@/lib/auth-helpers";

export default async function AdminPage() {
  await requireRole("admin");

  return <AdminOverview />;
}
