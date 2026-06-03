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

export const suspenderUsuario = async (token: string, idUsuario: number, motivo: string): Promise<void> => {
  const response = await apiFetch(`${API_BASE_URL}/usuarios/${idUsuario}/suspender`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ motivo }),
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.error ?? "Error al suspender usuario");
};

export const reactivarUsuario = async (token: string, idUsuario: number, motivo: string): Promise<void> => {
  const response = await apiFetch(`${API_BASE_URL}/usuarios/${idUsuario}/reactivar`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ motivo }),
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.error ?? "Error al reactivar usuario");
};

export interface AuditLogEntry {
  id: number;
  tipo_evento: string;
  motivo: string | null;
  datos_anteriores: Record<string, unknown> | null;
  datos_nuevos: Record<string, unknown> | null;
  created_at: string;
  actor_id: number;
  actor_nombre: string;
  actor_email: string;
  objetivo_usuario_id: number | null;
  objetivo_usuario_nombre: string | null;
  objetivo_usuario_email: string | null;
  objetivo_plan_id: number | null;
  objetivo_plan_nombre: string | null;
  objetivo_ticket_id: number | null;
  objetivo_ticket_asunto: string | null;
}

export interface AuditLogResult {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getAuditLog = async (
  token: string,
  params?: {
    tipo_evento?: string;
    id_actor?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
    page?: number;
    limit?: number;
  },
): Promise<AuditLogResult> => {
  const query = new URLSearchParams();
  if (params?.tipo_evento) query.set("tipo_evento", params.tipo_evento);
  if (params?.id_actor)    query.set("id_actor",    String(params.id_actor));
  if (params?.fecha_desde) query.set("fecha_desde", params.fecha_desde);
  if (params?.fecha_hasta) query.set("fecha_hasta", params.fecha_hasta);
  if (params?.page)        query.set("page",        String(params.page));
  if (params?.limit)       query.set("limit",       String(params.limit));

  const url = `${API_BASE_URL}/admin/auditoria${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await apiFetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.message ?? "Error al obtener el log de auditoría");
  return json as AuditLogResult;
};

export const cambiarRolUsuario = async (token: string, idUsuario: number, idRol: number): Promise<UsuarioAdmin> => {
  const response = await apiFetch(`${API_BASE_URL}/usuarios/${idUsuario}/cambiar-rol`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id_rol: idRol }),
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.error ?? "Error al cambiar el rol");
  return json.usuario as UsuarioAdmin;
};
