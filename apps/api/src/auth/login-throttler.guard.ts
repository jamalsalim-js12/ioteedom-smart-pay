import { normalizeGhPhone } from "@ioteedom/shared";
import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const body = req.body as { phone?: unknown };
    const raw = typeof body.phone === "string" ? body.phone : "";
    const phone = normalizeGhPhone(raw);
    return phone ?? req.ip ?? "unknown";
  }
}
