import { MOMO_NETWORKS, PAYMENT_RAILS } from "@ioteedom/shared";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

const METHODS = Object.keys(MOMO_NETWORKS);
const RAILS = [...PAYMENT_RAILS];

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  billId!: string;

  @ApiProperty({ example: 12750, description: "Amount in pesewas. Must match the open bill." })
  @IsInt()
  @Min(1)
  amountPesewas!: number;

  @ApiProperty({ enum: METHODS, example: "mtn" })
  @IsIn(METHODS)
  method!: "mtn" | "telecel" | "at";

  @ApiProperty({ example: "024 412 8891" })
  @IsString()
  msisdn!: string;

  @ApiProperty({
    enum: RAILS,
    description: "Must match the bill rail. Sent so a mismatch 400s instead of silent correction.",
  })
  @IsIn(RAILS)
  rail!: "direct" | "collect" | "remit";
}

export class RetryPaymentDto {
  @ApiProperty({ enum: METHODS, example: "mtn" })
  @IsIn(METHODS)
  method!: "mtn" | "telecel" | "at";

  @ApiProperty({ example: "024 412 8891" })
  @IsString()
  msisdn!: string;

  @ApiPropertyOptional({
    enum: RAILS,
    description: "Optional. If set, must match the original payment rail.",
  })
  @IsOptional()
  @IsIn(RAILS)
  rail?: "direct" | "collect" | "remit";
}

export class PaymentViewResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: "SP-184201" })
  ourRef!: string;

  @ApiProperty({ example: "12750", description: "Pesewas as a decimal string." })
  amountPesewas!: string;

  @ApiProperty({ enum: ["GHS"] })
  currency!: "GHS";

  @ApiProperty({ enum: RAILS })
  rail!: "direct" | "collect" | "remit";

  @ApiProperty({
    enum: ["created", "pending", "succeeded", "failed", "expired", "refunded"],
  })
  status!: "created" | "pending" | "succeeded" | "failed" | "expired" | "refunded";

  @ApiProperty({ enum: ["not_required", "pending", "succeeded", "failed"] })
  fulfillmentStatus!: "not_required" | "pending" | "succeeded" | "failed";

  @ApiProperty({
    example: "Please approve the payment on your phone",
    description: "Safe for the dashboard. Never includes provider secrets.",
  })
  displayText!: string;
}
