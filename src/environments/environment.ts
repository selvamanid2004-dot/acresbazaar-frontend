export const environment = {
  production: false,
  apiUrl: typeof window !== 'undefined' && (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1'))
    ? 'https://acresbazaar-backend.onrender.com/api'
    : 'http://localhost:5001/api'
};
