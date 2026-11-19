import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  getDashboardPath,
  normalizeRole,
  type UserRole,
} from "@/lib/roles";

export { getDashboardPath, normalizeRole };
export type { UserRole };

/**
 * Reads the Better Auth session on the server. Memoized per request so nested
 * layouts/pages do not query the session repeatedly.
 */
export const getServerSession = cache(async () => {
  const requestHeaders = await headers();

  return auth.api.getSession({ headers: requestHeaders });
});

export async function requireSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireRole(allowedRole: UserRole) {
  const session = await requireSession();
  const role = normalizeRole(session.user.role);

  if (role !== allowedRole) {
    redirect(getDashboardPath(role));
  }

  return { session, role };
}
