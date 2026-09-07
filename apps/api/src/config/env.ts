const ENVIRONMENTS = ["development", "production", "test"] as const;

export type AppEnv = {
  NODE_ENV: (typeof ENVIRONMENTS)[number];
  DATABASE_URL: string;
  REDIS_URL: string;
  API_PORT: number;
  API_CORS_ORIGIN: string;
  JWT_ACCESS_SECRET: string;
};

function requiredString(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${key} is required`);
  }
  return value;
}

export function validateEnv(config: Record<string, unknown>): AppEnv {
  const nodeEnv = config.NODE_ENV ?? "development";
  if (typeof nodeEnv !== "string" || !ENVIRONMENTS.includes(nodeEnv as AppEnv["NODE_ENV"])) {
    throw new Error("NODE_ENV must be development, production, or test");
  }

  const portRaw = config.API_PORT ?? "3001";
  const port = typeof portRaw === "number" ? portRaw : Number(portRaw);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("API_PORT must be a positive integer");
  }

  const jwtSecret = requiredString(config, "JWT_ACCESS_SECRET");
  if (jwtSecret.length < 32) {
    throw new Error("JWT_ACCESS_SECRET must be at least 32 characters");
  }

  return {
    NODE_ENV: nodeEnv as AppEnv["NODE_ENV"],
    DATABASE_URL: requiredString(config, "DATABASE_URL"),
    REDIS_URL: requiredString(config, "REDIS_URL"),
    API_PORT: port,
    API_CORS_ORIGIN: requiredString(config, "API_CORS_ORIGIN"),
    JWT_ACCESS_SECRET: jwtSecret,
  };
}
