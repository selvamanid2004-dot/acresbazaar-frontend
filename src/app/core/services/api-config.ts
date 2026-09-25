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
