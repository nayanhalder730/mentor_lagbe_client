import PostTuitionView from "@/components/dashboard/tutor/post-tuition-view";
import { requireRole } from "@/lib/auth-helpers";

export default async function PostTuitionPage() {
  await requireRole("tutor");

  return <PostTuitionView />;
}
