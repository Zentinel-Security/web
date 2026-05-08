import type { ReportDraft } from "../pages/Inicio/components/ReportForm";
import { API_BASE_URL } from "../config/apiBaseUrl";
import { apiFetch } from "../utils/apiFetch";

interface CreateReportPayload {
  draft: ReportDraft;
  token: string;
}

export interface DeviceReport {
  id: number;
  id_usuario: number;
  tipo_reporte: "Perdido" | "Robado";
  descripcion: string | null;
  estado_reporte: "creado" | "finalizado";
  incluye_ubicacion: boolean;
  fecha_creacion: string;
  latitud?: number | null;
  longitud?: number | null;
  fecha_ubicacion?: string | null;
}

interface CreateDeviceReportResponse {
  reporte: DeviceReport;
}

export interface ReportStatusResponse {
  estado_cuenta: "activa" | "suspendida";
  ultimo_reporte: DeviceReport | null;
}

export const createDeviceReport = async ({ draft, token }: CreateReportPayload) => {
  const response = await apiFetch(`${API_BASE_URL}/reportes-dispositivo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      tipo_reporte: draft.reportType,
      descripcion: draft.description?.trim() || null,
      incluye_ubicacion: draft.includeLocation,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      "No se pudo guardar el reporte.";
    throw new Error(message);
  }

  return data as CreateDeviceReportResponse;
};

export const getMyReportStatus = async (token: string): Promise<ReportStatusResponse> => {
  const response = await apiFetch(`${API_BASE_URL}/reportes-dispositivo/mi-estado`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.error || "No se pudo obtener el estado de reportes.";
    throw new Error(message);
  }

  return data as ReportStatusResponse;
};

export const reactivateMyAccount = async (token: string): Promise<ReportStatusResponse> => {
  const response = await apiFetch(`${API_BASE_URL}/reportes-dispositivo/reactivar-cuenta`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.error || "No se pudo reactivar la cuenta.";
    throw new Error(message);
  }

  return data as ReportStatusResponse;
};
