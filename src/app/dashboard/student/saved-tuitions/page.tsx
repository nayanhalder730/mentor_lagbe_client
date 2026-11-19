import SavedTuitionsView from "@/components/dashboard/student/saved-tuitions-view";
import { requireRole } from "@/lib/auth-helpers";

export default async function SavedTuitionsPage() {
  await requireRole("student");

  return <SavedTuitionsView />;
}
