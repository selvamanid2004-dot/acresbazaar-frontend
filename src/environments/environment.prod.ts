export const environment = {
  production: true,
  apiUrl: (typeof window !== 'undefined' && (window as any).__env?.API_URL) 
    ? (window as any).__env.API_URL 
    : 'http://localhost:5001/api'
};

export const API_BASE_URL = environment.apiUrl;
