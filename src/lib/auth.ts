import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { verificationEmail } from "@/emails/verification";
import { env } from "@/env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const email = verificationEmail({ name: user.name, url });
      await sendMail({ to: user.email, ...email });
    },
  },
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

export type Session = typeof auth.$Infer.Session;

/** Proveedores OAuth activos según las env vars presentes. */
export function activeOAuthProviders(): Array<"github" | "google"> {
  const providers: Array<"github" | "google"> = [];
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)
    providers.push("github");
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
    providers.push("google");
  return providers;
}
