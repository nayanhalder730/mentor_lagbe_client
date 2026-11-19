import StudentOverview from "@/components/dashboard/overview/student-overview";
import { requireRole } from "@/lib/auth-helpers";

export default async function StudentPage() {
  await requireRole("student");

  return <StudentOverview />;
}
