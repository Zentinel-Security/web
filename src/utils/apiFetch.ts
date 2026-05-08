/**
 * Un wrapper ligero sobre el fetch nativo para centralizar 
 * la lógica de autenticación y errores globales.
 */
export const UNAUTHORIZED_EVENT = "zentinel:unauthorized";

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);

  // Interceptamos errores de sesión expirada o insuficiente (401/403)
  if (response.status === 401 || response.status === 403) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  return response;
};