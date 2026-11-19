import { requireSession } from "@/lib/auth-helpers";

export default async function ProfilePage() {
  await requireSession();

  return <div>Profile Page</div>;
}
