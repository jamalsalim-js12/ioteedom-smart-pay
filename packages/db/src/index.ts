import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "./generated/prisma/client";

export { PrismaClient, Prisma } from "./generated/prisma/client";
export { newId } from "./id";

function loadDatabaseUrl(): string {
  for (const candidate of [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env"),
  ]) {
    if (existsSync(candidate)) {
      loadEnv({ path: candidate });
    }
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required");
  }
  return url;
}

export function createPgAdapter(connectionString: string) {
  return new PrismaPg({ connectionString });
}

export function createPrismaClient(connectionString = loadDatabaseUrl()) {
  return new PrismaClient({
    adapter: createPgAdapter(connectionString),
  });
}
