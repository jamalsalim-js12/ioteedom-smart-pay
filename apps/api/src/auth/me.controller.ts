import { Controller, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { AuthPrincipal } from "./auth.types";
import { CurrentUser } from "./current-user.decorator";

@Controller("me")
export class MeController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  me(@CurrentUser() user: AuthPrincipal) {
    return this.auth.me(user);
  }
}
