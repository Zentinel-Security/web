import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Soporte from "./Soporte";
import { renderWithProviders, seedSession } from "../../test/helpers";
import * as ticketService from "../../services/ticketService";
import type { Ticket, TicketDetalle } from "../../services/ticketService";

const ticket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 1,
  id_usuario: 1,
  tipo: "consulta",
  asunto: "No puedo activar el SOS",
  descripcion: "El botón no responde",
  estado: "abierto",
  fecha_creacion: "2026-02-01T12:00:00Z",
  fecha_actualizacion: "2026-02-01T12:00:00Z",
  fecha_resolucion: null,
  ...overrides,
});

const detalle = (overrides: Partial<TicketDetalle> = {}): TicketDetalle => ({
  ticket: ticket(),
  respuestas: [],
  ...overrides,
});

describe("Soporte", () => {
  beforeEach(() => {
    vi.spyOn(ticketService, "getMisTickets").mockResolvedValue([]);
  });

  it("invita a iniciar sesión a un visitante", async () => {
    renderWithProviders(<Soporte />);

    await userEvent.click(
      screen.getByRole("button", { name: /iniciar sesión para abrir un ticket/i }),
    );

    expect(
      await screen.findByRole("heading", { name: /iniciar sesión para continuar/i }),
    ).toBeInTheDocument();
    expect(ticketService.getMisTickets).not.toHaveBeenCalled();
  });

  it("muestra el estado vacío cuando el usuario no tiene tickets", async () => {
    seedSession();
    renderWithProviders(<Soporte />);

    expect(await screen.findByText(/no tenés tickets aún/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /abrir tu primer ticket/i }));
    expect(screen.getByRole("heading", { name: /nuevo ticket/i })).toBeInTheDocument();
  });

  it("informa si la carga de tickets falla", async () => {
    seedSession();
    vi.mocked(ticketService.getMisTickets).mockRejectedValue(new Error("Backend caído"));

    renderWithProviders(<Soporte />);

    expect(await screen.findByText("Backend caído")).toBeInTheDocument();
  });

  it("lista los tickets y permite filtrarlos por estado", async () => {
    seedSession();
    vi.mocked(ticketService.getMisTickets).mockResolvedValue([
      ticket(),
      ticket({ id: 2, asunto: "Error de facturación", tipo: "facturacion", estado: "resuelto" }),
    ]);

    renderWithProviders(<Soporte />);

    expect(await screen.findByText("2 tickets")).toBeInTheDocument();
    expect(screen.getByText("No puedo activar el SOS")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Resuelto" }));
    expect(screen.queryByText("No puedo activar el SOS")).not.toBeInTheDocument();
    expect(screen.getByText("Error de facturación")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Todos" }));
    expect(screen.getByText("No puedo activar el SOS")).toBeInTheDocument();
  });

  it("crea un ticket y lo agrega al listado", async () => {
    seedSession();
    const crear = vi
      .spyOn(ticketService, "createTicket")
      .mockResolvedValue({ ticket: ticket({ id: 9, asunto: "Consulta nueva" }) });

    renderWithProviders(<Soporte />);
    await userEvent.click(await screen.findByRole("button", { name: /\+ nuevo ticket/i }));
    await userEvent.type(screen.getByLabelText(/asunto/i), "Consulta nueva");
    await userEvent.type(screen.getByLabelText(/descripción/i), "Necesito ayuda con la app");
    await userEvent.click(screen.getByRole("button", { name: /enviar ticket/i }));

    await waitFor(() =>
      expect(crear).toHaveBeenCalledWith("token-de-prueba", {
        tipo: "consulta",
        asunto: "Consulta nueva",
        descripcion: "Necesito ayuda con la app",
      }),
    );
    expect(await screen.findByText(/ticket creado correctamente/i)).toBeInTheDocument();
    expect(screen.getByText("1 ticket")).toBeInTheDocument();
  });

  it("abre el detalle del ticket seleccionado", async () => {
    seedSession();
    vi.mocked(ticketService.getMisTickets).mockResolvedValue([ticket()]);
    vi.spyOn(ticketService, "getTicketDetalle").mockResolvedValue(detalle());

    renderWithProviders(<Soporte />);
    await userEvent.click(await screen.findByText("No puedo activar el SOS"));

    expect(await screen.findByText("El botón no responde")).toBeInTheDocument();
    expect(ticketService.getTicketDetalle).toHaveBeenCalledWith("token-de-prueba", 1);
  });

  it("cierra el detalle al presionar Escape", async () => {
    seedSession();
    vi.mocked(ticketService.getMisTickets).mockResolvedValue([ticket()]);
    vi.spyOn(ticketService, "getTicketDetalle").mockResolvedValue(detalle());

    renderWithProviders(<Soporte />);
    await userEvent.click(await screen.findByText("No puedo activar el SOS"));
    await screen.findByText("El botón no responde");

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByText("El botón no responde")).not.toBeInTheDocument();
  });

  it("permite cancelar el formulario de nuevo ticket", async () => {
    seedSession();
    renderWithProviders(<Soporte />);

    await userEvent.click(await screen.findByRole("button", { name: /abrir tu primer ticket/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(screen.queryByRole("heading", { name: /nuevo ticket/i })).not.toBeInTheDocument();
  });
});
