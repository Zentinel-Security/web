import { API_BASE_URL } from "../config/apiBaseUrl";

export interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  avatar?: string;
  estado_cuenta?: "activa" | "suspendida";
  es_admin?: boolean;
  id_rol?: number;
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
  code?: string;
};

export const verificarEmailRequest = async (token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/verificar-email?token=${encodeURIComponent(token)}`);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error || 'Error al verificar el email.');
    (error as any).code = data?.code;
    throw error;
  }
};

export const reenviarVerificacionRequest = async (email: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/reenviar-verificacion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || 'Error al reenviar el correo.');
  }
};

export const olvideContrasenaRequest = async (email: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/olvide-contrasena`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || 'Error al enviar el correo.');
  }
};

export const resetearContrasenaRequest = async (token: string, nuevaContrasena: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/resetear-contrasena`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, nuevaContrasena }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error || 'Error al restablecer la contraseña.');
    (error as any).code = data?.code;
    throw error;
  }
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
    const err = new Error(message);
    (err as any).code = data?.code;
    throw err;
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
