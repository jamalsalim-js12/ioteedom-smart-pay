const ENVIRONMENTS = ["development", "production", "test"] as const;

export type WorkerEnv = {
  NODE_ENV: (typeof ENVIRONMENTS)[number];
  REDIS_URL: string;
};

function requiredString(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${key} is required`);
  }
  return value;
}

export function validateEnv(config: Record<string, unknown>): WorkerEnv {
  const nodeEnv = config.NODE_ENV ?? "development";
  if (typeof nodeEnv !== "string" || !ENVIRONMENTS.includes(nodeEnv as WorkerEnv["NODE_ENV"])) {
    throw new Error("NODE_ENV must be development, production, or test");
  }

  return {
    NODE_ENV: nodeEnv as WorkerEnv["NODE_ENV"],
    REDIS_URL: requiredString(config, "REDIS_URL"),
  };
}
