import { redirect } from "next/navigation";

import { getDashboardPath, requireSession } from "@/lib/auth-helpers";

export default async function DashboardPage() {
  const session = await requireSession();

  redirect(getDashboardPath(session.user.role));
}
