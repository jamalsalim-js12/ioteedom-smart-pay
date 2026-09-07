import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RefreshDto {
  @ApiPropertyOptional({
    description: "Refresh token. Omit when the `refresh_token` cookie is present.",
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
