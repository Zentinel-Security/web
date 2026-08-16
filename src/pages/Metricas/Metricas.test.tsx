import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Metricas from "./Metricas";
import { renderWithProviders, seedSession } from "../../test/helpers";
import * as metricasService from "../../services/metricasService";
import * as historicoService from "../../services/metricasHistoricoService";
import type { MetricasData } from "../../services/metricasService";

const metricas = (overrides: Partial<MetricasData> = {}): MetricasData => ({
  usuarios: { total: 120, activos: 100 },
  grupos: { promedio_por_usuario: 1.234, promedio_integrantes: 3.5 },
  zentinelas: { promedio_por_usuario: 2 },
  zonas: { activas: 42 },
  alertas: { zona_mes: 15, panico_mes: 3 },
  planes: [
    { plan: "gratuito", cantidad: 60, activo: true },
    { plan: "premium_plus", cantidad: 40, activo: true },
    { plan: "legacy", cantidad: 5, activo: false },
  ],
  tickets: { total: 10, resueltos: 7 },
  ...overrides,
});

describe("Métricas", () => {
  beforeEach(() => {
    seedSession({ id_rol: 4 });
    vi.spyOn(historicoService, "fetchMetricasHistorico").mockRejectedValue(
      new Error("histórico no usado en esta pantalla"),
    );
  });

  it("muestra los KPIs de la red y la actividad del producto", async () => {
    vi.spyOn(metricasService, "fetchMetricas").mockResolvedValue(metricas());

    renderWithProviders(<Metricas />);

    expect(await screen.findByText("de 120 registrados")).toBeInTheDocument();
    expect(screen.getAllByText("100").length).toBeGreaterThan(0);
    expect(screen.getByText("1.23")).toBeInTheDocument();
    expect(screen.getByText("3.50")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("calcula la distribución de planes, la conversión y la resolución de tickets", async () => {
    vi.spyOn(metricasService, "fetchMetricas").mockResolvedValue(metricas());

    renderWithProviders(<Metricas />);

    expect(await screen.findByText("Premium Plus")).toBeInTheDocument();
    expect(screen.getByText("(40.0%)")).toBeInTheDocument();
    expect(screen.getByText("40.0%")).toBeInTheDocument();
    expect(screen.getByText("40 de 100 usuarios en plan pago")).toBeInTheDocument();
    expect(screen.getByText("Planes inactivos (1)")).toBeInTheDocument();
    expect(screen.getByText("5 usuarios")).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(screen.getByText("pendientes")).toBeInTheDocument();
  });

  it("tolera el caso sin usuarios ni tickets", async () => {
    vi.spyOn(metricasService, "fetchMetricas").mockResolvedValue(
      metricas({ planes: [], tickets: { total: 0, resueltos: 0 } }),
    );

    renderWithProviders(<Metricas />);

    expect(await screen.findByText("Sin datos")).toBeInTheDocument();
    expect(screen.getAllByText("0%").length).toBeGreaterThan(0);
    expect(screen.getByText("0 de 0 usuarios en plan pago")).toBeInTheDocument();
  });

  it("dibuja un círculo completo cuando un plan concentra todos los usuarios", async () => {
    vi.spyOn(metricasService, "fetchMetricas").mockResolvedValue(
      metricas({ planes: [{ plan: "premium", cantidad: 50, activo: true }] }),
    );

    renderWithProviders(<Metricas />);

    await screen.findByText("Premium");
    expect(document.querySelectorAll("svg circle").length).toBeGreaterThan(0);
    expect(screen.getByText("(100.0%)")).toBeInTheDocument();
  });

  it("muestra el error del backend y permite reintentar", async () => {
    const fetchSpy = vi
      .spyOn(metricasService, "fetchMetricas")
      .mockRejectedValueOnce(new Error("Sin permisos"))
      .mockResolvedValueOnce(metricas());

    renderWithProviders(<Metricas />);

    expect(await screen.findByText(/error al cargar métricas: sin permisos/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /actualizar/i }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("de 120 registrados")).toBeInTheDocument();
  });

  it("permite cambiar a la pestaña de análisis histórico", async () => {
    vi.spyOn(metricasService, "fetchMetricas").mockResolvedValue(metricas());

    renderWithProviders(<Metricas />);
    await userEvent.click(screen.getByRole("tab", { name: /análisis histórico/i }));

    await waitFor(() => expect(historicoService.fetchMetricasHistorico).toHaveBeenCalled());
    expect(screen.getByRole("tab", { name: /análisis histórico/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
