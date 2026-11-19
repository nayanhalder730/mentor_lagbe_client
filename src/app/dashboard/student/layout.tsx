import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth-helpers";

export default async function StudentDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("student");

  return <>{children}</>;
}
