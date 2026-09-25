export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    if ((window as any).__env?.API_URL) {
      return (window as any).__env.API_URL.replace(/\/$/, '');
    }
    // If not local host, use relative '/api' or window location
    if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      return '/api';
    }
  }
  return 'http://localhost:5001/api';
}

export const API_BASE = getApiBaseUrl();
