import {
  Controller,
  Headers,
  HttpCode,
  Post,
  type RawBodyRequest,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import type { Request } from "express";
import { Public } from "../auth/public.decorator";
import { PaymentsService } from "./payments.service";

@ApiExcludeController()
@Controller("webhooks/payments")
export class PaymentsWebhookController {
  constructor(private readonly payments: PaymentsService) {}

  @Public()
  @Post("paystack")
  @HttpCode(200)
  async paystack(
    @Req() req: RawBodyRequest<Request>,
    @Headers("x-paystack-signature") signature: string | undefined,
  ) {
    const raw = req.rawBody;
    if (!raw) {
      throw new UnauthorizedException("Raw body required for Paystack signature check");
    }
    try {
      return await this.payments.handlePaystackWebhook(raw, signature);
    } catch {
      throw new UnauthorizedException("Invalid Paystack signature");
    }
  }
}
