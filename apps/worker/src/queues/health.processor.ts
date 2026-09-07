import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";

export const HEALTH_QUEUE = "health";

@Processor(HEALTH_QUEUE)
export class HealthProcessor extends WorkerHost {
  private readonly logger = new Logger(HealthProcessor.name);

  async process(job: Job): Promise<{ ok: true }> {
    this.logger.log(`processed ${job.name} (${job.id ?? "no-id"})`);
    return { ok: true };
  }
}
