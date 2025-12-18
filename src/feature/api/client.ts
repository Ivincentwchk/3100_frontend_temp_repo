import axios from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE_URL;

const TOKEN_STORAGE_KEY = "token";

const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
};

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/accounts`,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
