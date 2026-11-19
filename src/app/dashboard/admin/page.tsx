import { requireRole } from "@/lib/auth-helpers";

export default async function AdminPage() {
  await requireRole("admin");

  return <div>Admin Dashboard Page</div>;
}
