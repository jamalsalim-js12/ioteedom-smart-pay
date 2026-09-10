import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerModule } from "@nestjs/throttler";
import type { AppEnv } from "../config/env";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { LoginThrottlerGuard } from "./login-throttler.guard";
import { MeController } from "./me.controller";
import { StaffGuard } from "./staff.guard";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>) => ({
        secret: config.get("JWT_ACCESS_SECRET", { infer: true }),
        signOptions: {
          expiresIn: "15m",
          issuer: "ioteedom-smart-pay",
          audience: "api",
        },
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: "default", ttl: 60_000, limit: 100 }],
    }),
  ],
  controllers: [AuthController, MeController],
  providers: [
    AuthService,
    LoginThrottlerGuard,
    StaffGuard,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [AuthService, StaffGuard],
})
export class AuthModule {}
