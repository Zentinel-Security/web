import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AdminTicketDetail from "./AdminTicketDetail";
import { renderWithProviders } from "../../../test/helpers";
import * as ticketService from "../../../services/ticketService";
import type {
  RespuestaTicket,
  TicketConUsuario,
  TicketDetalleAdmin,
} from "../../../services/ticketService";

const ticket = (overrides: Partial<TicketConUsuario> = {}): TicketConUsuario => ({
  id: 55,
  id_usuario: 10,
  nombre: "Marta",
  apellido: "Ruiz",
  email: "marta@zentinel.test",
  tipo: "reclamo",
  asunto: "Cobro duplicado",
  descripcion: "Me cobraron dos veces el plan",
  estado: "abierto",
  fecha_creacion: "2026-02-11T12:00:00Z",
  fecha_actualizacion: "2026-02-11T12:00:00Z",
  fecha_resolucion: null,
  ...overrides,
});

const respuesta = (overrides: Partial<RespuestaTicket> = {}): RespuestaTicket => ({
  id: 3,
  id_ticket: 55,
  id_usuario: 2,
  es_admin: true,
  mensaje: "Ya lo estamos revisando",
  fecha_creacion: "2026-02-12T09:00:00Z",
  nombre: "Sofía",
  apellido: "Admin",
  avatar: null,
  ...overrides,
});

const detalle = (overrides: Partial<TicketDetalleAdmin> = {}): TicketDetalleAdmin => ({
  ticket: ticket(),
  respuestas: [],
  ...overrides,
});

const render = (props: Partial<React.ComponentProps<typeof AdminTicketDetail>> = {}) => {
  const onClose = vi.fn();
  const onUpdated = vi.fn();
  renderWithProviders(
    <AdminTicketDetail
      ticketId={55}
      token="token-de-prueba"
      onClose={onClose}
      onUpdated={onUpdated}
      {...props}
    />,
  );
  return { onClose, onUpdated };
};

