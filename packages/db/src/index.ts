import { PrismaClient } from "@prisma/client";

export { PrismaClient };
export type { Prisma } from "@prisma/client";

export function createPrismaClient() {
  return new PrismaClient();
}
