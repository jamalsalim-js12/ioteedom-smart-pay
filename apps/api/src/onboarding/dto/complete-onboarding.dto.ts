import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

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
}

export class OnboardingCompleteResponseDto {
  @ApiProperty()
  accountId!: string;

  @ApiProperty({ enum: ["active"] })
  status!: "active";

  @ApiProperty({ type: String, format: "date-time" })
  onboardedAt!: string;
}
