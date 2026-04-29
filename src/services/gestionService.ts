import { API_BASE_URL } from "../config/apiBaseUrl";
import { apiFetch } from "../utils/apiFetch";

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  avatar: string | null;
  activo: boolean;
  estado_cuenta: string;
  id_rol: number;
  rol_descripcion: string | null;
}

export interface ReporteDispositivoAdmin {
  id: number;
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  tipo_reporte: "Perdido" | "Robado";
  descripcion: string | null;
  estado_reporte: "creado" | "finalizado";
  incluye_ubicacion: boolean;
  fecha_creacion: string;
}

export const getUsuariosAdmin = async (token: string): Promise<UsuarioAdmin[]> => {
  const response = await apiFetch(`${API_BASE_URL}/usuarios/admin/todos`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.error ?? "No se pudieron obtener los usuarios.");
  return (json as { usuarios: UsuarioAdmin[] }).usuarios;
};

export const getReportesAdmin = async (
  token: string,
): Promise<ReporteDispositivoAdmin[]> => {
  const response = await apiFetch(`${API_BASE_URL}/reportes-dispositivo/admin/todos`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.message ?? "No se pudieron obtener los reportes.");
  return (json as { reportes: ReporteDispositivoAdmin[] }).reportes;
};
