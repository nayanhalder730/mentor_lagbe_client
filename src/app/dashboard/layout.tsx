import type { ReactNode } from "react";

import DashboardShell from "@/components/dashboard/dashboard-shell";
import { normalizeRole, requireSession } from "@/lib/auth-helpers";

// Dashboard routes depend on the request session, so they render dynamically.
export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side guard for every dashboard route (including /dashboard/profile).
  const session = await requireSession();
  const role = normalizeRole(session.user.role);

  return (
    <DashboardShell
      role={role}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
    >
      {children}
    </DashboardShell>
  );
}
