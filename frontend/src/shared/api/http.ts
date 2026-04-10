const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const DEV_DEDUP_TTL_MS = 1200;
const inflightGetRequests = new Map<string, Promise<unknown>>();
const recentGetResponses = new Map<string, { timestamp: number; payload: unknown }>();

export class ApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(message: string, status: number, path: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
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
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new ApiError(body || `Request failed with status ${response.status}`, response.status, path);
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
