import { getAuthToken } from '@/shared/lib/auth';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const DEV_DEDUP_TTL_MS = 1200;
const inflightGetRequests = new Map<string, Promise<unknown>>();
const recentGetResponses = new Map<string, { timestamp: number; payload: unknown }>();

export class ApiError extends Error {
  readonly status: number;
  readonly path: string;
  readonly details?: string[];

  constructor(message: string, status: number, path: string, details?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
    this.details = details;
  }
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const method = init?.method?.toUpperCase() ?? 'GET';
  const isGet = method === 'GET';
  const requestKey = `${method}:${url}`;

  if (isGet) {
    const cachedResponse = recentGetResponses.get(requestKey);
    if (cachedResponse && Date.now() - cachedResponse.timestamp <= DEV_DEDUP_TTL_MS) {
      return cachedResponse.payload as T;
    }

    const inflight = inflightGetRequests.get(requestKey);
    if (inflight) {
      return (await inflight) as T;
    }
  }

  const request = (async () => {
    const token = getAuthToken();
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
      ...init,
    });

    if (!response.ok) {
      const rawBody = await response.text();
      let parsedMessage: string | undefined;
      let parsedDetails: string[] | undefined;
      try {
        const parsed = JSON.parse(rawBody) as { message?: string; details?: string[] };
        parsedMessage = parsed.message;
        parsedDetails = parsed.details;
      } catch {
        // Fall back to plaintext body below.
      }
      throw new ApiError(parsedMessage || rawBody || `Request failed with status ${response.status}`, response.status, path, parsedDetails);
    }

    const payload = (await response.json()) as T;
    if (isGet) {
      recentGetResponses.set(requestKey, { timestamp: Date.now(), payload });
    }
    return payload;
  })();

  if (isGet) {
    inflightGetRequests.set(requestKey, request);
  }

  try {
    return await request;
  } finally {
    if (isGet) {
      inflightGetRequests.delete(requestKey);
    }
  }
}
