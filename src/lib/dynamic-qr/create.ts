import { Prisma, type DynamicQr } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "./slug";

/**
 * Crea un DynamicQr con slug único, reintentando ante colisión (índice único
 * sobre slug → P2002). Compartido por la Server Action y la API pública.
 */
export async function createUniqueDynamicQr(input: {
  userId: string;
  title: string;
  targetUrl: string;
}): Promise<DynamicQr> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.dynamicQr.create({
        data: { ...input, slug: generateSlug() },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue; // colisión de slug: reintenta con otro
      }
      throw error;
    }
  }
  throw new Error("SLUG_COLLISION");
}
