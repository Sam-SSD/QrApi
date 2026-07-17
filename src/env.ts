import { z } from "zod";

/**
 * Validación de variables de entorno al arrancar el servidor.
 * Importar este módulo desde cualquier código server-side que use env vars.
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

  // SMTP (verificación de email)
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default("QrAPI <no-reply@qrapi.local>"),

  // OAuth opcional: los proveedores solo se activan si sus vars existen
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Límites de la API pública (por API key)
  RATE_LIMIT_PER_MINUTE: z.coerce.number().default(60),
  RATE_LIMIT_PER_DAY: z.coerce.number().default(5000),

  // Secreto para el HMAC de IPs en los eventos de escaneo (QR dinámicos).
  // En producción DEBE fijarse a un valor propio; el default solo sirve en dev,
  // donde la IP suele ser null y el hash no se usa.
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
