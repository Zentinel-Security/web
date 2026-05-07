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
import { UNAUTHORIZED_EVENT } from '../utils/apiFetch';

interface AuthState {
  token: string;
  refreshToken?: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AUTH_STORAGE_KEY = "zentinel-web-auth";

let isAlerting = false; // Flag para deduplicar alertas

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

  // 2. NUEVO: El "oído" que escucha a apiFetch
  useEffect(() => {
    const handleUnauthorized = () => {
      if (isAlerting) return;
      isAlerting = true;

      console.warn("Sesión expirada o inválida. Cerrando sesión por seguridad.");
      // 1. Cerramos la sesión en el estado
      logout();

      // 2. Feedback visual inmediato para el usuario
      alert("Tu sesión ha expirado por inactividad o seguridad. Por favor, vuelve a iniciar sesión.");

      // 3. Lo expulsamos a la pantalla de inicio (útil si estaba metido en /gestion)
      window.location.hash = "/";

      // 4. Liberamos el flag
      setTimeout(() => { isAlerting = false; }, 2000);
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: authState?.user ?? null,
      token: authState?.token ?? null,
      isAuthenticated: Boolean(authState?.token),
      login,
      logout,
    }),
    [authState, logout],
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
