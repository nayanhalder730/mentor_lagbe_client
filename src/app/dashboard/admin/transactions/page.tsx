import TransactionsView from "@/components/dashboard/admin/transactions-view";
import { requireRole } from "@/lib/auth-helpers";

export default async function AdminTransactionsPage() {
  await requireRole("admin");

  return <TransactionsView />;
}
