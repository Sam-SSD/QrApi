import { Prisma, type DynamicQr } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "./slug";

/**
 * Creates a DynamicQr with a unique slug, retrying on collision (unique
 * index on slug → P2002). Shared by the Server Action and the public API.
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
        continue; // slug collision: retry with another one
      }
      throw error;
    }
  }
  throw new Error("SLUG_COLLISION");
}
