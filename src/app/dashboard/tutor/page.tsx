import TutorOverview from "@/components/dashboard/overview/tutor-overview";
import { requireRole } from "@/lib/auth-helpers";

export default async function TutorPage() {
  await requireRole("tutor");

  return <TutorOverview />;
}
