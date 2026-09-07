const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "";

export type ErrorType<TError = unknown> = ApiError<TError>;
export type BodyType<TBody = unknown> = TBody;

export class ApiError<T = unknown> extends Error {
  readonly status: number;
  readonly body: T;

  constructor(message: string, status: number, body: T) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const ACCESS_KEY = "access_token";

function isAuthHandshake(url: string) {
  return url.includes("/v1/auth/login") || url.includes("/v1/auth/refresh");
}

export function readAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ACCESS_KEY);
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) sessionStorage.setItem(ACCESS_KEY, token);
  else sessionStorage.removeItem(ACCESS_KEY);
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const response = await fetch(`${apiOrigin}/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (!response.ok) {
      setAccessToken(null);
      return null;
    }
    const payload = (await response.json()) as { accessToken?: unknown };
    if (typeof payload.accessToken !== "string") {
      setAccessToken(null);
      return null;
    }
    setAccessToken(payload.accessToken);
    return payload.accessToken;
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function parseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  const isJson = response.headers.get("content-type")?.includes("application/json");
  return (isJson ? await response.json() : await response.text()) as T;
}

function errorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload && "message" in payload) {
    const message = (payload as { message: unknown }).message;
    if (Array.isArray(message)) return message.map(String).join(", ");
    if (message != null) return String(message);
  }
  return fallback;
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  const skipRefresh = isAuthHandshake(url);
  if (!skipRefresh) {
    const token = readAccessToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const send = () =>
    fetch(`${apiOrigin}${url}`, {
      ...options,
      headers,
      credentials: "include",
    });

  let response = await send();

  if (response.status === 401 && !skipRefresh) {
    const next = await refreshAccessToken();
    if (next) {
      headers.set("Authorization", `Bearer ${next}`);
      response = await send();
    }
  }

  const payload = await parseBody<T>(response);

  if (!response.ok) {
    throw new ApiError(errorMessage(payload, response.statusText), response.status, payload);
  }

  return payload;
}