describe("AdminTicketDetail", () => {
  it("muestra la cabecera con los datos del usuario y el mensaje original", async () => {
    vi.spyOn(ticketService, "getTicketDetalleAdmin").mockResolvedValue(detalle());

    render();

    expect(await screen.findByText("Cobro duplicado")).toBeInTheDocument();
    expect(screen.getByText("#55 · Reclamo")).toBeInTheDocument();
    expect(screen.getByText("Marta Ruiz · marta@zentinel.test")).toBeInTheDocument();
    expect(screen.getByText("Me cobraron dos veces el plan")).toBeInTheDocument();
    expect(screen.getByText(/sin respuestas aún/i)).toBeInTheDocument();
  });

  it("informa si el ticket no se puede cargar", async () => {
    vi.spyOn(ticketService, "getTicketDetalleAdmin").mockRejectedValue(
      new Error("Ticket inexistente"),
    );

    render();

    expect(await screen.findByText("Ticket inexistente")).toBeInTheDocument();
  });

  it("responde al usuario y pasa el ticket a en progreso", async () => {
    vi.spyOn(ticketService, "getTicketDetalleAdmin").mockResolvedValue(detalle());
    const responder = vi
      .spyOn(ticketService, "responderTicketAdmin")
      .mockResolvedValue({ respuesta: respuesta({ mensaje: "Te devolvemos el cobro" }) });

    const { onUpdated } = render();
    const caja = await screen.findByPlaceholderText(/responder al usuario/i);
    await userEvent.type(caja, "Te devolvemos el cobro");
    await userEvent.click(screen.getByRole("button", { name: "Responder" }));

    await waitFor(() =>
      expect(responder).toHaveBeenCalledWith("token-de-prueba", 55, "Te devolvemos el cobro"),
    );
    expect(await screen.findByText("Te devolvemos el cobro")).toBeInTheDocument();
    expect(onUpdated).toHaveBeenCalledWith(55, "en_progreso");
    expect(caja).toHaveValue("");
  });

  it("muestra el error cuando falla el envío de la respuesta", async () => {
    vi.spyOn(ticketService, "getTicketDetalleAdmin").mockResolvedValue(detalle());
    vi.spyOn(ticketService, "responderTicketAdmin").mockRejectedValue(new Error("Sin conexión"));

    render();
    await userEvent.type(
      await screen.findByPlaceholderText(/responder al usuario/i),
      "Hola",
    );
    await userEvent.click(screen.getByRole("button", { name: "Responder" }));

    expect(await screen.findByText("Sin conexión")).toBeInTheDocument();
  });

  it("cambia a en progreso sin pedir motivo", async () => {
    vi.spyOn(ticketService, "getTicketDetalleAdmin").mockResolvedValue(detalle());
    const cambiar = vi
      .spyOn(ticketService, "cambiarEstadoTicket")
      .mockResolvedValue({ ticket: ticket({ estado: "en_progreso" }) });

    const { onUpdated } = render();
    await screen.findByText("Cobro duplicado");
    await userEvent.click(screen.getByRole("button", { name: "En Progreso" }));

    await waitFor(() =>
      expect(cambiar).toHaveBeenCalledWith("token-de-prueba", 55, "en_progreso", undefined),
    );
    expect(onUpdated).toHaveBeenCalledWith(55, "en_progreso");
  });

  it("exige motivo para resolver el ticket y permite cancelar", async () => {
    vi.spyOn(ticketService, "getTicketDetalleAdmin").mockResolvedValue(detalle());
    const cambiar = vi
      .spyOn(ticketService, "cambiarEstadoTicket")
      .mockResolvedValue({ ticket: ticket({ estado: "resuelto" }) });

    render();
    await screen.findByText("Cobro duplicado");
    await userEvent.click(screen.getByRole("button", { name: "Resuelto" }));

    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("button", { name: "Confirmar" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Resuelto" }));
    await userEvent.type(screen.getByPlaceholderText(/describí el motivo/i), "Reintegro hecho");
    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() =>
      expect(cambiar).toHaveBeenCalledWith("token-de-prueba", 55, "resuelto", "Reintegro hecho"),
    );
  });

  it("muestra el error al cambiar de estado", async () => {
    vi.spyOn(ticketService, "getTicketDetalleAdmin").mockResolvedValue(detalle());
    vi.spyOn(ticketService, "cambiarEstadoTicket").mockRejectedValue(new Error("Estado inválido"));

    render();
    await screen.findByText("Cobro duplicado");
    await userEvent.click(screen.getByRole("button", { name: "En Progreso" }));

    expect(await screen.findByText("Estado inválido")).toBeInTheDocument();
  });

  it("oculta la respuesta cuando el ticket está cerrado", async () => {
    vi.spyOn(ticketService, "getTicketDetalleAdmin").mockResolvedValue(
      detalle({ ticket: ticket({ estado: "cerrado" }), respuestas: [respuesta()] }),
    );

    render();

    expect(await screen.findByText("Ya lo estamos revisando")).toBeInTheDocument();
    expect(screen.getByText(/Soporte · Sofía/)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/responder al usuario/i)).not.toBeInTheDocument();
  });

  it("oculta las acciones a quien no puede editar", async () => {
    vi.spyOn(ticketService, "getTicketDetalleAdmin").mockResolvedValue(detalle());

    render({ canEdit: false });

    await screen.findByText("Cobro duplicado");
    expect(screen.queryByPlaceholderText(/responder al usuario/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "En Progreso" })).not.toBeInTheDocument();
  });

  it("cierra con Escape y con el fondo", async () => {
    vi.spyOn(ticketService, "getTicketDetalleAdmin").mockResolvedValue(detalle());
    const { onClose } = render();
    await screen.findByText("Cobro duplicado");

    await userEvent.keyboard("{Escape}");
    await userEvent.click(document.querySelector('[aria-hidden="true"]') as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
