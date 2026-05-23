import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  loginRequest,
  type AuthUser,
  type LoginResponse,
} from "../services/authService";
import { UNAUTHORIZED_EVENT, TOKEN_REFRESHED_EVENT, AUTH_STORAGE_KEY } from '../utils/apiFetch';

interface AuthState {
  token: string;
  refreshToken?: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  isSupport: boolean;
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  clearSessionExpired: () => void;
}

const getInitialAuthState = (): AuthState | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<AuthState>;
    if (!parsed?.token || !parsed?.user) return null;
    return {
      token: parsed.token,
      refreshToken: parsed.refreshToken,
      user: parsed.user,
    } as AuthState;
  } catch {
    return null;
  }
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState | null>(getInitialAuthState);
  const [sessionExpired, setSessionExpired] = useState(false);

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setAuthState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, user: { ...prev.user, ...partial } };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const login = async (email: string, password: string) => {
    const { token, refreshToken, usuario }: LoginResponse = await loginRequest({ email, password });
    const nextState: AuthState = {
      token,
      refreshToken,
      user: usuario,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextState));
    setAuthState(nextState);
  };

  // 1. Envolvemos logout en useCallback para estabilizar la función
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState(null);
  }, []);

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  // 2. Listeners: eventos de apiFetch + sincronización multi-pestaña vía localStorage
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      setSessionExpired(true);
    };

    const handleTokenRefreshed = (e: Event) => {
      const { token } = (e as CustomEvent<{ token: string }>).detail;
      setAuthState((prev) => (prev ? { ...prev, token } : prev));
    };

    // Si otra pestaña elimina la clave de auth (logout manual), sincronizamos silenciosamente
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY && e.newValue === null) {
        setAuthState(null);
        setSessionExpired(false);
      }
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    window.addEventListener(TOKEN_REFRESHED_EVENT, handleTokenRefreshed);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
      window.removeEventListener(TOKEN_REFRESHED_EVENT, handleTokenRefreshed);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: authState?.user ?? null,
      token: authState?.token ?? null,
      isAuthenticated: Boolean(authState?.token),
      isStaff: [2, 4, 5].includes(authState?.user?.id_rol ?? 0),
      isSupport: [2, 5].includes(authState?.user?.id_rol ?? 0),
      sessionExpired,
      login,
      logout,
      updateUser,
      clearSessionExpired,
    }),
    [authState, logout, updateUser, sessionExpired, clearSessionExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
};
