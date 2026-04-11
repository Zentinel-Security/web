import { API_BASE_URL } from "../config/apiBaseUrl";

export interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  avatar?: string;
  estado_cuenta?: "activa" | "suspendida";
  es_admin?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  usuario: AuthUser;
}

interface LoginPayload {
  email: string;
  password: string;
}

type RawLoginResponse = {
  token?: string;
  access_token?: string;
  refresh_token?: string;
  usuario?: AuthUser;
  message?: string;
  error?: string;
};

export const loginRequest = async ({ email, password }: LoginPayload): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      contraseña: password,
      source: "web",
    }),
  });

  const data = (await response.json().catch(() => null)) as RawLoginResponse | null;

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      "No se pudo iniciar sesión. Revisa tus credenciales.";
    throw new Error(message);
  }

  const token = data?.access_token ?? data?.token;

  if (!token || !data?.usuario) {
    throw new Error("Respuesta de login inválida.");
  }

  return {
    token,
    refreshToken: data.refresh_token,
    usuario: data.usuario,
  };
};
