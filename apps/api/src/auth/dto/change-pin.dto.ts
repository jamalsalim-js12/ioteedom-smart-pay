import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, Matches } from "class-validator";

export class ChangePinDto {
  @ApiPropertyOptional({
    description: "Required unless `mustChangePin` is true (first login with a temp PIN).",
  })
  @IsOptional()
  @Matches(/^\d{4,6}$/, { message: "PIN must be 4 to 6 digits" })
  currentPin?: string;

  @ApiProperty({ description: "4 to 6 digit PIN." })
  @Matches(/^\d{4,6}$/, { message: "PIN must be 4 to 6 digits" })
  newPin!: string;
}
