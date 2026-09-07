import { Body, Controller, HttpCode, Post } from "@nestjs/common";
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
import {
  CompleteOnboardingDto,
  OnboardingCompleteResponseDto,
} from "./dto/complete-onboarding.dto";
import { OnboardingService } from "./onboarding.service";

@ApiTags("Onboarding")
@ApiBearerAuth("access-token")
@Controller("onboarding")
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post("complete")
  @HttpCode(200)
  @ApiOperation({
    operationId: "postOnboardingComplete",
    summary: "Confirm the invited property and mark the account active",
    description:
      "Owner-only. Confirms the invited property for the account and marks onboarding complete so the household dashboard is available.",
  })
  @ApiOkResponse({
    type: OnboardingCompleteResponseDto,
    description: "Account marked active.",
  })
  @ApiUnauthorizedResponse({ description: "Access token missing or invalid." })
  @ApiForbiddenResponse({ description: "Staff caller, or the account is suspended." })
  @ApiNotFoundResponse({ description: "No owner membership for this account." })
  complete(@CurrentUser() user: AuthPrincipal, @Body() dto: CompleteOnboardingDto) {
    return this.onboarding.complete(user, dto);
  }
}
