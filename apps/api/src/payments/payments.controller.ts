import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { AuthPrincipal } from "../auth/auth.types";
import { CurrentUser } from "../auth/current-user.decorator";
import { CreatePaymentDto, PaymentViewResponseDto, RetryPaymentDto } from "./dto/payments.dto";
import { PaymentsService } from "./payments.service";

function readIdempotencyKey(header: string | undefined): string {
  const key = header?.trim();
  if (!key) {
    throw new BadRequestException("Idempotency-Key header is required");
  }
  if (key.length > 128) {
    throw new BadRequestException("Idempotency-Key is too long");
  }
  return key;
}

@ApiTags("Payments")
@ApiBearerAuth("access-token")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    operationId: "postPayments",
    summary: "Start a MoMo charge",
    description:
      "Creates a payment through Paystack (test keys or recorded fixtures). Collection success is a later webhook, not this response. Dashboard fields are `ourRef`, `status`, and `displayText`.",
  })
  @ApiHeader({ name: "Idempotency-Key", required: true })
  @ApiCreatedResponse({ type: PaymentViewResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiConflictResponse({ description: "Idempotency-Key reused with a different body" })
  @ApiNotFoundResponse()
  create(
    @CurrentUser() actor: AuthPrincipal,
    @Body() dto: CreatePaymentDto,
    @Headers("idempotency-key") idempotencyKey: string | undefined,
  ) {
    return this.payments.create(actor, dto, readIdempotencyKey(idempotencyKey));
  }

  @Get(":id")
  @ApiOperation({
    operationId: "getPaymentsById",
    summary: "Payment status for the payer",
    description:
      "Returns receipt-safe fields only. Provider secrets and raw Paystack payloads stay on the server.",
  })
  @ApiOkResponse({ type: PaymentViewResponseDto })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  getById(@CurrentUser() actor: AuthPrincipal, @Param("id") id: string) {
    return this.payments.getById(actor, id);
  }

  @Post(":id/retry")
  @HttpCode(201)
  @ApiOperation({
    operationId: "postPaymentsRetry",
    summary: "Retry a failed payment",
    description: "Creates a new payment with a new `ourRef`, linked via `retryOfId`.",
  })
  @ApiHeader({ name: "Idempotency-Key", required: true })
  @ApiCreatedResponse({ type: PaymentViewResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  retry(
    @CurrentUser() actor: AuthPrincipal,
    @Param("id") id: string,
    @Body() dto: RetryPaymentDto,
    @Headers("idempotency-key") idempotencyKey: string | undefined,
  ) {
    return this.payments.retry(actor, id, dto, readIdempotencyKey(idempotencyKey));
  }
}
