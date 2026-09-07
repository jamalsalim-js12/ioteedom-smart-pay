import { Controller, Get } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import type { AuthPrincipal } from "./auth.types";
import { CurrentUser } from "./current-user.decorator";
import { MeStaffResponseDto, MeUserResponseDto } from "./dto/me-response.dto";

@ApiTags("me")
@ApiExtraModels(MeUserResponseDto, MeStaffResponseDto)
@Controller("me")
export class MeController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  @ApiBearerAuth("access-token")
  @ApiOperation({ operationId: "getMe", summary: "Current user or staff session" })
  @ApiOkResponse({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(MeUserResponseDto) },
        { $ref: getSchemaPath(MeStaffResponseDto) },
      ],
      discriminator: {
        propertyName: "kind",
        mapping: {
          user: getSchemaPath(MeUserResponseDto),
          staff: getSchemaPath(MeStaffResponseDto),
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
  me(@CurrentUser() user: AuthPrincipal) {
    return this.auth.me(user);
  }
}
