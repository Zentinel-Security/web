import { describe, expect, it } from "vitest";
import { fetchMetricas, type MetricasData } from "./metricasService";
import { API_BASE_URL } from "../config/apiBaseUrl";
import { brokenJsonResponse, errorResponse, jsonResponse, mockFetch } from "../test/helpers";

export const metricasFixture: MetricasData = {
  usuarios: { total: 120, activos: 80 },
  grupos: { promedio_por_usuario: 1.4, promedio_integrantes: 3.2 },
  zentinelas: { promedio_por_usuario: 2 },
  zonas: { activas: 45 },
  alertas: { zona_mes: 12, panico_mes: 3 },
  planes: [{ plan: "Free", cantidad: 100, activo: true }],
  tickets: { total: 10, resueltos: 7 },
};

describe("fetchMetricas", () => {
  it("pide las métricas con el token del staff", async () => {
    const fetchMock = mockFetch(jsonResponse(metricasFixture));

    await expect(fetchMetricas("tok")).resolves.toEqual(metricasFixture);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/admin/metricas`, {
      headers: { Authorization: "Bearer tok" },
    });
  });

  it("propaga el error del backend", async () => {
    mockFetch(errorResponse({ message: "Sin permisos" }, 403));
    await expect(fetchMetricas("tok")).rejects.toThrow("Sin permisos");
  });

  it("usa el mensaje por defecto si no hay JSON", async () => {
    mockFetch(brokenJsonResponse());
    await expect(fetchMetricas("tok")).rejects.toThrow("Error al obtener métricas");
  });
});
