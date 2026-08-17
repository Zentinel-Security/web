import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";
import { renderWithProviders, seedSession } from "../../test/helpers";
import * as planesService from "../../services/planesService";
import * as metricasService from "../../services/metricasService";
import type { Plan } from "../../services/planesService";

const plan = (overrides: Partial<Plan> = {}): Plan => ({
  id: 1,
  name: "gratuito",
  description: "Plan base",
  price: 0,
  price_cents: 0,
  interval: "mes",
  limits: {},
  active: true,
  ...overrides,
});

describe("Home (landing)", () => {
  beforeEach(() => {
    vi.spyOn(planesService, "getPlanes").mockResolvedValue([]);
  });

  it("muestra el hero con los accesos a extravíos y soporte", async () => {
    renderWithProviders(<Home />);

    expect(
      screen.getByRole("heading", { name: /tu dispositivo, siempre protegido/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /reportar dispositivo/i })).toHaveAttribute(
      "href",
      "/extravios",
    );
    expect(screen.getByRole("link", { name: /contactar soporte/i })).toHaveAttribute(
      "href",
      "/soporte",
    );
    await waitFor(() => expect(planesService.getPlanes).toHaveBeenCalled());
  });

  it("lista las funcionalidades y los pasos de onboarding", async () => {
    renderWithProviders(<Home />);

    ["Rastreo en tiempo real", "Reporte de extravío", "Alertas SOS", "Grupos de seguridad"].forEach(
      (titulo) => expect(screen.getAllByText(titulo).length).toBeGreaterThan(0),
    );
    expect(screen.getByText("Descargá la app")).toBeInTheDocument();
    expect(screen.getByText("Viví tranquilo")).toBeInTheDocument();
    await waitFor(() => expect(planesService.getPlanes).toHaveBeenCalled());
  });

  it("usa los planes estáticos cuando la API no devuelve planes", async () => {
    renderWithProviders(<Home />);

    expect(await screen.findByRole("heading", { name: "Premium Plus" })).toBeInTheDocument();
    expect(screen.getByText("Más popular")).toBeInTheDocument();
  });

  it("cae al fallback estático si la consulta de planes falla", async () => {
    vi.mocked(planesService.getPlanes).mockRejectedValue(new Error("500"));

    renderWithProviders(<Home />);

    expect(await screen.findByRole("heading", { name: "Gratuito" })).toBeInTheDocument();
  });

  it("renderiza los planes de la API con precios y features formateados", async () => {
    vi.mocked(planesService.getPlanes).mockResolvedValue([
      plan(),
      plan({
        id: 2,
        name: "premium_plus",
        price: 12000,
        interval: "month",
        features: [
          {
            codigo: "grupos",
            nombre: "Grupos",
            tipo_limite: "numeric",
            valor: 5,
            disponible: true,
          },
          {
            codigo: "zentinelas",
            nombre: "Zentinelas",
            tipo_limite: "numeric",
            valor: -1,
            disponible: true,
          },
          {
            codigo: "sos",
            nombre: "SOS avanzado",
            tipo_limite: "boolean",
            valor: false,
            disponible: false,
          },
        ],
      }),
      plan({ id: 3, name: "anual", price: 100000, interval: "año" }),
    ]);

    renderWithProviders(<Home />);

    expect(await screen.findByRole("heading", { name: "Premium plus" })).toBeInTheDocument();
    expect(screen.getByText("Gratis")).toBeInTheDocument();
    expect(screen.getByText("$12.000 / mes")).toBeInTheDocument();
    expect(screen.getByText("$100.000 / año")).toBeInTheDocument();
    expect(screen.getByText("(5)")).toBeInTheDocument();
    expect(screen.getByText("(∞)")).toBeInTheDocument();
    expect(screen.getByText("SOS avanzado")).toBeInTheDocument();
  });

  it("muestra el contador genérico a un visitante", async () => {
    const metricas = vi.spyOn(metricasService, "fetchMetricas");

    renderWithProviders(<Home />);

    expect(screen.getByText("+100")).toBeInTheDocument();
    expect(metricas).not.toHaveBeenCalled();
    await waitFor(() => expect(planesService.getPlanes).toHaveBeenCalled());
  });

  it("muestra el total real de usuarios a un staff", async () => {
    seedSession({ id_rol: 4 });
    vi.spyOn(metricasService, "fetchMetricas").mockResolvedValue({
      usuarios: { total: 250 },
    } as Awaited<ReturnType<typeof metricasService.fetchMetricas>>);

    renderWithProviders(<Home />);

    await waitFor(() =>
      expect(metricasService.fetchMetricas).toHaveBeenCalledWith("token-de-prueba"),
    );
    await waitFor(() => expect(screen.getByText(/^\+\d+$/).textContent).not.toBe("+100"));
  });

  it("mantiene el contador genérico si fallan las métricas", async () => {
    seedSession({ id_rol: 4 });
    vi.spyOn(metricasService, "fetchMetricas").mockRejectedValue(new Error("403"));

    renderWithProviders(<Home />);

    await waitFor(() => expect(metricasService.fetchMetricas).toHaveBeenCalled());
    expect(screen.getByText("+100")).toBeInTheDocument();
  });
});
