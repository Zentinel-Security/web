import { describe, expect, it } from "vitest";
import {
  agregarRespuesta,
  cambiarEstadoTicket,
  createTicket,
  getAllTicketsAdmin,
  getMisTickets,
  getTicketDetalle,
  getTicketDetalleAdmin,
  responderTicketAdmin,
} from "./ticketService";
import { API_BASE_URL } from "../config/apiBaseUrl";
import { brokenJsonResponse, errorResponse, jsonResponse, mockFetch } from "../test/helpers";

const authHeader = { Authorization: "Bearer tok" };
const jsonAuthHeaders = { "Content-Type": "application/json", Authorization: "Bearer tok" };

describe("tickets del usuario", () => {
  it("crea un ticket con tipo, asunto y descripción", async () => {
    const data = { tipo: "reclamo" as const, asunto: "Cobro doble", descripcion: "Me cobraron 2 veces" };
    const fetchMock = mockFetch(jsonResponse({ ticket: { id: 1 } }));

    await expect(createTicket("tok", data)).resolves.toEqual({ ticket: { id: 1 } });
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/soporte/tickets`, {
      method: "POST",
      headers: jsonAuthHeaders,
      body: JSON.stringify(data),
    });
  });

  it("desenvuelve la lista de tickets propios", async () => {
    const tickets = [{ id: 1 }, { id: 2 }];
    const fetchMock = mockFetch(jsonResponse({ tickets }));

    await expect(getMisTickets("tok")).resolves.toEqual(tickets);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/soporte/tickets/mis-tickets`, {
      headers: authHeader,
    });
  });

  it("obtiene el detalle con sus respuestas", async () => {
    const detalle = { ticket: { id: 4 }, respuestas: [] };
    const fetchMock = mockFetch(jsonResponse(detalle));

    await expect(getTicketDetalle("tok", 4)).resolves.toEqual(detalle);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/soporte/tickets/4`, {
      headers: authHeader,
    });
  });

  it("agrega una respuesta al hilo", async () => {
    const fetchMock = mockFetch(jsonResponse({ respuesta: { id: 8 } }));

    await agregarRespuesta("tok", 4, "Sigo sin solución");
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/soporte/tickets/4/respuestas`, {
      method: "POST",
      headers: jsonAuthHeaders,
      body: JSON.stringify({ mensaje: "Sigo sin solución" }),
    });
  });

  it("propaga errores del backend y mensajes por defecto", async () => {
    mockFetch(errorResponse({ message: "Asunto requerido" }, 400));
    await expect(
      createTicket("tok", { tipo: "consulta", asunto: "", descripcion: "x" }),
    ).rejects.toThrow("Asunto requerido");

    mockFetch(brokenJsonResponse());
    await expect(getMisTickets("tok")).rejects.toThrow("No se pudieron obtener los tickets.");

    mockFetch(brokenJsonResponse());
    await expect(getTicketDetalle("tok", 4)).rejects.toThrow("No se pudo obtener el ticket.");

    mockFetch(brokenJsonResponse());
    await expect(agregarRespuesta("tok", 4, "hola")).rejects.toThrow(
      "No se pudo enviar la respuesta.",
    );
  });
});

describe("tickets de soporte (admin)", () => {
  it("lista todos los tickets sin filtros", async () => {
    const fetchMock = mockFetch(jsonResponse({ tickets: [] }));
    await getAllTicketsAdmin("tok");
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/soporte/admin/tickets`, {
      headers: authHeader,
    });
  });

  it("aplica los filtros de estado y tipo", async () => {
    const fetchMock = mockFetch(jsonResponse({ tickets: [] }));
    await getAllTicketsAdmin("tok", { estado: "abierto", tipo: "facturacion" });
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${API_BASE_URL}/soporte/admin/tickets?estado=abierto&tipo=facturacion`,
    );
  });

  it("obtiene el detalle admin con datos del usuario", async () => {
    const detalle = { ticket: { id: 4, email: "ana@zentinel.test" }, respuestas: [] };
    const fetchMock = mockFetch(jsonResponse(detalle));

    await expect(getTicketDetalleAdmin("tok", 4)).resolves.toEqual(detalle);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/soporte/admin/tickets/4`, {
      headers: authHeader,
    });
  });

  it("responde como soporte", async () => {
    const fetchMock = mockFetch(jsonResponse({ respuesta: { id: 9, es_admin: true } }));
    await responderTicketAdmin("tok", 4, "Ya lo revisamos");
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/soporte/admin/tickets/4/respuestas`,
      {
        method: "POST",
        headers: jsonAuthHeaders,
        body: JSON.stringify({ mensaje: "Ya lo revisamos" }),
      },
    );
  });

  it("cambia el estado, incluyendo el motivo sólo si se envía", async () => {
    const conMotivo = mockFetch(jsonResponse({ ticket: { id: 4 } }));
    await cambiarEstadoTicket("tok", 4, "cerrado", "Duplicado");
    expect(JSON.parse(conMotivo.mock.calls[0][1].body as string)).toEqual({
      estado: "cerrado",
      motivo: "Duplicado",
    });

    const sinMotivo = mockFetch(jsonResponse({ ticket: { id: 4 } }));
    await cambiarEstadoTicket("tok", 4, "resuelto");
    expect(JSON.parse(sinMotivo.mock.calls[0][1].body as string)).toEqual({ estado: "resuelto" });
    expect(sinMotivo.mock.calls[0][1].method).toBe("PATCH");
  });

  it("propaga errores del backend y mensajes por defecto", async () => {
    mockFetch(errorResponse({ message: "Sin permisos" }, 403));
    await expect(getAllTicketsAdmin("tok")).rejects.toThrow("Sin permisos");

    mockFetch(brokenJsonResponse());
    await expect(getTicketDetalleAdmin("tok", 4)).rejects.toThrow("No se pudo obtener el ticket.");

    mockFetch(brokenJsonResponse());
    await expect(responderTicketAdmin("tok", 4, "x")).rejects.toThrow(
      "No se pudo enviar la respuesta.",
    );

    mockFetch(brokenJsonResponse());
    await expect(cambiarEstadoTicket("tok", 4, "cerrado")).rejects.toThrow(
      "No se pudo cambiar el estado.",
    );
  });
});
