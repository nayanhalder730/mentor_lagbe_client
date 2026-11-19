import { requireRole } from "@/lib/auth-helpers";

export default async function TutorPage() {
  await requireRole("tutor");

  return <div>Tutor Dashboard Page</div>;
}
