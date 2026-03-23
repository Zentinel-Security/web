export interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  avatar?: string;
}

export interface LoginResponse {
  token: string;
  usuario: AuthUser;
}

interface LoginPayload {
  email: string;
  password: string;
}

type WebEnv = ImportMeta & {
  env?: {
    VITE_BACKEND_URL?: string;
    VITE_API_URL?: string;
  };
};

const webEnv = (import.meta as WebEnv).env;

const API_BASE_URL =
  webEnv?.VITE_BACKEND_URL ??
  webEnv?.VITE_API_URL ??
  "http://localhost:3008";

export const loginRequest = async ({ email, password }: LoginPayload): Promise<LoginResponse> => {
  console.log("[AuthService] Attempting login to:", `${API_BASE_URL}/usuarios/login`);
  console.log("[AuthService] Payload:", { email, contraseña: password });

  const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      contraseña: password,
    }),
  });
  console.log("[AuthService] Response status:", response.status, response.statusText);

  const data = await response.json().catch(() => null);
  console.log("[AuthService] Response data:", data);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      "No se pudo iniciar sesión. Revisa tus credenciales.";
    console.error("[AuthService] Login error:", message);
    throw new Error(message);
  }

  if (!data?.token || !data?.usuario) {
    throw new Error("Respuesta de login inválida.");
  }

  return data as LoginResponse;
};
