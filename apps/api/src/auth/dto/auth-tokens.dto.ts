import { ApiProperty } from "@nestjs/swagger";

export class AuthTokensDto {
  @ApiProperty({ description: "JWT access token. Send as `Authorization: Bearer <token>`." })
  accessToken!: string;

  @ApiProperty({
    description: "Refresh token. Also set as the httpOnly `refresh_token` cookie on `/v1/auth`.",
  })
  refreshToken!: string;

  @ApiProperty({ description: "Access token lifetime in seconds.", example: 900 })
  expiresIn!: number;

  @ApiProperty({ description: "True when the user must replace their temporary PIN." })
  mustChangePin!: boolean;

  @ApiProperty({ enum: ["user", "staff"] })
  principal!: "user" | "staff";
}
