import axios from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE_URL;

const TOKEN_STORAGE_KEY = "token";

const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
};

const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
};

const isPublicAuthPath = (url?: string) => {
  if (!url) return false;
  return (
    url.includes("/login/") ||
    url.includes("/register/") ||
    url.includes("/password-reset/") ||
    url.includes("/availability/")
  );
};

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/accounts`,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (isPublicAuthPath(config.url)) {
    if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearStoredToken();
    }
    return Promise.reject(error);
  }
);
