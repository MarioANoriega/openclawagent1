import { tokenStorage } from "../lib/tokenStorage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { api } from "../api/client";
import type { AuthedUser } from "../types";

const TOKEN_KEY = "pet-plus-auth-token";

interface AuthContextValue {
  token: string | null;
  user: AuthedUser | null;
  isLoading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async (authToken: string) => {
    const me = await api.me(authToken);
    setUser(me);
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await tokenStorage.get(TOKEN_KEY);
      if (stored) {
        try {
          await loadUser(stored);
          setToken(stored);
        } catch {
          await tokenStorage.remove(TOKEN_KEY);
        }
      }
      setIsLoading(false);
    })();
  }, [loadUser]);

  const signup = useCallback(async (email: string, password: string) => {
    const result = await api.signup(email, password);
    await tokenStorage.set(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    await tokenStorage.set(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await tokenStorage.remove(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (token) {
      await loadUser(token);
    }
  }, [token, loadUser]);

  const value = useMemo(
    () => ({ token, user, isLoading, signup, login, logout, refreshUser }),
    [token, user, isLoading, signup, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
