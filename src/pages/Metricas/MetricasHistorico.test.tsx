import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MetricasHistorico from "./MetricasHistorico";
import { renderWithProviders, seedSession } from "../../test/helpers";
import * as historicoService from "../../services/metricasHistoricoService";
import * as pdf from "../../utils/exportarReportePDF";
import type {
  MetricaMensual,
  MetricasHistorico as MetricasHistoricoData,
  MetricasHistoricoResumen,
} from "../../services/metricasHistoricoService";

const mes = (overrides: Partial<MetricaMensual> = {}): MetricaMensual => ({
  mes: "2026-03",
  usuarios_nuevos: 12,
  usuarios_activos: 80,
  ingresos_reales: 45000,
  suscriptores_pago: 20,
  total_suscriptores: 100,
  tasa_conversion: 20,
  alertas_panico: 2,
  alertas_zona: 4,
  alertas_personal: 1,
  tickets_abiertos: 6,
  tickets_resueltos: 5,
  tiempo_resolucion_dias: 1.5,
  total_usuarios_registrados: 200,
  nuevas_suscripciones: 3,
  usuarios_recurrentes: 55,
  tasa_retencion: 68,
  ...overrides,
});

const mesVacio = (m: string): MetricaMensual =>
  mes({
    mes: m,
    usuarios_nuevos: 0,
    usuarios_activos: 0,
    ingresos_reales: 0,
    alertas_panico: 0,
    alertas_zona: 0,
    alertas_personal: 0,
    tickets_abiertos: 0,
    tickets_resueltos: 0,
  });

const resumen = (
  overrides: Partial<MetricasHistoricoResumen> = {},
): MetricasHistoricoResumen => ({
  total_usuarios_nuevos: 34,
  mau_promedio: 80,
  ingresos_periodo: 45000,
  tasa_conversion_actual: 20,
  total_alertas: 7,
  tickets_pendientes_hoy: 1,
  tasa_conversion_promedio: 18.55,
  tickets_abiertos_periodo: 6,
  nuevas_suscripciones_periodo: 3,
  tasa_retencion_promedio: 68.4,
  usuarios_perdidos: 9,
  delta_usuarios_nuevos: 12.5,
  delta_mau: -4,
  delta_ingresos: 0,
  delta_conversion: null,
  delta_tickets_abiertos: 3,
  delta_nuevas_suscripciones: 1,
  prev_usuarios_nuevos: 30,
  prev_mau: 84,
  prev_ingresos: 45000,
  prev_conversion: 18,
  prev_tickets_abiertos: 3,
  prev_nuevas_suscripciones: 2,
  ...overrides,
});

const historico = (
  overrides: Partial<MetricasHistoricoData> = {},
): MetricasHistoricoData => ({
  rango: { desde: "2026-01", hasta: "2026-06" },
  series: [mes({ mes: "2025-12", in_range: false }), mes()],
  resumen: resumen(),
  ...overrides,
});

