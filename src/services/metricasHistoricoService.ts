import { API_BASE_URL } from "../config/apiBaseUrl";
import { apiFetch } from "../utils/apiFetch";

export interface MetricaMensual {
  mes: string; // YYYY-MM
  in_range?: boolean; // false → mes de contexto fuera del rango seleccionado
  usuarios_nuevos: number;
  usuarios_activos: number;
  ingresos_reales: number;
  suscriptores_pago: number;
  total_suscriptores: number;
  tasa_conversion: number;
  alertas_panico: number;
  alertas_zona: number;
  alertas_personal: number;
  tickets_abiertos: number;
  tickets_resueltos: number;
  tiempo_resolucion_dias: number | null;
  total_usuarios_registrados: number;
  nuevas_suscripciones: number;
  usuarios_recurrentes: number;
  tasa_retencion: number | null;
}

export interface MetricasHistoricoResumen {
  total_usuarios_nuevos: number;
  mau_promedio: number;
  ingresos_periodo: number;
  tasa_conversion_actual: number;
  total_alertas: number;
  tickets_pendientes_hoy: number;
  // Promedios/totales del período (no snapshots del último momento)
  tasa_conversion_promedio: number;
  tickets_abiertos_periodo: number;
  nuevas_suscripciones_periodo: number;
  tasa_retencion_promedio: number | null;
  usuarios_perdidos: number;
  delta_usuarios_nuevos: number | null;
  delta_mau: number | null;
  delta_ingresos: number | null;
  delta_conversion: number | null;
  delta_tickets_abiertos: number | null;
  delta_nuevas_suscripciones: number | null;
  // Valores del período anterior
  prev_usuarios_nuevos: number;
  prev_mau: number;
  prev_ingresos: number;
  prev_conversion: number;
  prev_tickets_abiertos: number;
  prev_nuevas_suscripciones: number;
}

export interface MetricasHistorico {
  rango: { desde: string; hasta: string };
  series: MetricaMensual[];
  resumen: MetricasHistoricoResumen;
}

export const fetchMetricasHistorico = async (
  token: string,
  desde?: string,
  hasta?: string,
): Promise<MetricasHistorico> => {
  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);
  const qs = params.toString();
  const url = `${API_BASE_URL}/admin/metricas/historico${qs ? `?${qs}` : ""}`;

  const response = await apiFetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(json?.message ?? "Error al obtener métricas históricas");
  }
  return json as MetricasHistorico;
};

/**
 * Calcula el rango YYYY-MM para los últimos N meses (incluyendo el mes actual).
 */
export const rangoUltimosMeses = (cantidad: number): { desde: string; hasta: string } => {
  const hoy = new Date();
  const hasta = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1));
  const desde = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - (cantidad - 1), 1));
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  return { desde: fmt(desde), hasta: fmt(hasta) };
};
