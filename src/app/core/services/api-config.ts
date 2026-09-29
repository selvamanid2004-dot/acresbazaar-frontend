export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const customUrl = (window as any).__env?.API_URL;
    if (customUrl && customUrl !== '/api') {
      return customUrl.replace(/\/$/, '');
    }
    const hostname = window.location.hostname;
    // When running on cloud (Render / custom domain), use deployed backend
    if (hostname.includes('onrender.com') || hostname.includes('acresbazaar') || (!hostname.includes('localhost') && !hostname.includes('127.0.0.1'))) {
      return 'https://acresbazaar-backend.onrender.com/api';
    }
  }
  return 'http://localhost:5001/api';
}

export const API_BASE = getApiBaseUrl();

/**
 * Normalizes and resolves image & logo URLs so localhost paths automatically
 * point to the active backend (local or deployed Render cloud backend).
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return '';
  }
  const trimmed = url.trim();
  const backendBase = getApiBaseUrl().replace(/\/api$/, '');

  // If relative uploads path
  if (trimmed.startsWith('/uploads/')) {
    return `${backendBase}${trimmed}`;
  }

  // If hardcoded localhost URL but running against remote/different origin
  if (trimmed.includes('localhost:5001/uploads/')) {
    const uploadPath = trimmed.substring(trimmed.indexOf('/uploads/'));
    return `${backendBase}${uploadPath}`;
  }

  return trimmed;
}

const apiCache = new Map<string, { data: any; expires: number }>();

/**
 * Fast fetch wrapper with automatic timeout to prevent UI freezing
 */
export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Cached JSON fetch for website settings, categories, and plans
 */
export async function fetchJsonCached<T = any>(url: string, ttlMs = 30000): Promise<T | null> {
  const cached = apiCache.get(url);
  const now = Date.now();
  if (cached && cached.expires > now) {
    return cached.data as T;
  }
  try {
    const res = await fetchWithTimeout(url, {}, 3000);
    if (res.ok) {
      const data = await res.json();
      apiCache.set(url, { data, expires: now + ttlMs });
      return data as T;
    }
  } catch {
    // return cached even if stale if network failed
    if (cached) return cached.data as T;
  }
  return null;
}
