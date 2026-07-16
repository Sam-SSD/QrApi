"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiToken } from "@/lib/api-keys";

const MAX_KEYS_PER_USER = 10;

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function createApiKey(name: string) {
  const session = await requireSession();
  const clean = z.string().min(1).max(60).parse(name.trim());

  const count = await prisma.apiKey.count({
    where: { userId: session.user.id, revokedAt: null },
  });
  if (count >= MAX_KEYS_PER_USER) throw new Error("LIMIT_REACHED");

  const { token, prefix, keyHash } = generateApiToken();
  const created = await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      name: clean,
      prefix,
      keyHash,
    },
  });

  revalidatePath("/[locale]/dashboard", "layout");
  // El token completo solo viaja aquí, una única vez.
  return { id: created.id, token, prefix };
}

export async function revokeApiKey(id: string) {
  const session = await requireSession();
  await prisma.apiKey.update({
    where: { id, userId: session.user.id },
    data: { revokedAt: new Date() },
  });
  revalidatePath("/[locale]/dashboard", "layout");
}

export async function deleteApiKey(id: string) {
  const session = await requireSession();
  await prisma.apiKey.delete({
    where: { id, userId: session.user.id },
  });
  revalidatePath("/[locale]/dashboard", "layout");
}
