import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { AuthPrincipal } from "../auth/auth.types";
import { CurrentUser } from "../auth/current-user.decorator";
import { StaffGuard } from "../auth/staff.guard";
import {
  InviteOwnerDto,
  OpsAccountListItemDto,
  OpsAccountListResponseDto,
  OpsAuditListResponseDto,
  OpsInviteResponseDto,
} from "./dto/ops.dto";
import { OpsService } from "./ops.service";

@ApiTags("ops")
@ApiBearerAuth("access-token")
@UseGuards(StaffGuard)
@Controller("ops")
export class OpsController {
  constructor(private readonly ops: OpsService) {}

  @Post("invites")
  @ApiOperation({ operationId: "postOpsInvites", summary: "Invite a property owner" })
  @ApiCreatedResponse({ type: OpsInviteResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse({ description: "Caller is not staff" })
  @ApiConflictResponse({ description: "Phone already on the platform" })
  inviteOwner(@CurrentUser() staff: AuthPrincipal, @Body() dto: InviteOwnerDto) {
    return this.ops.inviteOwner(staff, dto);
  }

  @Get("accounts")
  @ApiOperation({ operationId: "getOpsAccounts", summary: "List owner accounts" })
  @ApiOkResponse({ type: OpsAccountListResponseDto })
  listAccounts() {
    return this.ops.listAccounts();
  }

  @Get("accounts/:id")
  @ApiOperation({ operationId: "getOpsAccountsById", summary: "Owner account for support" })
  @ApiOkResponse({ type: OpsAccountListItemDto })
  @ApiNotFoundResponse()
  getAccount(@Param("id") id: string) {
    return this.ops.getAccount(id);
  }

  @Get("audit")
  @ApiOperation({ operationId: "getOpsAudit", summary: "Recent staff audit events" })
  @ApiOkResponse({ type: OpsAuditListResponseDto })
  listAudit() {
    return this.ops.listAudit();
  }
}
