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

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Variables de entorno inválidas:",
    z.treeifyError(parsed.error),
  );
  throw new Error("Configuración de entorno inválida. Revisa .env");
}

export const env = parsed.data;
