import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth-helpers";

export default async function TutorDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("tutor");

  return <>{children}</>;
}
