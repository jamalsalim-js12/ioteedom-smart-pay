import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { AuthPrincipal } from "../auth/auth.types";
import { CurrentUser } from "../auth/current-user.decorator";
import { UnitEcgStatusDto, UnitEcgStatusListResponseDto } from "./dto/units.dto";
import { UnitsService } from "./units.service";

@ApiTags("Units")
@ApiBearerAuth("access-token")
@Controller("units")
export class UnitsController {
  constructor(private readonly units: UnitsService) {}

  @Get("ecg-status")
  @ApiOperation({
    operationId: "getUnitsEcgStatus",
    summary: "Tenant ECG status for every unit the owner controls",
    description:
      "Estate owners see whether each unit's power is settled. They cannot pay those bills — only the tenant can.",
  })
  @ApiOkResponse({ type: UnitEcgStatusListResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  listEcgStatus(@CurrentUser() actor: AuthPrincipal) {
    return this.units.listEcgStatus(actor);
  }

  @Get(":id/ecg-status")
  @ApiOperation({
    operationId: "getUnitsByIdEcgStatus",
    summary: "ECG status for one unit",
    description: "Owner-only. Status view — not a pay endpoint.",
  })
  @ApiOkResponse({ type: UnitEcgStatusDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  getEcgStatus(@CurrentUser() actor: AuthPrincipal, @Param("id") id: string) {
    return this.units.getEcgStatus(actor, id);
  }
}
