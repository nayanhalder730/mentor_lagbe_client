import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db();

// Social login is optional — only register it when credentials are present.
const githubProvider =
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID as string,
          clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
      }
    : {};

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
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
  ...(Object.keys(githubProvider).length > 0
    ? { socialProviders: githubProvider }
    : {}),
});
