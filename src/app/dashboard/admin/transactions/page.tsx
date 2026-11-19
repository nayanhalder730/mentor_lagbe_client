import { requireRole } from "@/lib/auth-helpers";

export default async function AdminTransactionsPage() {
  await requireRole("admin");

  return <div>Admin Transactions Page</div>;
}
