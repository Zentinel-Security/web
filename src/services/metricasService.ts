import { API_BASE_URL } from "../config/apiBaseUrl";
import { apiFetch } from "../utils/apiFetch";

export interface MetricasData {
  usuarios: {
    total: number;
    activos: number;
  };
  grupos: {
    promedio_por_usuario: number;
    promedio_integrantes: number;
  };
  zentinelas: {
    promedio_por_usuario: number;
  };
  zonas: {
    activas: number;
  };
  alertas: {
    zona_mes: number;
    panico_mes: number;
  };
  planes: { plan: string; cantidad: number; activo: boolean }[];
  tickets: {
    total: number;
    resueltos: number;
  };
}

export const fetchMetricas = async (token: string): Promise<MetricasData> => {
  const response = await apiFetch(`${API_BASE_URL}/admin/metricas`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.message ?? "Error al obtener métricas");
  return json as MetricasData;
};
