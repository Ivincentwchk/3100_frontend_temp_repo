import axios from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE_URL;

const TOKEN_STORAGE_KEY = "token";

const getStoredToken = (): string | null => {
  const localToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  const sessionToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  const token = localToken || sessionToken;
  console.log('getStoredToken - local:', !!localToken, 'session:', !!sessionToken, 'using:', token ? 'token found' : 'no token');
  return token;
};

const authClient = axios.create({
  baseURL: `${API_BASE_URL}/api/accounts`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
authClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Adding auth header to request:', config.url);
  } else {
    console.log('No token found for request:', config.url);
  }
  return config;
});

export interface AuthUser {
  userID: string;
  user_name: string;
  email: string;
  License?: string;
  profile: {
    score: number;
    rank: number;
    login_streak_days: number;
    last_login_date?: string;
  };
}

export interface RegisterResponse {
  user: AuthUser;
  refresh: string;
  access: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export const registerUser = async (user_name: string, email: string, password: string, License?: string): Promise<RegisterResponse> => {
  const response = await authClient.post<RegisterResponse>("/register/", {
    user_name,
    email,
    password,
    License,
  });
  return response.data;
};

export const loginUser = async (user_name: string, password: string): Promise<LoginResponse> => {
  const response = await authClient.post<LoginResponse>("/login/", {
    user_name,
    password,
  });
  return response.data;
};

export const getMe = async (token?: string): Promise<AuthUser> => {
  console.log('getMe called with token:', token ? 'provided' : 'none');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  console.log('getMe headers:', headers);
  const response = await authClient.get<AuthUser>("/me/", { headers });
  console.log('getMe response:', response.status, response.data);
  return response.data;
};

export interface AvailabilityResponse {
  user_name_available?: boolean;
  email_available?: boolean;
}

interface PasswordResetPayload {
  email: string;
  reset_base_url?: string;
}

export const requestPasswordReset = async (email: string, resetBaseUrl?: string) => {
  const payload: PasswordResetPayload = {
    email,
    reset_base_url: resetBaseUrl,
  };
  return authClient.post<{ detail: string }>("/password-reset/", payload);
};

export const confirmPasswordReset = async (token: string, email: string, newPassword: string) => {
  return authClient.post<{ detail: string }>("/password-reset/confirm/", {
    token,
    email,
    new_password: newPassword,
  });
};

export const checkAvailability = async (params: { user_name?: string; email?: string }): Promise<AvailabilityResponse> => {
  const response = await authClient.get<AvailabilityResponse>("/availability/", {
    params,
  });
  return response.data;
};
