/**
 * Minimal fetch wrapper used by every function in `src/lib/api`.
 *
 * Swap `USE_MOCKS` to `false` (or delete the flag entirely) once the real
 * backend is live — every function in this folder already calls through
 * `apiGet`, so there is a single switch-over point.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

/** Flip to false once NEXT_PUBLIC_API_BASE_URL points at a real backend. */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface ApiGetOptions {
  /** Revalidation window in seconds, passed through to Next's fetch cache. */
  revalidate?: number;
  signal?: AbortSignal;
}

export async function apiGet<T>(path: string, options: ApiGetOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    next: { revalidate: options.revalidate ?? 60 },
    signal: options.signal,
  });

  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed with status ${response.status}`, response.status);
  }

  return (await response.json()) as T;
}

export async function apiPost<T, B = unknown>(path: string, body: B): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed with status ${response.status}`, response.status);
  }

  return (await response.json()) as T;
}
