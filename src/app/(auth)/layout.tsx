import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getDashboardPath, getServerSession } from "@/lib/auth-helpers";

// Auth pages must check the session at request time (no prerendering).
export const instant = false;

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession();

  // Already signed in — send the user to the dashboard for their real role.
  if (session) {
    redirect(getDashboardPath(session.user.role));
  }

  return <>{children}</>;
}
