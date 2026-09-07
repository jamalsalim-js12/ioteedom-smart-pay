import { PrismaClient } from "@prisma/client";

export { PrismaClient };
export type { Prisma } from "@prisma/client";
export { newId } from "./id";

export function createPrismaClient() {
  return new PrismaClient();
}
