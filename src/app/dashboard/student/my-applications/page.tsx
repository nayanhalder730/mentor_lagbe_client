import { requireRole } from "@/lib/auth-helpers";

export default async function MyApplicationsPage() {
  await requireRole("student");

  return <div>My Applications Page</div>;
}
