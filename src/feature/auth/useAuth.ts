import { useState, useEffect, useCallback } from "react";
import type { AxiosError } from "axios";
import { loginUser, registerUser, getMe, checkAvailability, type AuthUser, type LoginResponse, type RegisterResponse, type AvailabilityResponse } from "./api";

interface UseAuthResult {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
  loading: boolean;
  handleRegister: (user_name: string, email: string, password: string, License?: string) => Promise<RegisterResponse>;
  handleLogin: (user_name: string, password: string, rememberMe?: boolean) => Promise<LoginResponse>;
  handleLogout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
  checkUserAvailability: (user_name?: string, email?: string) => Promise<AvailabilityResponse>;
}

const TOKEN_STORAGE_KEY = "token";

// Helper to get token from either storage
const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
};

// Helper to clear token from both storages
const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
};

const extractErrorMessage = (err: unknown, fallback: string): string => {
  const axiosErr = err as AxiosError<Record<string, string[] | string>>;
  const data = axiosErr?.response?.data;
  if (!data) {
    return fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  const messages: string[] = [];
  for (const [field, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      messages.push(`${field}: ${value.join(", ")}`);
    } else if (typeof value === "string") {
      messages.push(`${field}: ${value}`);
    }
  }

  return messages.length ? messages.join(" • ") : fallback;
};

export const useAuth = (): UseAuthResult => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    const validateToken = async () => {
      try {
        // Add timeout to prevent infinite waiting
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Token validation timeout')), 10000); // 10 second timeout
        });
        
        const userData = await Promise.race([
          getMe(token) as Promise<AuthUser>, 
          timeoutPromise as Promise<never>
        ]);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        // Token invalid, clear it
        clearStoredToken();
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    validateToken();
  }, [token]);

  const checkUserAvailability = useCallback((user_name?: string, email?: string) => {
    return checkAvailability({ user_name, email });
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      return null;
    }

    try {
      const userData = await getMe(storedToken);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch {
      clearStoredToken();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  }, []);

  const handleRegister = async (user_name: string, email: string, password: string, License?: string): Promise<RegisterResponse> => {
    try {
      setError(null);
      const data = await registerUser(user_name, email, password, License);
      return data;
    } catch (err) {
      setError(extractErrorMessage(err, "Registration failed. Please try again."));
      throw err;
    }
  };

  const handleLogin = async (user_name: string, password: string, rememberMe = false): Promise<LoginResponse> => {
    try {
      setError(null);
      setLoading(true); // Prevent UI flicker during token validation
      const data = await loginUser(user_name, password);

      // Clear both storages first
      clearStoredToken();
      
      // Persist across tabs by always writing to localStorage.
      // If rememberMe is false we also mirror it into sessionStorage, but localStorage
      // ensures a new tab can still restore the session.
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access);
      if (!rememberMe) {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, data.access);
      }

      // Only set token - useEffect will validate and set user/auth state
      setToken(data.access);
      return data;
    } catch (err) {
      setError("Invalid username or password");
      setLoading(false); // Reset loading on error
      throw err;
    }
  };

  const handleLogout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    setLoading(false); // Ensure loading is false after logout
  };

  return {
    user,
    token,
    isAuthenticated,
    error,
    loading,
    handleRegister,
    handleLogin,
    handleLogout,
    refreshUser,
    checkUserAvailability,
  };
};
