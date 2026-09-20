import { Controller, Get } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { AuthPrincipal } from "../auth/auth.types";
import { CurrentUser } from "../auth/current-user.decorator";
import { BillsService } from "./bills.service";
import { BillListResponseDto } from "./dto/bills.dto";

@ApiTags("Bills")
@ApiBearerAuth("access-token")
@Controller("bills")
export class BillsController {
  constructor(private readonly bills: BillsService) {}

  @Get()
  @ApiOperation({
    operationId: "getBills",
    summary: "Bills visible to the signed-in user",
    description:
      "Owners see property-level bills (their ECG, GWCL). Tenants see bills on their open occupancy. Unit ECG is never payable by the estate owner here.",
  })
  @ApiOkResponse({ type: BillListResponseDto })
  @ApiUnauthorizedResponse()
  list(@CurrentUser() actor: AuthPrincipal) {
    return this.bills.listForActor(actor);
  }
}
