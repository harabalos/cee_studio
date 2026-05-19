/**
 * HTTP helpers for integration tests.
 *
 * All API calls go through `request()` which has a default base URL,
 * auto-decodes JSON, and surfaces non-2xx responses with a readable error.
 */

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3001";

export type ApiResponse<T = unknown> = {
  status: number;
  ok: boolean;
  body: T;
};

export async function request<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string>),
    },
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // not JSON — leave as string
  }
  return { status: res.status, ok: res.ok, body: body as T };
}

export async function getJSON<T = unknown>(path: string): Promise<ApiResponse<T>> {
  return request<T>(path);
}

export async function postJSON<T = unknown>(
  path: string,
  body: unknown,
  init: RequestInit = {}
): Promise<ApiResponse<T>> {
  return request<T>(path, {
    ...init,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function patchJSON<T = unknown>(
  path: string,
  body: unknown,
  init: RequestInit = {}
): Promise<ApiResponse<T>> {
  return request<T>(path, {
    ...init,
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
