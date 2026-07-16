import { prisma } from "../src/lib/prisma";
import { generateApiToken } from "../src/lib/api-keys";

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "prueba@qrforge.local" },
  });
  if (!user) throw new Error("usuario de prueba no existe");

  const { token, prefix, keyHash } = generateApiToken();
  await prisma.apiKey.create({
    data: { userId: user.id, name: "clave-cli-test", prefix, keyHash },
  });
  console.log(token);
  await prisma.$disconnect();
}

main();
