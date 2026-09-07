import { PIN_LENGTH, PIN_PATTERN } from "@ioteedom/shared";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, Matches } from "class-validator";

export class ChangePinDto {
  @ApiPropertyOptional({
    minLength: PIN_LENGTH,
    maxLength: PIN_LENGTH,
    pattern: PIN_PATTERN.source,
    description: "Required unless `mustChangePin` is true (first login with a temp PIN).",
  })
  @IsOptional()
  @Matches(PIN_PATTERN, { message: "PIN must be 4 digits" })
  currentPin?: string;

  @ApiProperty({
    example: "2468",
    minLength: PIN_LENGTH,
    maxLength: PIN_LENGTH,
    pattern: PIN_PATTERN.source,
    description: "4-digit PIN.",
  })
  @Matches(PIN_PATTERN, { message: "PIN must be 4 digits" })
  newPin!: string;
}
