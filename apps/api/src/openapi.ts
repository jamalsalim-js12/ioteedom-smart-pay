import { writeFileSync } from "node:fs";
import path from "node:path";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { buildOpenApiDocument } from "./swagger";

process.env.OPENAPI_EXPORT = "1";

async function main() {
  const app = await NestFactory.create(AppModule, { logger: ["error"] });
  app.setGlobalPrefix("v1");
  const document = buildOpenApiDocument(app);
  const out = path.resolve(__dirname, "../openapi.json");
  writeFileSync(out, `${JSON.stringify(document, null, 2)}\n`);
  await app.close();
  Logger.log(`Wrote ${out}`, "OpenAPI");
}

void main();
