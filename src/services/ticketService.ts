import { API_BASE_URL } from "../config/apiBaseUrl";

export type TicketTipo =
  | "consulta"
  | "reclamo"
  | "soporte_tecnico"
  | "facturacion"
  | "reporte";

export type TicketEstado = "abierto" | "en_progreso" | "resuelto" | "cerrado";

export interface Ticket {
  id: number;
  id_usuario: number;
  tipo: TicketTipo;
  asunto: string;
  descripcion: string;
  estado: TicketEstado;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_resolucion: string | null;
}

export interface TicketConUsuario extends Ticket {
  nombre: string;
  apellido: string;
  email: string;
}

export interface RespuestaTicket {
  id: number;
  id_ticket: number;
  id_usuario: number;
  es_admin: boolean;
  mensaje: string;
  fecha_creacion: string;
  nombre: string;
  apellido: string;
  avatar: string | null;
}

export interface TicketDetalle {
  ticket: Ticket;
  respuestas: RespuestaTicket[];
}

export interface TicketDetalleAdmin {
  ticket: TicketConUsuario;
  respuestas: RespuestaTicket[];
}

// ─── Usuario ────────────────────────────────────────────────

export const createTicket = async (
  token: string,
  data: { tipo: TicketTipo; asunto: string; descripcion: string },
): Promise<{ ticket: Ticket }> => {
  const response = await fetch(`${API_BASE_URL}/soporte/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.message ?? "No se pudo crear el ticket.");
  return json as { ticket: Ticket };
};

export const getMisTickets = async (token: string): Promise<Ticket[]> => {
  const response = await fetch(`${API_BASE_URL}/soporte/tickets/mis-tickets`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.message ?? "No se pudieron obtener los tickets.");
  return (json as { tickets: Ticket[] }).tickets;
};

export const getTicketDetalle = async (
  token: string,
  id: number,
): Promise<TicketDetalle> => {
  const response = await fetch(`${API_BASE_URL}/soporte/tickets/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.message ?? "No se pudo obtener el ticket.");
  return json as TicketDetalle;
};

export const agregarRespuesta = async (
  token: string,
  idTicket: number,
  mensaje: string,
): Promise<{ respuesta: RespuestaTicket }> => {
  const response = await fetch(
    `${API_BASE_URL}/soporte/tickets/${idTicket}/respuestas`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mensaje }),
    },
  );

  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.message ?? "No se pudo enviar la respuesta.");
  return json as { respuesta: RespuestaTicket };
};

// ─── Admin ───────────────────────────────────────────────────

export const getAllTicketsAdmin = async (
  token: string,
  filters?: { estado?: TicketEstado; tipo?: TicketTipo },
): Promise<TicketConUsuario[]> => {
  const params = new URLSearchParams();
  if (filters?.estado) params.set("estado", filters.estado);
  if (filters?.tipo)   params.set("tipo", filters.tipo);

  const qs = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}/soporte/admin/tickets${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.message ?? "No se pudieron obtener los tickets.");
  return (json as { tickets: TicketConUsuario[] }).tickets;
};

export const getTicketDetalleAdmin = async (
  token: string,
  id: number,
): Promise<TicketDetalleAdmin> => {
  const response = await fetch(`${API_BASE_URL}/soporte/admin/tickets/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.message ?? "No se pudo obtener el ticket.");
  return json as TicketDetalleAdmin;
};

export const responderTicketAdmin = async (
  token: string,
  idTicket: number,
  mensaje: string,
): Promise<{ respuesta: RespuestaTicket }> => {
  const response = await fetch(
    `${API_BASE_URL}/soporte/admin/tickets/${idTicket}/respuestas`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mensaje }),
    },
  );

  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.message ?? "No se pudo enviar la respuesta.");
  return json as { respuesta: RespuestaTicket };
};

export const cambiarEstadoTicket = async (
  token: string,
  idTicket: number,
  estado: TicketEstado,
): Promise<{ ticket: Ticket }> => {
  const response = await fetch(
    `${API_BASE_URL}/soporte/admin/tickets/${idTicket}/estado`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ estado }),
    },
  );

  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.message ?? "No se pudo cambiar el estado.");
  return json as { ticket: Ticket };
};
