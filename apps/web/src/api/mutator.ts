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

function readAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token");
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) sessionStorage.setItem("access_token", token);
  else sessionStorage.removeItem("access_token");
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  const token = readAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiOrigin}${url}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = (isJson ? await response.json() : await response.text()) as T;

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String((payload as { message: unknown }).message)
        : response.statusText;
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}
