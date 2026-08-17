import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../context/ToastContext";
import { AUTH_STORAGE_KEY } from "../utils/apiFetch";
import type { AuthUser } from "../services/authService";

export const makeUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: 1,
  nombre: "Ana",
  apellido: "Pérez",
  email: "ana@zentinel.test",
  estado_cuenta: "activa",
  id_rol: 1,
  ...overrides,
});

/** Deja una sesión válida en localStorage antes de montar AuthProvider. */
export const seedSession = (
  user: Partial<AuthUser> = {},
  token = "token-de-prueba",
  refreshToken: string | undefined = "refresh-de-prueba",
) => {
  const stored = { token, refreshToken, user: makeUser(user) };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(stored));
  return stored;
};

/** Respuesta mínima compatible con lo que consumen los services. */
export const jsonResponse = (
  body: unknown,
  { ok = true, status = ok ? 200 : 400 }: { ok?: boolean; status?: number } = {},
): Response =>
  ({
    ok,
    status,
    json: async () => body,
  }) as Response;

export const errorResponse = (body: unknown, status = 400): Response =>
  jsonResponse(body, { ok: false, status });

/** Response cuyo .json() rechaza (payload no-JSON del backend). */
export const brokenJsonResponse = (status = 500): Response =>
  ({
    ok: false,
    status,
    json: async () => {
      throw new Error("Unexpected token");
    },
  }) as unknown as Response;

export const mockFetch = (...responses: Response[]) => {
  const fn = vi.fn();
  responses.forEach((res) => fn.mockResolvedValueOnce(res));
  vi.stubGlobal("fetch", fn);
  return fn;
};

export const AllProviders = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <ToastProvider>
      <AuthProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
);

export const renderWithProviders = (ui: ReactElement) =>
  render(ui, { wrapper: AllProviders });
