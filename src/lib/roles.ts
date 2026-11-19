/**
 * Client-safe role helpers.
 *
 * Kept free of server-only imports (`next/headers`) so both client components
 * and server helpers can share the same role definitions.
 */
export const USER_ROLES = ["student", "tutor", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

/**
 * Roles are stored in the database as strings. Anything unexpected is treated
 * as a student so a missing/malformed role can never grant elevated access.
 */
export function normalizeRole(role?: string | null): UserRole {
  return role === "tutor" || role === "admin" ? role : "student";
}

export function getDashboardPath(role?: string | null) {
  return `/dashboard/${normalizeRole(role)}`;
}
