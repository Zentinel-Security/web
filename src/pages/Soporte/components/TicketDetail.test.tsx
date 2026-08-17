import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TicketDetail from "./TicketDetail";
import { renderWithProviders } from "../../../test/helpers";
import * as ticketService from "../../../services/ticketService";
import type { RespuestaTicket, Ticket, TicketDetalle } from "../../../services/ticketService";

const ticket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 4,
  id_usuario: 1,
  tipo: "soporte_tecnico",
  asunto: "La app se cierra sola",
  descripcion: "Pasa al abrir el mapa",
  estado: "abierto",
  fecha_creacion: "2026-02-01T12:00:00Z",
  fecha_actualizacion: "2026-02-01T12:00:00Z",
  fecha_resolucion: null,
  ...overrides,
});

const respuesta = (overrides: Partial<RespuestaTicket> = {}): RespuestaTicket => ({
  id: 11,
  id_ticket: 4,
  id_usuario: 5,
  es_admin: true,
  mensaje: "Estamos revisando el caso",
  fecha_creacion: "2026-02-02T09:00:00Z",
  nombre: "Lucía",
  apellido: "Gómez",
  avatar: null,
  ...overrides,
});

const detalle = (overrides: Partial<TicketDetalle> = {}): TicketDetalle => ({
  ticket: ticket(),
  respuestas: [],
  ...overrides,
});

const render = (onClose = vi.fn()) => {
  renderWithProviders(<TicketDetail ticketId={4} token="token-de-prueba" onClose={onClose} />);
  return onClose;
};

describe("TicketDetail", () => {
  it("muestra la cabecera, el mensaje original y el aviso de hilo vacío", async () => {
    vi.spyOn(ticketService, "getTicketDetalle").mockResolvedValue(detalle());

    render();

    expect(await screen.findByText("Pasa al abrir el mapa")).toBeInTheDocument();
    expect(screen.getByText(/#4 · Soporte Técnico/)).toBeInTheDocument();
    expect(screen.getByText(/sin respuestas aún/i)).toBeInTheDocument();
  });

  it("renderiza el hilo con las respuestas de soporte", async () => {
    vi.spyOn(ticketService, "getTicketDetalle").mockResolvedValue(
      detalle({ respuestas: [respuesta(), respuesta({ id: 12, es_admin: false, mensaje: "Gracias" })] }),
    );

    render();

    expect(await screen.findByText("Estamos revisando el caso")).toBeInTheDocument();
    expect(screen.getByText(/Soporte · Lucía/)).toBeInTheDocument();
    expect(screen.getByText("Gracias")).toBeInTheDocument();
  });

  it("informa si el detalle no se puede cargar", async () => {
    vi.spyOn(ticketService, "getTicketDetalle").mockRejectedValue(new Error("Ticket inexistente"));

    render();

    expect(await screen.findByText("Ticket inexistente")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/escribe tu respuesta/i)).not.toBeInTheDocument();
  });

  it("envía una respuesta y la agrega al hilo", async () => {
    vi.spyOn(ticketService, "getTicketDetalle").mockResolvedValue(detalle());
    const agregar = vi
      .spyOn(ticketService, "agregarRespuesta")
      .mockResolvedValue({ respuesta: respuesta({ es_admin: false, mensaje: "Sigue fallando" }) });

    render();
    const caja = await screen.findByPlaceholderText(/escribe tu respuesta/i);
    await userEvent.type(caja, "Sigue fallando");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await waitFor(() =>
      expect(agregar).toHaveBeenCalledWith("token-de-prueba", 4, "Sigue fallando"),
    );
    expect(await screen.findByText("Sigue fallando")).toBeInTheDocument();
    expect(caja).toHaveValue("");
  });

  it("muestra el error al fallar el envío de la respuesta", async () => {
    vi.spyOn(ticketService, "getTicketDetalle").mockResolvedValue(detalle());
    vi.spyOn(ticketService, "agregarRespuesta").mockRejectedValue(new Error("Ticket bloqueado"));

    render();
    await userEvent.type(
      await screen.findByPlaceholderText(/escribe tu respuesta/i),
      "Hola",
    );
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Ticket bloqueado")).toBeInTheDocument();
  });

  it("bloquea la respuesta cuando el ticket está cerrado", async () => {
    vi.spyOn(ticketService, "getTicketDetalle").mockResolvedValue(
      detalle({ ticket: ticket({ estado: "cerrado" }) }),
    );

    render();

    expect(await screen.findByText(/no es posible agregar más respuestas/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/escribe tu respuesta/i)).not.toBeInTheDocument();
  });

  it("cierra el modal con el botón, el fondo y Escape", async () => {
    vi.spyOn(ticketService, "getTicketDetalle").mockResolvedValue(detalle());
    const onClose = render();
    await screen.findByText("Pasa al abrir el mapa");

    await userEvent.keyboard("{Escape}");
    await userEvent.click(document.querySelector('[aria-hidden="true"]') as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
