import AdminTuitionsView from "@/components/dashboard/admin/tuitions-view";
import { requireRole } from "@/lib/auth-helpers";

export default async function AdminTuitionsPage() {
  await requireRole("admin");

  return <AdminTuitionsView />;
}
