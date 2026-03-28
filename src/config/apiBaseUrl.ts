const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_API_URL;

if (!apiBaseUrl) {
  throw new Error("Falta configurar VITE_BACKEND_URL o VITE_API_URL en el archivo .env");
}

export const API_BASE_URL = apiBaseUrl.replace(/\/+$/, "");
