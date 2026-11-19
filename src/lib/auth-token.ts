import { authClient } from "@/lib/auth-client";

export type JwtTokenResult =
  | { token: string; error: null }
  | { token: null; error: string };

/**
 * Requests a short-lived JWT (15 minutes by default) for the current session
 * from Better Auth's `/api/auth/token` endpoint.
 *
 * Use the token as `Authorization: Bearer <token>` when calling services that
 * verify it against `GET /api/auth/jwks`. Never store it in localStorage.
 */
export async function getJwtToken(): Promise<JwtTokenResult> {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    return {
      token: null,
      error: error?.message ?? "Could not retrieve a JWT for the current session.",
    };
  }

  return { token: data.token, error: null };
}
