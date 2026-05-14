import { API_BASE_URL } from "../config/apiBaseUrl";
import { apiFetch } from "../utils/apiFetch";
import type { AuthUser } from "./authService";

export interface UpdateProfilePayload {
  nombre: string;
  apellido: string;
  avatarFile?: File | null;
}

export const updateProfile = async (
  token: string,
  userId: number,
  payload: UpdateProfilePayload,
): Promise<void> => {
  const form = new FormData();
  form.append(
    "datos_usuario",
    JSON.stringify({ nombre: payload.nombre, apellido: payload.apellido }),
  );
  if (payload.avatarFile) {
    form.append("avatar", payload.avatarFile);
  }

  const response = await apiFetch(`${API_BASE_URL}/usuarios/${userId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.error ?? "No se pudo actualizar el perfil.");
};

export const fetchSelfUser = async (
  token: string,
  userId: number,
): Promise<AuthUser> => {
  const response = await apiFetch(`${API_BASE_URL}/usuarios/getUsuario?id=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.error ?? "No se pudo obtener el usuario.");
  return json as AuthUser;
};
