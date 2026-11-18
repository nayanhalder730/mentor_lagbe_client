import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db(process.env.MONGODB_DB_NAME ?? "mentor_lagbe");

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
      trustedProviders: ["google", "github", "email"],
      // Existing users created with email/password have emailVerified: false.
      // Allow their Google/GitHub identity to link to the same email.
      requireLocalEmailVerified: false,
    },
  },
  user: {
    additionalFields: {
      // Every new account is a Student, unless a role is sent at sign-up.
      role: {
        type: "string",
        defaultValue: "student",
        required: false,
        input: true,
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
        before: async (user) => {
          // Only "student" or "tutor" may be chosen at sign-up.
          // Anything else (e.g. "admin") falls back to "student".
          const role = user.role === "tutor" ? "tutor" : "student";
          // Mark verified locally (no SMTP verification in this app) so
          // Google/GitHub identities can link to email/password accounts.
          return { data: { ...user, role, emailVerified: true } };
        },
      },
    },
  },
  ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
});