import ProfileView from "@/components/dashboard/profile-view";
import { requireSession } from "@/lib/auth-helpers";

export default async function ProfilePage() {
  await requireSession();

  return <ProfileView />;
}
