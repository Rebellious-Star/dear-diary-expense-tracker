import axios from 'axios';

const api = axios.create({
  baseURL: (process.env.REACT_APP_API_URL as string) || 'http://localhost:4000/api',
});

export const setAuthToken = (token?: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try { localStorage.setItem('apiToken', token); } catch {}
  } else {
    delete api.defaults.headers.common['Authorization'];
    try { localStorage.removeItem('apiToken'); } catch {}
  }
};

// Load persisted token on import
try {
  const t = localStorage.getItem('apiToken');
  if (t) setAuthToken(t);
} catch {}

export default api;




