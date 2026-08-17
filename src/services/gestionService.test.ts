import { describe, expect, it } from "vitest";
import {
  cambiarRolUsuario,
  getAuditLog,
  getReportesAdmin,
  getUsuariosAdmin,
  reactivarUsuario,
  suspenderUsuario,
} from "./gestionService";
import { API_BASE_URL } from "../config/apiBaseUrl";
import { brokenJsonResponse, errorResponse, jsonResponse, mockFetch } from "../test/helpers";

const authHeader = { Authorization: "Bearer tok" };
const jsonAuthHeaders = { "Content-Type": "application/json", Authorization: "Bearer tok" };

describe("getUsuariosAdmin", () => {
  it("desenvuelve la lista de usuarios", async () => {
    const usuarios = [{ id: 1, nombre: "Ana" }];
    const fetchMock = mockFetch(jsonResponse({ usuarios }));

    await expect(getUsuariosAdmin("tok")).resolves.toEqual(usuarios);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/usuarios/admin/todos`, {
      headers: authHeader,
    });
  });

  it("propaga el error del backend", async () => {
    mockFetch(errorResponse({ error: "Sin permisos" }, 403));
    await expect(getUsuariosAdmin("tok")).rejects.toThrow("Sin permisos");
  });

  it("usa el mensaje por defecto sin JSON", async () => {
    mockFetch(brokenJsonResponse());
    await expect(getUsuariosAdmin("tok")).rejects.toThrow(
      "No se pudieron obtener los usuarios.",
    );
  });
});

describe("getReportesAdmin", () => {
  it("desenvuelve la lista de reportes", async () => {
    const reportes = [{ id: 3, tipo_reporte: "Robado" }];
    const fetchMock = mockFetch(jsonResponse({ reportes }));

    await expect(getReportesAdmin("tok")).resolves.toEqual(reportes);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/reportes-dispositivo/admin/todos`, {
      headers: authHeader,
    });
  });

  it("usa el mensaje por defecto sin JSON", async () => {
    mockFetch(brokenJsonResponse());
    await expect(getReportesAdmin("tok")).rejects.toThrow(
      "No se pudieron obtener los reportes.",
    );
  });
});

describe("suspenderUsuario / reactivarUsuario", () => {
  it("suspende enviando el motivo", async () => {
    const fetchMock = mockFetch(jsonResponse({}));
    await suspenderUsuario("tok", 5, "Uso indebido");
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/usuarios/5/suspender`, {
      method: "PATCH",
      headers: jsonAuthHeaders,
      body: JSON.stringify({ motivo: "Uso indebido" }),
    });
  });

  it("reactiva enviando el motivo", async () => {
    const fetchMock = mockFetch(jsonResponse({}));
    await reactivarUsuario("tok", 5, "Apelación aceptada");
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/usuarios/5/reactivar`, {
      method: "PATCH",
      headers: jsonAuthHeaders,
      body: JSON.stringify({ motivo: "Apelación aceptada" }),
    });
  });

  it("propaga los errores de cada operación", async () => {
    mockFetch(errorResponse({ error: "Ya está suspendido" }, 409));
    await expect(suspenderUsuario("tok", 5, "m")).rejects.toThrow("Ya está suspendido");

    mockFetch(brokenJsonResponse());
    await expect(reactivarUsuario("tok", 5, "m")).rejects.toThrow("Error al reactivar usuario");
  });
});

describe("getAuditLog", () => {
  it("consulta sin query cuando no hay filtros", async () => {
    const fetchMock = mockFetch(jsonResponse({ data: [], total: 0 }));
    await getAuditLog("tok");
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/admin/auditoria`, {
      headers: authHeader,
    });
  });

  it("arma la query con todos los filtros aplicados", async () => {
    const fetchMock = mockFetch(jsonResponse({ data: [], total: 0 }));
    await getAuditLog("tok", {
      tipo_evento: "suspension",
      id_actor: 2,
      fecha_desde: "2025-01-01",
      fecha_hasta: "2025-02-01",
      page: 3,
      limit: 25,
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${API_BASE_URL}/admin/auditoria?tipo_evento=suspension&id_actor=2&fecha_desde=2025-01-01&fecha_hasta=2025-02-01&page=3&limit=25`,
    );
  });

  it("ignora filtros vacíos o en cero", async () => {
    const fetchMock = mockFetch(jsonResponse({ data: [], total: 0 }));
    await getAuditLog("tok", { tipo_evento: "", id_actor: 0, page: 0, limit: 10 });
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_BASE_URL}/admin/auditoria?limit=10`);
  });

  it("usa el mensaje por defecto sin JSON", async () => {
    mockFetch(brokenJsonResponse());
    await expect(getAuditLog("tok")).rejects.toThrow("Error al obtener el log de auditoría");
  });
});

describe("cambiarRolUsuario", () => {
  it("devuelve el usuario actualizado", async () => {
    const usuario = { id: 5, id_rol: 4 };
    const fetchMock = mockFetch(jsonResponse({ usuario }));

    await expect(cambiarRolUsuario("tok", 5, 4)).resolves.toEqual(usuario);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/usuarios/5/cambiar-rol`, {
      method: "PATCH",
      headers: jsonAuthHeaders,
      body: JSON.stringify({ id_rol: 4 }),
    });
  });

  it("usa el mensaje por defecto sin JSON", async () => {
    mockFetch(brokenJsonResponse());
    await expect(cambiarRolUsuario("tok", 5, 4)).rejects.toThrow("Error al cambiar el rol");
  });
});
