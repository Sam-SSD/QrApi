"use server";

import { z } from "zod";
import { requireSession, revalidateDashboard } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { qrConfigSchema } from "@/lib/qr/schema";
import { createUniqueDynamicQr } from "@/lib/dynamic-qr/create";
import { buildRedirectUrl, httpUrl } from "@/lib/dynamic-qr/redirect-url";
import { hashPassword } from "@/lib/dynamic-qr/password";

const MAX_DYNAMIC_QRS = 100;

const createInput = z.object({
  title: z.string().min(1).max(80),
  targetUrl: httpUrl,
  config: qrConfigSchema,
});

/**
 * Creates a dynamic QR: generates a unique slug, creates the DynamicQr, and
 * creates the QrCode whose `data` encodes the redirect URL `/r/{slug}`. The
 * destination (targetUrl) is edited later without regenerating the code.
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

  revalidateDashboard();
  return { id: created.id, slug: dynamic.slug, redirectUrl: data };
}

/** Updates the design (visual config) of the QrCode tied to a dynamic QR. */
export async function updateDynamicDesign(qrCodeId: string, config: unknown) {
  const session = await requireSession();
  const parsed = qrConfigSchema.parse(config);
  const result = await prisma.qrCode.updateMany({
    // ownership + dynamic only (their /r/{slug} data never changes)
    where: {
      id: qrCodeId,
      userId: session.user.id,
      NOT: { dynamicQrId: null },
    },
    data: { config: { dynamic: true, config: parsed } },
  });
  if (result.count === 0) throw new Error("NOT_FOUND");
  revalidateDashboard();
}

export async function updateDynamicTarget(id: string, targetUrl: string) {
  const session = await requireSession();
  const url = httpUrl.parse(targetUrl);
  const result = await prisma.dynamicQr.updateMany({
    where: { id, userId: session.user.id }, // ownership
    data: { targetUrl: url },
  });
  if (result.count === 0) throw new Error("NOT_FOUND");
  revalidateDashboard();
}

export async function toggleDynamicActive(id: string, active: boolean) {
  const session = await requireSession();
  const result = await prisma.dynamicQr.updateMany({
    where: { id, userId: session.user.id },
    data: { active },
  });
  if (result.count === 0) throw new Error("NOT_FOUND");
  revalidateDashboard();
}

/** Protects (or unprotects, with null) a dynamic QR with a scan password. */
export async function setDynamicPassword(id: string, password: string | null) {
  const session = await requireSession();
  const clean =
    password === null ? null : z.string().min(8).max(72).parse(password);
  const result = await prisma.dynamicQr.updateMany({
    where: { id, userId: session.user.id },
    data: { passwordHash: clean ? await hashPassword(clean) : null },
  });
  if (result.count === 0) throw new Error("NOT_FOUND");
  revalidateDashboard();
}

export async function deleteDynamicQr(id: string) {
  const session = await requireSession();
  const result = await prisma.dynamicQr.deleteMany({
    where: { id, userId: session.user.id },
  });
  if (result.count === 0) throw new Error("NOT_FOUND");
  revalidateDashboard();
}
