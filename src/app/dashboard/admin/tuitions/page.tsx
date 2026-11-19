import { requireRole } from "@/lib/auth-helpers";

export default async function AdminTuitionsPage() {
  await requireRole("admin");

  return <div>Admin Tuitions Page</div>;
}
