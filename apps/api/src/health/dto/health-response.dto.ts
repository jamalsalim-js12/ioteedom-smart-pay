import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class HealthResponseDto {
  @ApiProperty()
  ok!: boolean;

  @ApiProperty({ enum: ["api", "worker"] })
  service!: "api" | "worker";

  @ApiPropertyOptional({ enum: ["up", "down"] })
  postgres?: "up" | "down";

  @ApiPropertyOptional({ enum: ["up", "down"] })
  redis?: "up" | "down";
}
