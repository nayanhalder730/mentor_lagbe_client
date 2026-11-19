import { requireRole } from "@/lib/auth-helpers";

export default async function AdminUsersPage() {
  await requireRole("admin");

  return <div>Admin Users Page</div>;
}
