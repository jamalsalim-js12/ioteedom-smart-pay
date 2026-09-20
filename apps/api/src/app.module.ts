import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { BillsModule } from "./bills/bills.module";
import { validateEnv } from "./config/env";
import { HealthModule } from "./health/health.module";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { OpsModule } from "./ops/ops.module";
import { PaymentsModule } from "./payments/payments.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UnitsModule } from "./units/units.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env"],
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    OnboardingModule,
    OpsModule,
    PaymentsModule,
    BillsModule,
    UnitsModule,
  ],
})
export class AppModule {}
