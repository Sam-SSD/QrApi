"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { qrConfigSchema } from "@/lib/qr/schema";
import { createUniqueDynamicQr } from "@/lib/dynamic-qr/create";
import { buildRedirectUrl } from "@/lib/dynamic-qr/redirect-url";
import { hashPassword } from "@/lib/dynamic-qr/password";

const MAX_DYNAMIC_QRS = 100;

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

// Solo http/https: `new URL()` (y z.url()) aceptarían javascript:/data:, que no
// deben vivir en un redirector público bajo nuestro dominio.
const httpUrl = z
  .string()
  .url()
  .max(2048)
  .refine((u) => /^https?:\/\//i.test(u), "URL debe ser http(s)");

const createInput = z.object({
  title: z.string().min(1).max(80),
  targetUrl: httpUrl,
  config: qrConfigSchema,
});

/**
 * Crea un QR dinámico: genera un slug único, crea el DynamicQr, y crea el
 * QrCode cuyo `data` codifica la URL de redirección `/r/{slug}`. El destino
 * (targetUrl) se edita luego sin regenerar el código.
 */
export async function createDynamicQr(input: z.infer<typeof createInput>) {
  const session = await requireSession();
  const parsed = createInput.parse(input);

  const count = await prisma.dynamicQr.count({
    where: { userId: session.user.id },
  });
  if (count >= MAX_DYNAMIC_QRS) throw new Error("LIMIT_REACHED");

  const dynamic = await createUniqueDynamicQr({
    userId: session.user.id,
    title: parsed.title,
    targetUrl: parsed.targetUrl,
  });

  const data = buildRedirectUrl(dynamic.slug);
  const created = await prisma.qrCode.create({
    data: {
      userId: session.user.id,
      name: parsed.title,
      type: "URL",
      data,
      config: { dynamic: true, config: parsed.config },
      dynamicQrId: dynamic.id,
    },
  });

  revalidatePath("/[locale]/dashboard", "layout");
  return { id: created.id, slug: dynamic.slug, redirectUrl: data };
}

/** Actualiza el diseño (config visual) del QrCode asociado a un dinámico. */
export async function updateDynamicDesign(qrCodeId: string, config: unknown) {
  const session = await requireSession();
  const parsed = qrConfigSchema.parse(config);
  const result = await prisma.qrCode.updateMany({
    // ownership + solo dinámicos (su data /r/{slug} no cambia)
    where: {
      id: qrCodeId,
      userId: session.user.id,
      NOT: { dynamicQrId: null },
    },
    data: { config: { dynamic: true, config: parsed } },
  });
  if (result.count === 0) throw new Error("NOT_FOUND");
  revalidatePath("/[locale]/dashboard", "layout");
}

export async function updateDynamicTarget(id: string, targetUrl: string) {
  const session = await requireSession();
  const url = httpUrl.parse(targetUrl);
  const result = await prisma.dynamicQr.updateMany({
    where: { id, userId: session.user.id }, // ownership
    data: { targetUrl: url },
  });
  if (result.count === 0) throw new Error("NOT_FOUND");
  revalidatePath("/[locale]/dashboard", "layout");
}

export async function toggleDynamicActive(id: string, active: boolean) {
  const session = await requireSession();
  const result = await prisma.dynamicQr.updateMany({
    where: { id, userId: session.user.id },
    data: { active },
  });
  if (result.count === 0) throw new Error("NOT_FOUND");
  revalidatePath("/[locale]/dashboard", "layout");
}

/** Protege (o desprotege, con null) un dinámico con contraseña de escaneo. */
export async function setDynamicPassword(id: string, password: string | null) {
  const session = await requireSession();
  const clean =
    password === null ? null : z.string().min(4).max(72).parse(password);
  const result = await prisma.dynamicQr.updateMany({
    where: { id, userId: session.user.id },
    data: { passwordHash: clean ? hashPassword(clean) : null },
  });
  if (result.count === 0) throw new Error("NOT_FOUND");
  revalidatePath("/[locale]/dashboard", "layout");
}

export async function deleteDynamicQr(id: string) {
  const session = await requireSession();
  const result = await prisma.dynamicQr.deleteMany({
    where: { id, userId: session.user.id },
  });
  if (result.count === 0) throw new Error("NOT_FOUND");
  revalidatePath("/[locale]/dashboard", "layout");
}
