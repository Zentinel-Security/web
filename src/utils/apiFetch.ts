/**
 * Un wrapper ligero sobre el fetch nativo para centralizar 
 * la lógica de autenticación y errores globales.
 */
import { API_BASE_URL } from "../config/apiBaseUrl";

export const UNAUTHORIZED_EVENT = "zentinel:unauthorized";
export const TOKEN_REFRESHED_EVENT = "zentinel:token-refreshed";
export const AUTH_STORAGE_KEY = "zentinel-web-auth";

let isRefreshing = false;

const readRefreshToken = (): string | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    return (JSON.parse(stored) as { refreshToken?: string }).refreshToken ?? null;
  } catch {
    return null;
  }
};

const updateStoredAccessToken = (newToken: string): void => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...parsed, token: newToken }));
  } catch {
    // ignore
  }
};

const attemptTokenRefresh = async (refreshToken: string): Promise<string | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
};

export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const response = await fetch(url, options);

  // 401 = sesión expirada → intentar renovar el token silenciosamente
  if (response.status === 401 && !isRefreshing) {
    const refreshToken = readRefreshToken();
    if (refreshToken) {
      isRefreshing = true;
      const newToken = await attemptTokenRefresh(refreshToken);
      isRefreshing = false;

      if (newToken) {
        updateStoredAccessToken(newToken);
        window.dispatchEvent(new CustomEvent(TOKEN_REFRESHED_EVENT, { detail: { token: newToken } }));
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      }
    }
    // Refresh falló o no hay refresh token → cerrar sesión
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  // 403 = sin permisos suficientes → NO cerrar sesión, devolver respuesta normalmente
  return response;
};