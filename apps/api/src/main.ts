import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import type { AppEnv } from "./config/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppEnv, true>);
  const port = config.get("API_PORT", { infer: true });
  const origin = config.get("API_CORS_ORIGIN", { infer: true });

  app.setGlobalPrefix("v1");
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({ origin, credentials: true });
  app.enableShutdownHooks();

  await app.listen(port);
  Logger.log(`API listening on http://localhost:${port}/v1`, "Bootstrap");
}

void bootstrap();
