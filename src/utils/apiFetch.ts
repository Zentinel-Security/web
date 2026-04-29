/**
 * Un wrapper ligero sobre el fetch nativo para centralizar 
 * la lógica de autenticación y errores globales.
 */
export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);

  // NUEVO: Imprimimos en consola qué código nos está devolviendo el backend
  console.log(`[apiFetch] Llamada a ${url} - Status:`, response.status);

  // Interceptamos errores de sesión expirada o insuficiente (401/403)
  if (response.status === 401 || response.status === 403) {
    console.log("[apiFetch] ¡Error 401/403 detectado! Disparando evento...");
    window.dispatchEvent(new Event("zentinel:unauthorized"));
  }

  return response;
};