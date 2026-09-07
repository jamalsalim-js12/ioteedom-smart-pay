import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import type { HealthResponseDto } from "@ioteedom/shared";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<HealthResponseDto> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true, service: "api", postgres: "up" };
    } catch {
      throw new ServiceUnavailableException({
        ok: false,
        service: "api",
        postgres: "down",
      });
    }
  }
}
