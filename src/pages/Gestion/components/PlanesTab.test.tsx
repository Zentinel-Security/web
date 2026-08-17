import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PlanesTab from "./PlanesTab";
import { renderWithProviders } from "../../../test/helpers";
import * as planesService from "../../../services/planesService";
import type { Plan, PlanFeatureDef } from "../../../services/planesService";

const plan = (overrides: Partial<Plan> = {}): Plan => ({
  id: 1,
  name: "premium",
  description: "Plan con todo incluido",
  price: 4500,
  price_cents: 450000,
  interval: "mes",
  limits: { zonas: 10, sos_prioritario: true },
  active: true,
  features: [
    { codigo: "zonas", nombre: "Zonas seguras", tipo_limite: "numeric", valor: 10, disponible: true },
    { codigo: "sos_prioritario", nombre: "SOS prioritario", tipo_limite: "boolean", valor: true, disponible: true },
    { codigo: "grupos", nombre: "Grupos", tipo_limite: "numeric", valor: -1, disponible: true },
  ],
  ...overrides,
});

const features: PlanFeatureDef[] = [
  {
    codigo: "zonas",
    nombre: "Zonas seguras",
    descripcion: "Cantidad de zonas configurables",
    tipo_limite: "numeric",
    icono: "map",
    orden: 1,
  },
  {
    codigo: "sos_prioritario",
    nombre: "SOS prioritario",
    descripcion: "Atención prioritaria del botón SOS",
    tipo_limite: "boolean",
    icono: "bell",
    orden: 2,
  },
];

const mockCarga = (planes: Plan[] = [plan()]) => {
  vi.spyOn(planesService, "getPlanesAdmin").mockResolvedValue(planes);
  vi.spyOn(planesService, "getFeatures").mockResolvedValue(features);
};

const render = () => renderWithProviders(<PlanesTab token="token-de-prueba" />);

describe("PlanesTab", () => {
  it("lista los planes activos con precio y límites", async () => {
    mockCarga([plan(), plan({ id: 2, name: "gratuito", price: 0, features: [] })]);

    render();

    expect(await screen.findByText("Premium")).toBeInTheDocument();
    expect(screen.getByText("$4.500 / mes")).toBeInTheDocument();
    expect(screen.getByText("Gratis")).toBeInTheDocument();
    expect(screen.getByText("∞")).toBeInTheDocument();
    expect(screen.getByText("2 planes activos")).toBeInTheDocument();
  });

  it("oculta y luego muestra los planes inactivos", async () => {
    mockCarga([plan(), plan({ id: 2, name: "legacy", active: false, features: [] })]);

    render();
    await screen.findByText("Premium");

    expect(screen.queryByText("Legacy")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText(/1 plan inactivo oculto/i));

    expect(screen.getByText("Legacy")).toBeInTheDocument();
    expect(screen.getByText("Inactivo")).toBeInTheDocument();
  });

  it("permite reintentar cuando la carga falla", async () => {
    const spy = vi
      .spyOn(planesService, "getPlanesAdmin")
      .mockRejectedValueOnce(new Error("Sin permisos"))
      .mockResolvedValueOnce([plan()]);
    vi.spyOn(planesService, "getFeatures").mockResolvedValue(features);

    render();
    expect(await screen.findByText("Sin permisos")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /reintentar/i }));

    expect(await screen.findByText("Premium")).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("crea un plan nuevo con sus límites", async () => {
    mockCarga();
    const crear = vi.spyOn(planesService, "createPlan").mockResolvedValue(plan({ id: 9 }));

    render();
    await userEvent.click(await screen.findByRole("button", { name: /nuevo plan/i }));
    await userEvent.type(screen.getByPlaceholderText("ej: premium"), "familiar");
    await userEvent.type(
      screen.getByPlaceholderText(/plan para equipos/i),
      "Para grupos familiares",
    );
    await userEvent.type(screen.getAllByPlaceholderText("0")[0], "2500");
    await userEvent.selectOptions(screen.getByRole("combobox"), "año");
    await userEvent.click(screen.getByRole("button", { name: /crear plan/i }));

    await waitFor(() =>
      expect(crear).toHaveBeenCalledWith("token-de-prueba", {
        nombre: "familiar",
        descripcion: "Para grupos familiares",
        precio: 2500,
        intervalo: "año",
        limits: { zonas: 0, sos_prioritario: false },
      }),
    );
    expect(await screen.findByText(/plan "Familiar" creado/i)).toBeInTheDocument();
  });

  it("valida el nombre obligatorio antes de guardar", async () => {
    mockCarga();
    const crear = vi.spyOn(planesService, "createPlan");

    render();
    await userEvent.click(await screen.findByRole("button", { name: /nuevo plan/i }));
    await userEvent.click(screen.getByRole("button", { name: /crear plan/i }));

    expect(await screen.findByText(/el nombre del plan es obligatorio/i)).toBeInTheDocument();
    expect(crear).not.toHaveBeenCalled();
  });

  it("edita un plan existente cambiando sus límites", async () => {
    mockCarga();
    const actualizar = vi.spyOn(planesService, "updatePlan").mockResolvedValue(plan());

    render();
    await userEvent.click(await screen.findByRole("button", { name: "Editar" }));
    expect(screen.getByText("Editar plan: Premium")).toBeInTheDocument();

    const limite = screen.getByDisplayValue("10");
    await userEvent.clear(limite);
    await userEvent.type(limite, "25");
    await userEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() =>
      expect(actualizar).toHaveBeenCalledWith("token-de-prueba", 1, {
        nombre: "premium",
        descripcion: "Plan con todo incluido",
        precio: 4500,
        intervalo: "mes",
        limits: { zonas: 25, sos_prioritario: true },
      }),
    );
  });

  it("muestra el error del backend al guardar", async () => {
    mockCarga();
    vi.spyOn(planesService, "updatePlan").mockRejectedValue(new Error("Nombre duplicado"));

    render();
    await userEvent.click(await screen.findByRole("button", { name: "Editar" }));
    await userEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    expect(await screen.findByText("Nombre duplicado")).toBeInTheDocument();
  });

  it("desactiva un plan tras confirmar", async () => {
    mockCarga();
    const desactivar = vi.spyOn(planesService, "deactivatePlan").mockResolvedValue();

    render();
    await userEvent.click(await screen.findByRole("button", { name: "Desactivar" }));
    expect(screen.getByText(/¿desactivar "premium"\?/i)).toBeInTheDocument();

    const [, confirmar] = screen.getAllByRole("button", { name: "Desactivar" });
    await userEvent.click(confirmar);

    await waitFor(() => expect(desactivar).toHaveBeenCalledWith("token-de-prueba", 1));
    expect(await screen.findByText(/plan "Premium" desactivado/i)).toBeInTheDocument();
  });

  it("activa un plan inactivo sin confirmación", async () => {
    mockCarga([plan({ active: false })]);
    const activar = vi.spyOn(planesService, "activatePlan").mockResolvedValue();

    render();
    await userEvent.click(await screen.findByText(/1 plan inactivo oculto/i));
    await userEvent.click(screen.getByRole("button", { name: "Activar" }));

    await waitFor(() => expect(activar).toHaveBeenCalledWith("token-de-prueba", 1));
    expect(await screen.findByText(/plan "Premium" activado/i)).toBeInTheDocument();
  });

  it("cierra el modal con Cancelar", async () => {
    mockCarga();

    render();
    await userEvent.click(await screen.findByRole("button", { name: /nuevo plan/i }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByPlaceholderText("ej: premium")).not.toBeInTheDocument();
  });
});
