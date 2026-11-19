import { requireRole } from "@/lib/auth-helpers";

export default async function PostTuitionPage() {
  await requireRole("tutor");

  return <div>Post Tuition Page</div>;
}
