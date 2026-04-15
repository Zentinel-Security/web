import type { TicketTipo, TicketEstado } from "../../services/ticketService";

export const TIPO_LABELS: Record<TicketTipo, string> = {
  consulta:        "Consulta",
  reclamo:         "Reclamo",
  soporte_tecnico: "Soporte Técnico",
  facturacion:     "Facturación",
  reporte:         "Reporte",
};

export const ESTADO_BADGE: Record<TicketEstado, string> = {
  abierto:     "bg-blue-500/15 text-blue-400",
  en_progreso: "bg-amber-500/15 text-amber-400",
  resuelto:    "bg-green-500/15 text-green-400",
  cerrado:     "bg-zinc-500/15 text-zinc-400",
};

export const ESTADO_LABELS: Record<TicketEstado, string> = {
  abierto:     "Abierto",
  en_progreso: "En Progreso",
  resuelto:    "Resuelto",
  cerrado:     "Cerrado",
};
