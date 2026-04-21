import { useAuthStore } from '@/stores/useAuthStore';

const API_PREFIX = '/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

export class ApiError extends Error {
  details?: string;

  constructor(message: string, details?: string) {
    super(message);
    this.details = details;
  }
}

let refreshPromise: Promise<void> | null = null;

const REFRESH_MARGIN_MS = 30_000;

async function ensureValidAccessToken() {
  const state = useAuthStore.getState();
  if (!state.token || !state.accessTokenExpiresAt) return;
  const shouldRefresh = Date.now() + REFRESH_MARGIN_MS >= state.accessTokenExpiresAt;
  if (!shouldRefresh) return;
  await refreshTokens();
}

export async function refreshTokens() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    let response: Response;
    try {
      response = await fetch(`${API_PREFIX}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      throw new ApiError('Impossible de rafraîchir la session');
    }

    const payload = await response.json().catch(() => null);
    const isUnauthorized = response.status === 401;
    if (!response.ok || payload?.success === false) {
      if (isUnauthorized) {
        useAuthStore.getState().setToken(null);
        useAuthStore.getState().setUser(null);
      }
      throw new ApiError(payload?.message ?? 'Session expirée');
    }

    const data = payload?.data;
    if (!data?.accessToken) {
      throw new ApiError('Impossible de rafraîchir la session');
    }

    useAuthStore.getState().setToken(data.accessToken);
  })();

  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function buildQuery(params?: RequestOptions['params']) {
  if (!params) return '';
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');
  return query ? `?${query}` : '';
}

function getStoredToken() {
  return useAuthStore.getState().token;
}

function buildUrl(path: string) {
  return `${API_PREFIX}${path}`;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${buildUrl(path)}${buildQuery(options.params)}`;
  const headers: Record<string, string> = options.body && !(options.body instanceof FormData)
    ? { 'Content-Type': 'application/json' }
    : {};

  if (!options.skipAuth) {
    await ensureValidAccessToken();
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body:
      options.body && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : (options.body as BodyInit | undefined),
    credentials: 'include',
  });

  const payload = await response.json().catch(() => null);

  if (response.status === 401 && !options.skipAuth && !options.skipRefresh) {
    await refreshTokens();
    return request(path, { ...options, skipRefresh: true });
  }

  if (!response.ok || (payload && payload.success === false)) {
    const message = payload?.message || 'Une erreur est survenue';
    const details = payload?.error?.details;
    throw new ApiError(message, details);
  }

  return payload?.data ?? payload;
}