describe("MetricasHistorico", () => {
  const mockFetch = (data: MetricasHistoricoData = historico()) =>
    vi.spyOn(historicoService, "fetchMetricasHistorico").mockResolvedValue(data);

  it("muestra los KPIs del período con sus deltas", async () => {
    seedSession({ id_rol: 4 });
    mockFetch();

    renderWithProviders(<MetricasHistorico />);

    expect(await screen.findByText("+34")).toBeInTheDocument();
    expect(screen.getAllByText("80").length).toBeGreaterThan(0);
    expect(screen.getByText("18.6%")).toBeInTheDocument();
    expect(screen.getByText("68.4%")).toBeInTheDocument();
    expect(screen.getByText("activos antes que no volvieron en este período")).toBeInTheDocument();
    expect(screen.getByText("2026-01 → 2026-06")).toBeInTheDocument();
  });

  it("muestra un guión cuando no hay retención calculable", async () => {
    seedSession({ id_rol: 4 });
    mockFetch(historico({ resumen: resumen({ tasa_retencion_promedio: null }) }));

    renderWithProviders(<MetricasHistorico />);

    await screen.findByText("+34");
    expect(
      screen.getByText("promedio mensual del período seleccionado").closest("div")
        ?.parentElement,
    ).toHaveTextContent("—");
  });

  it("avisa cuando el período no tiene actividad", async () => {
    seedSession({ id_rol: 4 });
    mockFetch(historico({ series: [mesVacio("2026-02"), mesVacio("2026-03")] }));

    renderWithProviders(<MetricasHistorico />);

    expect(
      await screen.findByText(/sin actividad registrada en el período seleccionado/i),
    ).toBeInTheDocument();
  });

  it("informa el error del backend", async () => {
    seedSession({ id_rol: 4 });
    vi.spyOn(historicoService, "fetchMetricasHistorico").mockRejectedValue(
      new Error("Rango inválido"),
    );

    renderWithProviders(<MetricasHistorico />);

    expect(await screen.findByText(/error al cargar histórico: rango inválido/i)).toBeInTheDocument();
  });

  it("recarga los datos al cambiar el preset de período", async () => {
    seedSession({ id_rol: 4 });
    const fetchSpy = mockFetch();

    renderWithProviders(<MetricasHistorico />);
    await screen.findByText("+34");

    await userEvent.click(screen.getByRole("button", { name: "12 meses" }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
    const esperado = historicoService.rangoUltimosMeses(12);
    expect(fetchSpy).toHaveBeenLastCalledWith(
      "token-de-prueba",
      esperado.desde,
      esperado.hasta,
    );
  });

  it("valida y aplica un rango personalizado", async () => {
    seedSession({ id_rol: 4 });
    const fetchSpy = mockFetch();

    renderWithProviders(<MetricasHistorico />);
    await screen.findByText("+34");

    await userEvent.click(screen.getByRole("button", { name: /personalizado/i }));
    const [desde, hasta] = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="month"]'),
    );

    await userEvent.type(desde, "2026-05");
    await userEvent.type(hasta, "2026-02");
    expect(screen.getByText(/no puede ser posterior a/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aplicar" })).toBeDisabled();

    await userEvent.clear(hasta);
    await userEvent.type(hasta, "2026-07");
    await userEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenLastCalledWith("token-de-prueba", "2026-05", "2026-07"),
    );
  });

  it("exporta el reporte en PDF", async () => {
    seedSession({ id_rol: 4 });
    const data = historico();
    mockFetch(data);
    const exportar = vi.spyOn(pdf, "exportarReportePDF").mockImplementation(() => {});

    renderWithProviders(<MetricasHistorico />);
    await screen.findByText("+34");
    await userEvent.click(screen.getByRole("button", { name: /exportar pdf/i }));

    expect(exportar).toHaveBeenCalledWith(data);
  });

  it("avisa si la generación del PDF falla", async () => {
    seedSession({ id_rol: 4 });
    mockFetch();
    vi.spyOn(pdf, "exportarReportePDF").mockImplementation(() => {
      throw new Error("jsPDF roto");
    });
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithProviders(<MetricasHistorico />);
    await screen.findByText("+34");
    await userEvent.click(screen.getByRole("button", { name: /exportar pdf/i }));

    expect(alerta).toHaveBeenCalledWith("No se pudo generar el PDF. Intentá de nuevo.");
  });

  it("permite aislar una serie desde la leyenda y volver a ver todo", async () => {
    seedSession({ id_rol: 4 });
    mockFetch();

    renderWithProviders(<MetricasHistorico />);
    const nuevos = await screen.findByRole("button", { name: "Nuevos registros" });

    await userEvent.click(nuevos);
    expect(screen.getAllByRole("button", { name: /ver todo/i }).length).toBeGreaterThan(0);

    await userEvent.click(nuevos);
    expect(screen.queryByRole("button", { name: /ver todo/i })).not.toBeInTheDocument();
  });
});
