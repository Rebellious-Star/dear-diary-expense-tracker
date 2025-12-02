import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dear-diary-expense-tracker.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('apiToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('https://dear-diary-expense-tracker.onrender.com/api/auth/refresh-token', {
            refreshToken
          });
          
          const { token, refreshToken: newRefreshToken } = response.data;
          
          // Update the tokens
          localStorage.setItem('apiToken', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // If refresh fails, clear the tokens and redirect to login
        localStorage.removeItem('apiToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const setAuthToken = (token?: string, refreshToken?: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try { 
      localStorage.setItem('apiToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    } catch (e) {
      console.error('Failed to save tokens to localStorage:', e);
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
    try { 
      localStorage.removeItem('apiToken');
      localStorage.removeItem('refreshToken');
    } catch (e) {
      console.error('Failed to remove tokens from localStorage:', e);
    }
  }
};

// Load persisted token on import
try {
  const token = localStorage.getItem('apiToken');
  if (token) {
    setAuthToken(token);
  }
} catch (error) {
  console.error('Failed to load token from localStorage:', error);
}

export default api;




