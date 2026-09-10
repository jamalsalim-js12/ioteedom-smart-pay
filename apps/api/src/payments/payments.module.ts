import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PaystackAdapter } from "./provider/paystack.adapter";
import { ProviderAdapter } from "./provider/provider.adapter";

@Module({
  controllers: [PaymentsController],
  providers: [
    PaystackAdapter,
    { provide: ProviderAdapter, useExisting: PaystackAdapter },
    PaymentsService,
  ],
  exports: [PaymentsService, ProviderAdapter],
})
export class PaymentsModule {}
