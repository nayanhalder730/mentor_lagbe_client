import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

// Browser-safe env var. Falls back to the current origin when not set.
const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

export const authClient = createAuthClient({
  ...(baseURL ? { baseURL } : {}),
  plugins: [inferAdditionalFields<typeof auth>(), jwtClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
