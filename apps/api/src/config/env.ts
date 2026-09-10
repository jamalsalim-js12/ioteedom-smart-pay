const ENVIRONMENTS = ["development", "production", "test"] as const;

export type AppEnv = {
  NODE_ENV: (typeof ENVIRONMENTS)[number];
  DATABASE_URL: string;
  REDIS_URL: string;
  API_PORT: number;
  API_CORS_ORIGIN: string;
  JWT_ACCESS_SECRET: string;
  PAYMENTS_LIVE: boolean;
  PAYSTACK_SECRET_KEY: string | null;
  PAYSTACK_PUBLIC_KEY: string | null;
};

function requiredString(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${key} is required`);
  }
  return value;
}

function optionalString(config: Record<string, unknown>, key: string): string | null {
  const value = config[key];
  if (value == null || value === "") return null;
  if (typeof value !== "string") {
    throw new Error(`${key} must be a string`);
  }
  return value;
}

function booleanFlag(config: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const value = config[key];
  if (value == null || value === "") return fallback;
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  throw new Error(`${key} must be true or false`);
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

  const paymentsLive = booleanFlag(config, "PAYMENTS_LIVE", false);
  const paystackSecret = optionalString(config, "PAYSTACK_SECRET_KEY");
  if (paymentsLive && !paystackSecret) {
    throw new Error("PAYSTACK_SECRET_KEY is required when PAYMENTS_LIVE=true");
  }

  return {
    NODE_ENV: nodeEnv as AppEnv["NODE_ENV"],
    DATABASE_URL: requiredString(config, "DATABASE_URL"),
    REDIS_URL: requiredString(config, "REDIS_URL"),
    API_PORT: port,
    API_CORS_ORIGIN: requiredString(config, "API_CORS_ORIGIN"),
    JWT_ACCESS_SECRET: jwtSecret,
    PAYMENTS_LIVE: paymentsLive,
    PAYSTACK_SECRET_KEY: paystackSecret,
    PAYSTACK_PUBLIC_KEY: optionalString(config, "PAYSTACK_PUBLIC_KEY"),
  };
}
