import { describe, expect, it } from "vitest";
import { createDeviceReport, getMyReportStatus, reactivateMyAccount } from "./reportService";
import { API_BASE_URL } from "../config/apiBaseUrl";
import { brokenJsonResponse, errorResponse, jsonResponse, mockFetch } from "../test/helpers";

describe("createDeviceReport", () => {
  it("recorta la descripción y envía el flag de ubicación", async () => {
    const fetchMock = mockFetch(jsonResponse({ reporte: { id: 1 } }));

    const result = await createDeviceReport({
      token: "tok",
      draft: {
        reportType: "Robado",
        description: "  me lo robaron  ",
        includeLocation: true,
      },
    });

    expect(result).toEqual({ reporte: { id: 1 } });
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/reportes-dispositivo`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer tok" },
      body: JSON.stringify({
        tipo_reporte: "Robado",
        descripcion: "me lo robaron",
        incluye_ubicacion: true,
      }),
    });
  });

  it("manda descripcion null cuando el texto está vacío", async () => {
    const fetchMock = mockFetch(jsonResponse({ reporte: { id: 1 } }));
    await createDeviceReport({
      token: "tok",
      draft: { reportType: "Perdido", description: "   ", includeLocation: false },
    });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string).descripcion).toBeNull();
  });

  it("prioriza message sobre error y cae al texto por defecto", async () => {
    mockFetch(errorResponse({ message: "Ya tenés un reporte activo", error: "otro" }, 409));
    await expect(
      createDeviceReport({
        token: "tok",
        draft: { reportType: "Perdido", description: "", includeLocation: false },
      }),
    ).rejects.toThrow("Ya tenés un reporte activo");

    mockFetch(brokenJsonResponse());
    await expect(
      createDeviceReport({
        token: "tok",
        draft: { reportType: "Perdido", description: "", includeLocation: false },
      }),
    ).rejects.toThrow("No se pudo guardar el reporte.");
  });
});

describe("getMyReportStatus", () => {
  it("consulta el estado propio", async () => {
    const estado = { estado_cuenta: "suspendida", ultimo_reporte: null };
    const fetchMock = mockFetch(jsonResponse(estado));

    await expect(getMyReportStatus("tok")).resolves.toEqual(estado);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/reportes-dispositivo/mi-estado`, {
      method: "GET",
      headers: { Authorization: "Bearer tok" },
    });
  });

  it("usa el mensaje del backend o el genérico", async () => {
    mockFetch(errorResponse({ error: "Token inválido" }, 400));
    await expect(getMyReportStatus("tok")).rejects.toThrow("Token inválido");

    mockFetch(brokenJsonResponse());
    await expect(getMyReportStatus("tok")).rejects.toThrow(
      "No se pudo obtener el estado de reportes.",
    );
  });
});

describe("reactivateMyAccount", () => {
  it("postea la reactivación y devuelve el estado nuevo", async () => {
    const estado = { estado_cuenta: "activa", ultimo_reporte: null };
    const fetchMock = mockFetch(jsonResponse(estado));

    await expect(reactivateMyAccount("tok")).resolves.toEqual(estado);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/reportes-dispositivo/reactivar-cuenta`,
      { method: "POST", headers: { Authorization: "Bearer tok" } },
    );
  });

  it("usa el mensaje del backend o el genérico", async () => {
    mockFetch(errorResponse({ message: "La cuenta no está suspendida" }, 409));
    await expect(reactivateMyAccount("tok")).rejects.toThrow("La cuenta no está suspendida");

    mockFetch(brokenJsonResponse());
    await expect(reactivateMyAccount("tok")).rejects.toThrow("No se pudo reactivar la cuenta.");
  });
});
