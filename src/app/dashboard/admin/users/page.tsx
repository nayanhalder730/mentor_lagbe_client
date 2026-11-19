import UsersView from "@/components/dashboard/admin/users-view";
import { requireRole } from "@/lib/auth-helpers";

export default async function AdminUsersPage() {
  const { session } = await requireRole("admin");

  return <UsersView currentUserId={session.user.id} />;
}
