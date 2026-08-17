import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMetricasHistorico, rangoUltimosMeses } from "./metricasHistoricoService";
import { API_BASE_URL } from "../config/apiBaseUrl";
import { brokenJsonResponse, errorResponse, jsonResponse, mockFetch } from "../test/helpers";

const base = `${API_BASE_URL}/admin/metricas/historico`;

describe("fetchMetricasHistorico", () => {
  it("consulta sin query cuando no hay rango", async () => {
    const fetchMock = mockFetch(jsonResponse({ series: [] }));
    await fetchMetricasHistorico("tok");
    expect(fetchMock).toHaveBeenCalledWith(base, { headers: { Authorization: "Bearer tok" } });
  });

  it("agrega desde y hasta a la query", async () => {
    const fetchMock = mockFetch(jsonResponse({ series: [] }));
    await fetchMetricasHistorico("tok", "2025-01", "2025-06");
    expect(fetchMock.mock.calls[0][0]).toBe(`${base}?desde=2025-01&hasta=2025-06`);
  });

  it("acepta sólo uno de los extremos", async () => {
    const fetchMock = mockFetch(jsonResponse({ series: [] }));
    await fetchMetricasHistorico("tok", undefined, "2025-06");
    expect(fetchMock.mock.calls[0][0]).toBe(`${base}?hasta=2025-06`);
  });

  it("propaga el error del backend y el genérico", async () => {
    mockFetch(errorResponse({ message: "Rango inválido" }, 400));
    await expect(fetchMetricasHistorico("tok")).rejects.toThrow("Rango inválido");

    mockFetch(brokenJsonResponse());
    await expect(fetchMetricasHistorico("tok")).rejects.toThrow(
      "Error al obtener métricas históricas",
    );
  });
});

describe("rangoUltimosMeses", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("incluye el mes actual como extremo superior", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T10:00:00Z"));
    expect(rangoUltimosMeses(6)).toEqual({ desde: "2025-01", hasta: "2025-06" });
  });

  it("cruza el cambio de año hacia atrás", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-02-03T00:00:00Z"));
    expect(rangoUltimosMeses(12)).toEqual({ desde: "2024-03", hasta: "2025-02" });
  });

  it("devuelve el mismo mes cuando se pide uno solo", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-11-30T23:59:59Z"));
    expect(rangoUltimosMeses(1)).toEqual({ desde: "2025-11", hasta: "2025-11" });
  });
});
