import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

type MongoAdapterFactory = ReturnType<typeof mongodbAdapter>;
type MongoAdapter = ReturnType<MongoAdapterFactory>;
type MongoAdapterOptions = Parameters<MongoAdapterFactory>[0];

/**
 * Next.js can evaluate this module more than once in one process, so the
 * client and its single connection attempt live on globalThis. Both are
 * created lazily on the first database operation, never at module load, so
 * builds/prerenders that never touch auth do not open a database connection.
 */
const mongoGlobal = globalThis as typeof globalThis & {
  __mentorLagbeMongoClient?: MongoClient;
  __mentorLagbeConnectionPromise?: Promise<MongoClient>;
};

function getMongoClient(): MongoClient {
  if (!mongoGlobal.__mentorLagbeMongoClient) {
    const uri = process.env.MONGODB_URI;

    if (typeof uri !== "string" || uri.trim() === "") {
      throw new Error("MONGODB_URI is not configured");
    }

    mongoGlobal.__mentorLagbeMongoClient = new MongoClient(uri);
  }

  return mongoGlobal.__mentorLagbeMongoClient;
}

/**
 * Concurrent requests share one connect() attempt. On failure both the
 * rejected promise AND the client are evicted: the MongoDB driver closes the
 * topology when connect() fails, so keeping that client cached would make
 * every later request fail with MongoTopologyClosedError. A fresh attempt on
 * a fresh client is therefore safe. Nothing here ever calls close(), so
 * requests already in flight keep using their connected client.
 */
function getConnectionPromise(): Promise<MongoClient> {
  if (!mongoGlobal.__mentorLagbeConnectionPromise) {
    const client = getMongoClient();

    const attempt = client.connect().catch((error: unknown) => {
      // Only evict if this attempt is still the cached one; a newer attempt
      // may have already installed fresh state.
      if (mongoGlobal.__mentorLagbeConnectionPromise === attempt) {
        mongoGlobal.__mentorLagbeConnectionPromise = undefined;
      }
      if (mongoGlobal.__mentorLagbeMongoClient === client) {
        mongoGlobal.__mentorLagbeMongoClient = undefined;
      }
      throw error;
    });

    mongoGlobal.__mentorLagbeConnectionPromise = attempt;
  }

  return mongoGlobal.__mentorLagbeConnectionPromise;
}

async function getReadyDb() {
  const client = await getConnectionPromise();
  return client.db(resolveDatabaseName());
}

const ADAPTER_METHODS = [
  "create",
  "findOne",
  "findMany",
  "count",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
  "consumeOne",
  "incrementOne",
  "transaction",
] as const;

/**
 * Better Auth resolves its `database` option synchronously, but the MongoDB
 * adapter starts index creation as soon as it is constructed. The factory
 * therefore returns a delegating adapter: every operation first awaits one
 * shared, retryable readiness promise and only then forwards to the real
 * adapter. That is what keeps auth operations off an unconnected — or
 * previously failed — topology; caching a promise alone would not.
 */
function createReadyDatabaseFactory(): MongoAdapterFactory {
  return (options: MongoAdapterOptions): MongoAdapter => {
    let adapterPromise: Promise<MongoAdapter> | null = null;

    const getAdapter = (): Promise<MongoAdapter> => {
      if (!adapterPromise) {
        const pending = getReadyDb().then((db) => mongodbAdapter(db)(options));
        adapterPromise = pending;

        // A failed connect/construction must not be cached forever.
        void pending.catch(() => {
          if (adapterPromise === pending) adapterPromise = null;
        });
      }

      return adapterPromise;
    };

    const adapter = {} as MongoAdapter;

    const delegate =
      (method: (typeof ADAPTER_METHODS)[number]) =>
      (...args: unknown[]) =>
        getAdapter().then((ready) => {
          const handler = ready[method] as
            | ((...callArgs: unknown[]) => unknown)
            | undefined;

          if (typeof handler !== "function") {
            throw new Error(`MongoDB adapter does not implement ${method}`);
          }

          return handler.apply(ready, args);
        });

    for (const method of ADAPTER_METHODS) {
      Object.defineProperty(adapter, method, {
        value: delegate(method),
        enumerable: true,
        configurable: true,
      });
    }

    Object.defineProperty(adapter, "id", {
      value: "mongodb-adapter",
      enumerable: true,
      configurable: true,
    });

    // Better Auth reads adapter.options?.adapterConfig.transaction to decide
    // when to flush pending hooks after an error. The adapter is built with
    // no `client` config, which disables transactions, so mirror that value
    // here without forcing a connection while resolving the database option.
    Object.defineProperty(adapter, "options", {
      value: { adapterConfig: { adapterId: "mongodb-adapter", transaction: false } },
      enumerable: true,
      configurable: true,
    });

    return adapter;
  };
}

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

const readyDatabase = createReadyDatabaseFactory();

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
  database: readyDatabase,
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