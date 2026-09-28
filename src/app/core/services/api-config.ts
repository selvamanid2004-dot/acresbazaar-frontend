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
