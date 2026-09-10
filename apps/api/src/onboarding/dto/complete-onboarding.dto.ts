import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class CompleteOnboardingDto {
  @ApiProperty({ description: "Owner account to finish inviting." })
  @IsString()
  accountId!: string;

  @ApiProperty({ example: "12 Boundary Rd, East Legon" })
  @IsString()
  @MinLength(1)
  address!: string;

  @ApiProperty({ example: "Accra" })
  @IsString()
  @MinLength(1)
  city!: string;

  @ApiPropertyOptional({ example: "0412345678", description: "ECG customer or meter number." })
  @IsOptional()
  @IsString()
  ecgAccountNumber?: string;

  @ApiPropertyOptional({
    example: "2001234567",
    description: "Ghana Water customer number.",
  })
  @IsOptional()
  @IsString()
  gwclAccountNumber?: string;
}

export class OnboardingCompleteResponseDto {
  @ApiProperty()
  accountId!: string;

  @ApiProperty({ enum: ["active"] })
  status!: "active";

  @ApiProperty({ type: String, format: "date-time" })
  onboardedAt!: string;
}
