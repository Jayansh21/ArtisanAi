// frontend/src/services/api.ts
import axios, { AxiosRequestConfig } from "axios";

// ✅ Use environment variable first, then fallback to local development
function resolveApiBaseUrl(): string {
  // Use environment variable if set (for production)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback for local development
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin; // e.g. http://localhost:3000
    try {
      const url = new URL(origin);
      const port = url.port || (url.protocol === 'https:' ? '443' : '80');
      // If running CRA on 3000, assume backend on 3001
      const backendPort = port === '3000' ? '3001' : port;
      return `${url.protocol}//${url.hostname}:${backendPort}/api`;
    } catch (_) {
      // Fallback to default
    }
  }

  return "http://localhost:3001/api";
}

const API_BASE_URL: string = resolveApiBaseUrl();

// ✅ Explicit AxiosRequestConfig fixes TS errors
const config: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};

export const api = axios.create(config);

// ✅ Request interceptor
api.interceptors.request.use((config) => {
  const method = String(config.method || "unknown").toUpperCase();
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${method} ${config.baseURL}${config.url}`);
  }
  return config;
});

// ✅ Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error logging
    if (error.response) {
      // Server responded with error status
      console.error("API Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network Error:", {
        message: "No response from server",
        url: error.config?.url,
        timeout: error.code === 'ECONNABORTED'
      });
    } else {
      // Something else happened
      console.error("Request Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
