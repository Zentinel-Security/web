import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Inicio from "./Inicio";
import { renderWithProviders, seedSession } from "../../test/helpers";
import * as reportService from "../../services/reportService";
import type { DeviceReport } from "../../services/reportService";

const reporte = (overrides: Partial<DeviceReport> = {}): DeviceReport => ({
  id: 7,
  id_usuario: 1,
  tipo_reporte: "Robado",
  descripcion: "Celular robado en el colectivo",
  estado_reporte: "creado",
  incluye_ubicacion: false,
  fecha_creacion: "2026-01-05T10:00:00Z",
  ...overrides,
});

const abrirFormulario = async () => {
  await userEvent.click(
    await screen.findByRole("button", { name: /denunciar dispositivo extraviado/i }),
  );
};

const enviarFormulario = async () => {
  await userEvent.click(screen.getByRole("button", { name: /enviar reporte/i }));
};

describe("Inicio (centro de extravíos)", () => {
  beforeEach(() => {
    vi.spyOn(reportService, "getMyReportStatus").mockResolvedValue({
      estado_cuenta: "activa",
      ultimo_reporte: null,
    });
  });

  it("muestra el llamado a la acción a un visitante sin sesión", () => {
    renderWithProviders(<Inicio />);

    expect(screen.getByRole("heading", { name: /centro de extravíos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /denunciar dispositivo extraviado/i })).toBeInTheDocument();
    expect(reportService.getMyReportStatus).not.toHaveBeenCalled();
  });

  it("pide iniciar sesión cuando un visitante envía el reporte", async () => {
    renderWithProviders(<Inicio />);

    await abrirFormulario();
    await enviarFormulario();

    expect(await screen.findByRole("heading", { name: /inicia sesión para continuar/i })).toBeInTheDocument();
  });

  it("rechaza descripciones de más de 500 caracteres sin llamar al backend", async () => {
    seedSession();
    renderWithProviders(<Inicio />);
    await waitFor(() => expect(reportService.getMyReportStatus).toHaveBeenCalled());

    const crear = vi.spyOn(reportService, "createDeviceReport");
    await abrirFormulario();
    await userEvent.type(screen.getByLabelText(/información adicional/i), "x".repeat(501));
    await enviarFormulario();

    expect(await screen.findByText(/500 caracteres/i)).toBeInTheDocument();
    expect(crear).not.toHaveBeenCalled();
  });

  it("crea el reporte y deja la cuenta suspendida tras confirmar el resumen", async () => {
    seedSession();
    const crear = vi
      .spyOn(reportService, "createDeviceReport")
      .mockResolvedValue({ reporte: reporte() });
    vi.mocked(reportService.getMyReportStatus)
      .mockResolvedValueOnce({ estado_cuenta: "activa", ultimo_reporte: null })
      .mockResolvedValueOnce({ estado_cuenta: "suspendida", ultimo_reporte: reporte() });

    renderWithProviders(<Inicio />);
    await abrirFormulario();
    await userEvent.type(
      screen.getByLabelText(/información adicional/i),
      "Celular robado en el colectivo",
    );
    await enviarFormulario();
    await userEvent.click(await screen.findByRole("button", { name: /confirmar reporte/i }));

    await waitFor(() =>
      expect(crear).toHaveBeenCalledWith({
        draft: {
          reportType: "Perdido",
          description: "Celular robado en el colectivo",
          includeLocation: false,
        },
        token: "token-de-prueba",
      }),
    );
    expect(await screen.findByText(/cuenta suspendida correctamente/i)).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: /cuenta suspendida/i })).toBeInTheDocument();
  });

  it("informa el error del backend si el reporte no se puede guardar", async () => {
    seedSession();
    vi.spyOn(reportService, "createDeviceReport").mockRejectedValue(
      new Error("Ya existe un reporte activo"),
    );

    renderWithProviders(<Inicio />);
    await abrirFormulario();
    await enviarFormulario();
    await userEvent.click(await screen.findByRole("button", { name: /confirmar reporte/i }));

    expect(await screen.findByText("Ya existe un reporte activo")).toBeInTheDocument();
  });

  it("muestra el detalle del incidente y el mapa cuando el reporte incluye ubicación", async () => {
    seedSession();
    vi.mocked(reportService.getMyReportStatus).mockResolvedValue({
      estado_cuenta: "suspendida",
      ultimo_reporte: reporte({
        incluye_ubicacion: true,
        latitud: -31.42,
        longitud: -64.18,
        fecha_ubicacion: "2026-01-05T10:05:00Z",
      }),
    });

    renderWithProviders(<Inicio />);

    expect(await screen.findByRole("heading", { name: /cuenta suspendida/i })).toBeInTheDocument();
    expect(screen.getByText("Robado")).toBeInTheDocument();
    expect(screen.getByText("Activo (En búsqueda)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir externamente/i })).toHaveAttribute(
      "href",
      "https://www.google.com/maps/search/?api=1&query=-31.42,-64.18",
    );
  });

  it("aclara cuando el reporte no adjuntó ubicación", async () => {
    seedSession();
    vi.mocked(reportService.getMyReportStatus).mockResolvedValue({
      estado_cuenta: "suspendida",
      ultimo_reporte: reporte({ descripcion: null }),
    });

    renderWithProviders(<Inicio />);

    expect(await screen.findByText(/no se adjuntó ubicación/i)).toBeInTheDocument();
    expect(screen.getByText(/sin descripción proporcionada/i)).toBeInTheDocument();
  });

  it("reactiva la cuenta y muestra el resumen finalizado", async () => {
    seedSession();
    vi.mocked(reportService.getMyReportStatus).mockResolvedValue({
      estado_cuenta: "suspendida",
      ultimo_reporte: reporte(),
    });
    const reactivar = vi.spyOn(reportService, "reactivateMyAccount").mockResolvedValue({
      estado_cuenta: "activa",
      ultimo_reporte: reporte({ estado_reporte: "finalizado" }),
    });

    renderWithProviders(<Inicio />);
    await userEvent.click(await screen.findByRole("button", { name: /reactivar cuenta/i }));

    expect(reactivar).toHaveBeenCalledWith("token-de-prueba");
    expect(await screen.findByRole("heading", { name: /cuenta reactivada/i })).toBeInTheDocument();
    expect(screen.getByText("Resuelto (Finalizado)")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /volver al centro de extravíos/i }));
    expect(screen.getByRole("heading", { name: /centro de extravíos/i })).toBeInTheDocument();
  });

  it("informa si la reactivación falla", async () => {
    seedSession();
    vi.mocked(reportService.getMyReportStatus).mockResolvedValue({
      estado_cuenta: "suspendida",
      ultimo_reporte: reporte(),
    });
    vi.spyOn(reportService, "reactivateMyAccount").mockRejectedValue(new Error("Servicio caído"));

    renderWithProviders(<Inicio />);
    await userEvent.click(await screen.findByRole("button", { name: /reactivar cuenta/i }));

    expect(await screen.findByText("Servicio caído")).toBeInTheDocument();
  });

  it("no bloquea la pantalla si falla la consulta de estado", async () => {
    seedSession();
    vi.mocked(reportService.getMyReportStatus).mockRejectedValue(new Error("timeout"));

    renderWithProviders(<Inicio />);

    expect(
      await screen.findByRole("button", { name: /denunciar dispositivo extraviado/i }),
    ).toBeInTheDocument();
  });

  it("permite volver atrás desde el formulario", async () => {
    renderWithProviders(<Inicio />);

    await abrirFormulario();
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(screen.getByRole("button", { name: /denunciar dispositivo extraviado/i })).toBeInTheDocument();
  });
});
