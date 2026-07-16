import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await prisma.apiKey.updateMany({
    where: { name: "clave-cli-test" },
    data: { revokedAt: new Date() },
  });
  console.log("revocadas:", result.count);
  await prisma.$disconnect();
}

main();
