import { getJwtToken } from "@/lib/auth-token";

/**
 * Authenticated fetch wrapper for the MentorLagbe Express API.
 *
 * - Base URL comes only from `NEXT_PUBLIC_API_URL` (no localhost fallback).
 * - The Better Auth JWT is sent as a Bearer token and is never persisted in
 *   localStorage/sessionStorage.
 * - Requests use `credentials: "omit"`; the backend does not use cookies.
 * - A 401 triggers exactly one fresh-token retry; other errors never retry.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

export type ApiQueryValue = string | number | boolean | null | undefined;

export type ApiQuery = Record<
  string,
  ApiQueryValue | ApiQueryValue[]
>;

export type ApiFetchOptions = {
  method?: HttpMethod;
  query?: ApiQuery;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  /**
   * Attach the Better Auth JWT. Defaults to true; set false for public
   * endpoints such as the tuition catalogue.
   */
  auth?: boolean;
};

/**
 * Normalized error returned by the API layer. `status` mirrors the backend
 * HTTP status (or 0 for configuration/network failures).
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Thrown when the API client is misconfigured (for example a missing
 * `NEXT_PUBLIC_API_URL`). Always has `status: 0`.
 */
export class ApiConfigurationError extends ApiError {
  constructor(message: string) {
    super(0, message);
    this.name = "ApiConfigurationError";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;

  if (typeof configured !== "string" || configured.trim() === "") {
    throw new ApiConfigurationError(
      "Backend API URL is not configured. Set NEXT_PUBLIC_API_URL in your environment (for example http://localhost:8000).",
    );
  }

  const baseUrl = configured.trim().replace(/\/+$/, "");

  let parsed: URL;

  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new ApiConfigurationError(
      "NEXT_PUBLIC_API_URL must be a valid absolute URL.",
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new ApiConfigurationError(
      "NEXT_PUBLIC_API_URL must use the http or https protocol.",
    );
  }

  return baseUrl;
}

function buildUrl(baseUrl: string, path: string, query?: ApiQuery): string {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) {
    throw new ApiError(
      0,
      "apiFetch only accepts paths relative to the configured API.",
    );
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  let url: URL;

  try {
    url = new URL(`${baseUrl}${normalizedPath}`);
  } catch {
    throw new ApiError(0, "The API request path is invalid.");
  }

  for (const [key, value] of Object.entries(query ?? {})) {
    const values = Array.isArray(value) ? value : [value];

    for (const item of values) {
      if (item === undefined || item === null) {
        continue;
      }

      url.searchParams.append(key, String(item));
    }
  }

  return url.toString();
}

async function requestToken(): Promise<string> {
  const { token, error } = await getJwtToken();

  if (!token) {
    throw new ApiError(
      401,
      error ?? "Your session has expired. Please sign in again.",
    );
  }

  return token;
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

async function sendRequest(
  url: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    throw new ApiError(
      0,
      "Unable to reach the server. Check your connection and try again.",
    );
  }
}

type ParsedBody =
  | { ok: true; value: unknown }
  | { ok: false };

async function readJson(response: Response): Promise<ParsedBody> {
  const text = await response.text();

  if (text.trim() === "") {
    return { ok: true, value: null };
  }

  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

function readSafeMessage(payload: unknown): string | null {
  if (
    payload !== null &&
    typeof payload === "object" &&
    "message" in payload
  ) {
    const message = (payload as { message?: unknown }).message;

    if (typeof message === "string" && message.trim() !== "") {
      return message.trim();
    }
  }

  return null;
}

function buildApiError(status: number, parsed: ParsedBody): ApiError {
  // Never surface proxy/framework internals for server-side failures.
  if (status >= 500) {
    return new ApiError(
      status,
      "The server could not complete the request. Please try again.",
    );
  }

  const message = parsed.ok ? readSafeMessage(parsed.value) : null;

  return new ApiError(
    status,
    message ?? `Request failed with status ${status}.`,
  );
}

/**
 * Performs a JSON request against the configured backend.
 *
 * Returns the parsed JSON body of the response. Errors are normalized to
 * `ApiError` instances with the original HTTP status.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const {
    method = "GET",
    query,
    body,
    headers,
    signal,
    auth = true,
  } = options;

  const url = buildUrl(getApiBaseUrl(), path, query);
  const requiresAuth = auth !== false;

  const baseHeaders = new Headers(headers);

  if (!baseHeaders.has("Accept")) {
    baseHeaders.set("Accept", "application/json");
  }

  let serializedBody: string | undefined;

  if (body !== undefined) {
    if (!baseHeaders.has("Content-Type")) {
      baseHeaders.set("Content-Type", "application/json");
    }

    serializedBody = JSON.stringify(body);
  }

  const send = (token: string | null) => {
    const requestHeaders = new Headers(baseHeaders);

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    return sendRequest(url, {
      method,
      headers: requestHeaders,
      body: serializedBody,
      cache: requiresAuth ? "no-store" : undefined,
      credentials: "omit",
      signal,
    });
  };

  let token: string | null = null;

  if (requiresAuth) {
    token = await requestToken();
  }

  let response = await send(token);

  // Retry exactly once with a freshly issued JWT. Any other failure is
  // returned to the caller without retrying.
  if (response.status === 401 && requiresAuth) {
    token = await requestToken();
    response = await send(token);
  }

  const parsed = await readJson(response);

  if (!response.ok) {
    throw buildApiError(response.status, parsed);
  }

  if (!parsed.ok) {
    throw new ApiError(
      502,
      "The server returned an unexpected response.",
    );
  }

  return parsed.value as T;
}
