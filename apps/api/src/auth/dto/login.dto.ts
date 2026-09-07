import { PIN_LENGTH, PIN_PATTERN } from "@ioteedom/shared";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "024 412 8891", description: "Ghana phone number." })
  @IsString()
  phone!: string;

  @ApiProperty({
    example: "2468",
    minLength: PIN_LENGTH,
    maxLength: PIN_LENGTH,
    pattern: PIN_PATTERN.source,
    description: "4-digit PIN.",
  })
  @Matches(PIN_PATTERN, { message: "PIN must be 4 digits" })
  pin!: string;
}
