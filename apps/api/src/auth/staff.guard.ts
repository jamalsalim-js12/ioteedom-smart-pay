import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { AuthPrincipal } from "./auth.types";

@Injectable()
export class StaffGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: AuthPrincipal }>();
    if (request.user?.kind !== "staff") {
      throw new ForbiddenException("Staff only");
    }
    return true;
  }
}
