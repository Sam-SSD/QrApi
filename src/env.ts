import { z } from "zod";

/**
 * Environment variable validation at server boot.
 * Import this module from any server-side code that uses env vars.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatoria"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET debe tener al menos 32 caracteres"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),

  // Public URL where the app runs (docs, /r/{slug}, sitemap, metadata).
  // NEXT_PUBLIC_ prefix because client components also consume it via
  // `SITE_URL` in src/lib/constants.ts (Next inlines it at build time).
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),

  // SMTP (email verification)
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default("QrAPI <no-reply@qrapi.local>"),

  // Email verification toggle. "false" lets users register and sign in
  // without confirming their email; those users are stored with
  // emailVerified=true so re-enabling the flag later never locks them out.
  // (z.coerce.boolean() is unusable here: the string "false" is truthy.)
  AUTH_REQUIRE_EMAIL_VERIFICATION: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),

  // Optional OAuth: providers activate only when their vars exist
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Public API limits (per API key)
  RATE_LIMIT_PER_MINUTE: z.coerce.number().default(60),
  RATE_LIMIT_PER_DAY: z.coerce.number().default(5000),

  // Secret for the IP HMAC in scan events (dynamic QRs).
  // In production it MUST be set to a custom value; the default only makes
  // sense in dev, where the IP is usually null and the hash is unused.
  SCAN_IP_SECRET: z
    .string()
    .min(1)
    .default("dev-scan-ip-secret-change-in-production"),
});

/**
 * The defaults above keep `npm run dev` zero-config, but silently shipping them
 * to production is a security failure, so refuse to boot instead:
 *  - a non-https BETTER_AUTH_URL makes better-auth drop the `Secure` prefix on
 *    the session cookie (and weakens the trusted-origin check with it);
 *  - the literal SCAN_IP_SECRET makes scan IP hashes brute-forceable;
 *  - a localhost NEXT_PUBLIC_SITE_URL gets baked into *printed* QR matrices.
 *
 * Runtime only: `next build` also runs with NODE_ENV=production, and a build on
 * a dev machine must not need production secrets. During a local build (no CI /
 * VERCEL marker) only NEXT_PUBLIC_SITE_URL matters, since Next inlines it.
 */
const isLocalBuild =
  process.env.NEXT_PHASE === "phase-production-build" &&
  !process.env.CI &&
  !process.env.VERCEL;

const productionEnvSchema = envSchema.superRefine((value, ctx) => {
  if (value.NODE_ENV !== "production" || isLocalBuild) return;

  const require = (path: string, ok: boolean, message: string) => {
    if (!ok) ctx.addIssue({ code: "custom", path: [path], message });
  };

  require(
    "BETTER_AUTH_URL",
    value.BETTER_AUTH_URL.startsWith("https://"),
    "debe usar https:// en producción (si no, la cookie de sesión pierde el flag Secure)",
  );
  require(
    "SCAN_IP_SECRET",
    !value.SCAN_IP_SECRET.startsWith("dev-"),
    "define un valor propio en producción; el default es público",
  );
  require(
    "NEXT_PUBLIC_SITE_URL",
    !value.NEXT_PUBLIC_SITE_URL.includes("localhost"),
    "no puede ser localhost en producción; se codifica en los QR impresos",
  );
});

const parsed = productionEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Variables de entorno inválidas:",
    z.treeifyError(parsed.error),
  );
  throw new Error("Configuración de entorno inválida. Revisa .env");
}

export const env = parsed.data;
