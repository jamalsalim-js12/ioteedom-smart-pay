import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PaymentsWebhookController } from "./payments-webhook.controller";
import { PaystackAdapter } from "./provider/paystack.adapter";
import { ProviderAdapter } from "./provider/provider.adapter";

@Module({
  controllers: [PaymentsController, PaymentsWebhookController],
  providers: [
    PaystackAdapter,
    { provide: ProviderAdapter, useExisting: PaystackAdapter },
    PaymentsService,
  ],
  exports: [PaymentsService, ProviderAdapter],
})
export class PaymentsModule {}
