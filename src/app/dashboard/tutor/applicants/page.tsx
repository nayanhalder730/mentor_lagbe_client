import ApplicantsView from "@/components/dashboard/tutor/applicants-view";
import { requireRole } from "@/lib/auth-helpers";

export default async function ApplicantsPage() {
  await requireRole("tutor");

  return <ApplicantsView />;
}
