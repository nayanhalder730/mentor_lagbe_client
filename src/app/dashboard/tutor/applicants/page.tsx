import { requireRole } from "@/lib/auth-helpers";

export default async function ApplicantsPage() {
  await requireRole("tutor");

  return <div>Applicants Page</div>;
}
