import { requireRole } from "@/lib/auth-helpers";

export default async function MyTuitionsPage() {
  await requireRole("tutor");

  return <div>My Tuitions Page</div>;
}
