import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { verificationEmail } from "@/emails/verification";
import { env } from "@/env";

const requireEmailVerification = env.AUTH_REQUIRE_EMAIL_VERIFICATION;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification,
    // Explicit: with verification off, sign-up starts a session right away.
    autoSignIn: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  emailVerification: {
    sendOnSignUp: requireEmailVerification,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const email = verificationEmail({ name: user.name, url });
      await sendMail({ to: user.email, ...email });
    },
  },
  // With verification disabled, mark new users verified at creation so a
  // future re-enable of the flag cannot lock them out.
  ...(requireEmailVerification
    ? {}
    : {
        databaseHooks: {
          user: {
            create: {
              before: async (user) => ({
                data: { ...user, emailVerified: true },
              }),
            },
          },
        },
      }),
  socialProviders: {
    ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  plugins: [nextCookies()],
});

/** Session guard for Server Actions: throws when there is no session. */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

/** Revalidates the whole dashboard layout after a mutation. */
export function revalidateDashboard() {
  revalidatePath("/[locale]/dashboard", "layout");
}

/** OAuth providers active according to the env vars present. */
export function activeOAuthProviders(): Array<"github" | "google"> {
  const providers: Array<"github" | "google"> = [];
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)
    providers.push("github");
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
    providers.push("google");
  return providers;
}
