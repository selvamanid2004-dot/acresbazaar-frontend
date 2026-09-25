export const environment = {
  production: true,
  apiUrl: typeof window !== 'undefined' && (window as any).__env?.API_URL
    ? (window as any).__env.API_URL
    : 'https://acresbazaar-backend.onrender.com/api'
};
