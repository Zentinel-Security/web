import { describe, expect, it } from "vitest";
import {
  activatePlan,
  createPlan,
  deactivatePlan,
  getFeatures,
  getPlanes,
  getPlanesAdmin,
  updatePlan,
  type UpdatePlanPayload,
} from "./planesService";
import { API_BASE_URL } from "../config/apiBaseUrl";
import { brokenJsonResponse, errorResponse, jsonResponse, mockFetch } from "../test/helpers";

const headers = { Authorization: "Bearer tok", "Content-Type": "application/json" };

const payload: UpdatePlanPayload = {
  nombre: "Premium",
  descripcion: "Plan completo",
  precio: 4999,
  intervalo: "mensual",
  limits: { zonas: 10, sos: true },
};

describe("getPlanes", () => {
  it("es público y devuelve data", async () => {
    const data = [{ id: 1, name: "Free" }];
    const fetchMock = mockFetch(jsonResponse({ data }));

    await expect(getPlanes()).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/planes`, {});
  });

  it("devuelve lista vacía si el backend no manda data", async () => {
    mockFetch(jsonResponse({}));
    await expect(getPlanes()).resolves.toEqual([]);
  });

  it("propaga el error del backend", async () => {
    mockFetch(errorResponse({ message: "Servicio caído" }, 503));
    await expect(getPlanes()).rejects.toThrow("Servicio caído");
  });
});

describe("getPlanesAdmin / getFeatures", () => {
  it("consulta los planes de administración con token", async () => {
    const fetchMock = mockFetch(jsonResponse({ data: [] }));
    await getPlanesAdmin("tok");
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/planes/admin/all`, { headers });
  });

  it("consulta el catálogo de features", async () => {
    const fetchMock = mockFetch(jsonResponse({ data: [{ codigo: "zonas" }] }));
    await expect(getFeatures("tok")).resolves.toEqual([{ codigo: "zonas" }]);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/planes/features`, { headers });
  });

  it("usa mensajes por defecto sin JSON", async () => {
    mockFetch(brokenJsonResponse());
    await expect(getPlanesAdmin("tok")).rejects.toThrow("Error obteniendo planes admin");

    mockFetch(brokenJsonResponse());
    await expect(getFeatures("tok")).rejects.toThrow("Error obteniendo features");
  });
});

describe("createPlan / updatePlan", () => {
  it("crea un plan con POST", async () => {
    const fetchMock = mockFetch(jsonResponse({ data: { id: 3, name: "Premium" } }));

    await expect(createPlan("tok", payload)).resolves.toEqual({ id: 3, name: "Premium" });
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/planes`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  });

  it("actualiza un plan con PUT sobre su id", async () => {
    const fetchMock = mockFetch(jsonResponse({ data: { id: 3 } }));
    await updatePlan("tok", 3, payload);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/planes/3`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
  });

  it("propaga los errores de validación del backend", async () => {
    mockFetch(errorResponse({ message: "El precio debe ser positivo" }, 400));
    await expect(createPlan("tok", payload)).rejects.toThrow("El precio debe ser positivo");

    mockFetch(brokenJsonResponse());
    await expect(updatePlan("tok", 3, payload)).rejects.toThrow("Error actualizando plan");
  });
});

describe("deactivatePlan / activatePlan", () => {
  it("desactiva con DELETE", async () => {
    const fetchMock = mockFetch(jsonResponse({}));
    await deactivatePlan("tok", 3);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/planes/3`, {
      method: "DELETE",
      headers,
    });
  });

  it("reactiva con PATCH", async () => {
    const fetchMock = mockFetch(jsonResponse({}));
    await activatePlan("tok", 3);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/planes/3/activate`, {
      method: "PATCH",
      headers,
    });
  });

  it("propaga los errores", async () => {
    mockFetch(errorResponse({ message: "Tiene suscriptores activos" }, 409));
    await expect(deactivatePlan("tok", 3)).rejects.toThrow("Tiene suscriptores activos");

    mockFetch(brokenJsonResponse());
    await expect(activatePlan("tok", 3)).rejects.toThrow("Error activando plan");
  });
});
