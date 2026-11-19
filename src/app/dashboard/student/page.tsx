import { requireRole } from "@/lib/auth-helpers";

export default async function StudentPage() {
  await requireRole("student");

  return <div>Student Dashboard Page</div>;
}
