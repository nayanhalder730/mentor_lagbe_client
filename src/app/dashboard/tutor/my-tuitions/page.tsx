import MyTuitionsView from "@/components/dashboard/tutor/my-tuitions-view";
import { requireRole } from "@/lib/auth-helpers";

export default async function MyTuitionsPage() {
  await requireRole("tutor");

  return <MyTuitionsView />;
}
