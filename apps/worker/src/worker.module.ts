import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import type { WorkerEnv } from "./config/env";
import { validateEnv } from "./config/env";
import { HEALTH_QUEUE, HealthProcessor } from "./queues/health.processor";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env"],
      validate: validateEnv,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<WorkerEnv, true>) => ({
        connection: {
          url: config.get("REDIS_URL", { infer: true }),
        },
      }),
    }),
    BullModule.registerQueue({ name: HEALTH_QUEUE }),
  ],
  providers: [HealthProcessor],
})
export class WorkerModule {}
