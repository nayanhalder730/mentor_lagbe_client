import { requireRole } from "@/lib/auth-helpers";

export default async function SavedTuitionsPage() {
  await requireRole("student");

  return <div>Saved Tuitions Page</div>;
}
