import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loginRequest,
  type AuthUser,
  type LoginResponse,
} from "../services/authService";

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

const AUTH_STORAGE_KEY = "zentinel-web-auth";

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

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user: authState?.user ?? null,
      token: authState?.token ?? null,
      isAuthenticated: Boolean(authState?.token),
      login,
      logout,
    }),
    [authState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
};
