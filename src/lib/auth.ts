import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI as string);

/**
 * Environment values pasted into hosting dashboards can retain inline
 * comments (for example `mentor_lagbe # Name of your MongoDB database`).
 * dotenv strips those locally, but Vercel does not, and MongoDB then rejects
 * the name outright, making every DB-backed auth endpoint return 500.
 */
function resolveDatabaseName(): string {
  const raw = process.env.MONGODB_DB_NAME;

  if (typeof raw !== "string") return "mentor_lagbe";

  const cleaned = raw.replace(/\s+#.*$/, "").trim();

  return cleaned || "mentor_lagbe";
}

const db = client.db(resolveDatabaseName());

// Social login is optional — only register providers when credentials exist.
const socialProviders = {
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID as string,
          clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
      }
    : {}),
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {}),
};

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      // BetterAuth's email/password account provider id is "credential".
      trustedProviders: ["google", "github", "credential"],
      // Existing users created with email/password have emailVerified: false.
      // Allow their Google/GitHub identity to link to the same email.
      requireLocalEmailVerified: false,
    },
  },
  user: {
    additionalFields: {
      // Role is never accepted as generic client input. The create hook below
      // reads the role from the trusted email/password sign-up request only,
      // and update-user rejects any attempt to submit this field.
      role: {
        type: "string",
        defaultValue: "student",
        required: false,
        input: false,
      },
      // Plan is server-controlled. Only the Stripe webhook may upgrade it.
      plan: {
        type: "string",
        defaultValue: "free",
        required: false,
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          // `role.input` is false, so role never arrives through normal user
          // input. Read it only from the email/password sign-up request, where
          // the form still submits a role. All other creation paths (including
          // Google/GitHub) default to "student".
          const requestedRole =
            context?.path === "/sign-up/email"
              ? (context.body as { role?: unknown } | undefined)?.role
              : undefined;

          // Only "student" or "tutor" may be chosen at sign-up.
          // Anything else (e.g. "admin") falls back to "student".
          const role = requestedRole === "tutor" ? "tutor" : "student";
          // Mark verified locally (no SMTP verification in this app) so
          // Google/GitHub identities can link to email/password accounts.
          return { data: { ...user, role, emailVerified: true } };
        },
      },
    },
  },
  // Issues short-lived JWTs for first-party services (e.g. the Express API).
  // Uses the plugin's secure defaults: Ed25519 JWKS keys stored in MongoDB,
  // encrypted private key, 15-minute expiry, and issuer/audience from baseURL.
  plugins: [jwt()],
  ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
});