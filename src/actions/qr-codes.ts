"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  qrConfigSchema,
  payloadSchema,
  MAX_QR_DATA_LENGTH,
} from "@/lib/qr/schema";
import { buildPayload } from "@/lib/qr/payloads";
import type { QrContentType } from "@prisma/client";

const MAX_SAVED_QRS = 100;

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

const saveQrInput = z.object({
  name: z.string().min(1).max(80),
  payload: payloadSchema,
  config: qrConfigSchema,
});

export async function saveQrCode(input: z.infer<typeof saveQrInput>) {
  const session = await requireSession();
  const parsed = saveQrInput.parse(input);
  const data = buildPayload(parsed.payload);
  if (data.length > MAX_QR_DATA_LENGTH) throw new Error("PAYLOAD_TOO_LONG");

  const count = await prisma.qrCode.count({
    where: { userId: session.user.id },
  });
  if (count >= MAX_SAVED_QRS) throw new Error("LIMIT_REACHED");

  const created = await prisma.qrCode.create({
    data: {
      userId: session.user.id,
      name: parsed.name,
      type: parsed.payload.type.toUpperCase() as QrContentType,
      data,
      config: { payload: parsed.payload, config: parsed.config },
    },
  });
  revalidatePath("/[locale]/dashboard", "layout");
  return { id: created.id };
}

export async function renameQrCode(id: string, name: string) {
  const session = await requireSession();
  const clean = z.string().min(1).max(80).parse(name);
  await prisma.qrCode.update({
    // ownership: solo filas del usuario
    where: { id, userId: session.user.id },
    data: { name: clean },
  });
  revalidatePath("/[locale]/dashboard", "layout");
}

export async function deleteQrCode(id: string) {
  const session = await requireSession();
  await prisma.qrCode.delete({
    where: { id, userId: session.user.id },
  });
  revalidatePath("/[locale]/dashboard", "layout");
}

export async function duplicateQrCode(id: string) {
  const session = await requireSession();
  const original = await prisma.qrCode.findUnique({
    where: { id, userId: session.user.id },
  });
  if (!original) throw new Error("NOT_FOUND");
  await prisma.qrCode.create({
    data: {
      userId: session.user.id,
      name: `${original.name} (copia)`.slice(0, 80),
      type: original.type,
      data: original.data,
      config: original.config as object,
    },
  });
  revalidatePath("/[locale]/dashboard", "layout");
}

/** Migra el historial anónimo de localStorage a la cuenta tras el login. */
export async function importHistory(
  items: Array<{ name: string; payload: unknown; config: unknown }>,
) {
  const session = await requireSession();
  const limited = items.slice(0, 20);
  let imported = 0;
  for (const item of limited) {
    const parsed = saveQrInput.safeParse(item);
    if (!parsed.success) continue;
    const data = buildPayload(parsed.data.payload);
    await prisma.qrCode.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        type: parsed.data.payload.type.toUpperCase() as QrContentType,
        data,
        config: { payload: parsed.data.payload, config: parsed.data.config },
      },
    });
    imported++;
  }
  revalidatePath("/[locale]/dashboard", "layout");
  return { imported };
}
