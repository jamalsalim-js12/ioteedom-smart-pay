import { Body, Controller, HttpCode, Post, Req, Res, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import type { AuthPrincipal } from "./auth.types";
import { CurrentUser } from "./current-user.decorator";
import { AuthTokensDto } from "./dto/auth-tokens.dto";
import { ChangePinDto } from "./dto/change-pin.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { LoginThrottlerGuard } from "./login-throttler.guard";
import { Public } from "./public.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(200)
  @UseGuards(LoginThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 900_000 } })
  @ApiOperation({
    operationId: "postAuthLogin",
    summary: "Sign in with phone and PIN",
    description:
      "Issues an access token and a refresh token. The refresh token is returned in the body and set as the httpOnly `refresh_token` cookie. First login with a temporary PIN sets `mustChangePin`.",
  })
  @ApiOkResponse({ type: AuthTokensDto, description: "Session issued." })
  @ApiUnauthorizedResponse({ description: "Invalid phone or PIN." })
  @ApiForbiddenResponse({ description: "Account is suspended." })
  @ApiTooManyRequestsResponse({ description: "Too many PIN attempts or login rate limit." })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.login(dto.phone, dto.pin);
    this.auth.attachRefreshCookie(res, tokens.refreshToken);
    return tokens;
  }

  @Public()
  @Post("refresh")
  @HttpCode(200)
  @ApiCookieAuth("refresh_token")
  @ApiOperation({
    operationId: "postAuthRefresh",
    summary: "Rotate the refresh token",
    description:
      "Accepts `refreshToken` in the JSON body or the `refresh_token` httpOnly cookie. Returns a new token pair and revokes the previous refresh token.",
  })
  @ApiBody({ type: RefreshDto, required: false })
  @ApiOkResponse({ type: AuthTokensDto, description: "New access and refresh tokens." })
  @ApiUnauthorizedResponse({ description: "Refresh token missing or invalid." })
  async refresh(
    @Body() dto: RefreshDto | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const presented = dto?.refreshToken ?? readCookie(req, "refresh_token");
    const tokens = await this.auth.refresh(presented);
    this.auth.attachRefreshCookie(res, tokens.refreshToken);
    return tokens;
  }

  @Post("logout")
  @HttpCode(204)
  @ApiBearerAuth("access-token")
  @ApiCookieAuth("refresh_token")
  @ApiOperation({
    operationId: "postAuthLogout",
    summary: "Revoke the current refresh token",
    description:
      "Requires a Bearer access token. Revokes the presented refresh token (body or cookie) and clears the cookie.",
  })
  @ApiBody({ type: RefreshDto, required: false })
  @ApiNoContentResponse({ description: "Refresh token revoked." })
  @ApiUnauthorizedResponse({ description: "Access token missing or invalid." })
  async logout(
    @Body() dto: RefreshDto | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const presented = dto?.refreshToken ?? readCookie(req, "refresh_token");
    await this.auth.logout(presented);
    this.auth.clearRefreshCookie(res);
  }

  @Post("pin")
  @HttpCode(204)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    operationId: "postAuthPin",
    summary: "Replace PIN",
    description:
      "Sets a new 4-digit PIN. `currentPin` is required unless `mustChangePin` is true (temporary PIN from invite).",
  })
  @ApiNoContentResponse({ description: "PIN updated." })
  @ApiUnauthorizedResponse({ description: "Access token or current PIN invalid." })
  async changePin(@CurrentUser() user: AuthPrincipal, @Body() dto: ChangePinDto) {
    await this.auth.changePin(user, dto);
  }
}

function readCookie(req: Request, name: string): string | undefined {
  const value = req.cookies?.[name];
  return typeof value === "string" ? value : undefined;
}
