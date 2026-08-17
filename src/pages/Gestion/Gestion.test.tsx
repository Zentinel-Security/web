import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Gestion from "./Gestion";
import { renderWithProviders, seedSession } from "../../test/helpers";
import * as gestionService from "../../services/gestionService";
import * as ticketService from "../../services/ticketService";
import type {
  ReporteDispositivoAdmin,
  UsuarioAdmin,
} from "../../services/gestionService";
import type { TicketConUsuario } from "../../services/ticketService";

const usuario = (overrides: Partial<UsuarioAdmin> = {}): UsuarioAdmin => ({
  id: 10,
  nombre: "Marta",
  apellido: "Ruiz",
  email: "marta@zentinel.test",
  avatar: null,
  activo: true,
  estado_cuenta: "activa",
  id_rol: 3,
  rol_descripcion: "usuario",
  ...overrides,
});

const reporte = (
  overrides: Partial<ReporteDispositivoAdmin> = {},
): ReporteDispositivoAdmin => ({
  id: 3,
  id_usuario: 10,
  nombre: "Marta",
  apellido: "Ruiz",
  email: "marta@zentinel.test",
  tipo_reporte: "Robado",
  descripcion: null,
  estado_reporte: "creado",
  incluye_ubicacion: false,
  fecha_creacion: "2026-02-10T12:00:00Z",
  ...overrides,
});

const ticket = (overrides: Partial<TicketConUsuario> = {}): TicketConUsuario => ({
  id: 55,
  id_usuario: 10,
  nombre: "Marta",
  apellido: "Ruiz",
  email: "marta@zentinel.test",
  tipo: "consulta",
  asunto: "Consulta sobre el plan",
  descripcion: "Quiero cambiar de plan",
  estado: "abierto",
  fecha_creacion: "2026-02-11T12:00:00Z",
  fecha_actualizacion: "2026-02-11T12:00:00Z",
  fecha_resolucion: null,
  ...overrides,
});

const mockData = ({
  usuarios = [usuario()],
  reportes = [reporte()],
  tickets = [ticket()],
}: {
  usuarios?: UsuarioAdmin[];
  reportes?: ReporteDispositivoAdmin[];
  tickets?: TicketConUsuario[];
} = {}) => {
  vi.spyOn(gestionService, "getUsuariosAdmin").mockResolvedValue(usuarios);
  vi.spyOn(gestionService, "getReportesAdmin").mockResolvedValue(reportes);
  vi.spyOn(ticketService, "getAllTicketsAdmin").mockResolvedValue(tickets);
};

const abrirUsuario = async (nombre: RegExp | string) => {
  await userEvent.click(await screen.findByText(nombre));
};

describe("Gestion", () => {
  beforeEach(() => {
    seedSession({ id_rol: 2 });
  });

  it("muestra las estadísticas y la tabla de usuarios", async () => {
    mockData({ usuarios: [usuario(), usuario({ id: 11, nombre: "Juan", activo: false })] });

    renderWithProviders(<Gestion />);

    expect(await screen.findByText("2 registros")).toBeInTheDocument();
    expect(screen.getAllByText("marta@zentinel.test").length).toBeGreaterThan(0);
    const suspendidos = screen.getByText("Suspendidos").closest("div") as HTMLElement;
    expect(within(suspendidos).getByText("1")).toBeInTheDocument();
  });

  it("filtra usuarios por nombre, por email y por estado", async () => {
    mockData({
      usuarios: [
        usuario(),
        usuario({ id: 11, nombre: "Juan", apellido: "Díaz", email: "juan@otro.test", activo: false }),
      ],
    });

    renderWithProviders(<Gestion />);
    await screen.findByText("2 registros");

    await userEvent.type(screen.getByPlaceholderText(/buscar por nombre/i), "juan");
    expect(screen.getByText("1 registros")).toBeInTheDocument();
    expect(screen.queryByText("marta@zentinel.test")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Email" }));
    await userEvent.clear(screen.getByPlaceholderText(/buscar por email/i));
    await userEvent.type(screen.getByPlaceholderText(/buscar por email/i), "marta@");
    expect(screen.getByText("marta@zentinel.test")).toBeInTheDocument();

    await userEvent.clear(screen.getByPlaceholderText(/buscar por email/i));
    await userEvent.selectOptions(screen.getByRole("combobox"), "suspendida");
    expect(screen.getByText("juan@otro.test")).toBeInTheDocument();
    expect(screen.queryByText("marta@zentinel.test")).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByRole("combobox"), "activa");
    await userEvent.type(screen.getByPlaceholderText(/buscar por email/i), "inexistente");
    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument();
  });

  it("pagina la lista cuando hay más de diez usuarios", async () => {
    mockData({
      usuarios: Array.from({ length: 12 }, (_, i) =>
        usuario({ id: i + 1, nombre: `User${i + 1}`, email: `user${i + 1}@zentinel.test` }),
      ),
    });

    renderWithProviders(<Gestion />);
    await screen.findByText("12 registros");

    expect(screen.queryByText("user11@zentinel.test")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByText("user11@zentinel.test")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
  });

  it("exporta los usuarios a CSV", async () => {
    mockData();
    const url = "blob:usuarios";
    const createObjectURL = vi.fn(() => url);
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    renderWithProviders(<Gestion />);
    await userEvent.click(await screen.findByRole("button", { name: /exportar csv/i }));

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith(url);
  });

  it("informa los errores de carga de cada sección", async () => {
    vi.spyOn(gestionService, "getUsuariosAdmin").mockRejectedValue(new Error("Sin permisos"));
    vi.spyOn(gestionService, "getReportesAdmin").mockRejectedValue(new Error("Reportes caídos"));
    vi.spyOn(ticketService, "getAllTicketsAdmin").mockRejectedValue(new Error("Tickets caídos"));

    renderWithProviders(<Gestion />);

    expect(await screen.findByText("Sin permisos")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /extravíos/i }));
    expect(screen.getByText("Reportes caídos")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /tickets de soporte/i }));
    expect(screen.getByText("Tickets caídos")).toBeInTheDocument();
  });

  it("suspende una cuenta pidiendo el motivo", async () => {
    mockData();
    const suspender = vi.spyOn(gestionService, "suspenderUsuario").mockResolvedValue();

    renderWithProviders(<Gestion />);
    await abrirUsuario("Marta Ruiz");

    await userEvent.click(screen.getByRole("button", { name: /suspender/i }));
    const confirmar = screen.getByRole("button", { name: /sí, suspender/i });
    expect(confirmar).toBeDisabled();

    await userEvent.type(
      screen.getByPlaceholderText(/motivo de la suspensión/i),
      "Uso indebido",
    );
    await userEvent.click(confirmar);

    await waitFor(() =>
      expect(suspender).toHaveBeenCalledWith("token-de-prueba", 10, "Uso indebido"),
    );
    expect(await screen.findByText(/fue suspendida/i)).toBeInTheDocument();
  });

  it("muestra el error del backend al suspender", async () => {
    mockData();
    vi.spyOn(gestionService, "suspenderUsuario").mockRejectedValue(new Error("No autorizado"));

    renderWithProviders(<Gestion />);
    await abrirUsuario("Marta Ruiz");
    await userEvent.click(screen.getByRole("button", { name: /suspender/i }));
    await userEvent.type(screen.getByPlaceholderText(/motivo de la suspensión/i), "Prueba");
    await userEvent.click(screen.getByRole("button", { name: /sí, suspender/i }));

    expect(await screen.findByText("No autorizado")).toBeInTheDocument();
  });

  it("reactiva una cuenta suspendida", async () => {
    mockData({ usuarios: [usuario({ activo: false, estado_cuenta: "suspendida" })] });
    const reactivar = vi.spyOn(gestionService, "reactivarUsuario").mockResolvedValue();

    renderWithProviders(<Gestion />);
    await abrirUsuario("Marta Ruiz");

    const boton = screen.getByRole("button", { name: /reactivar/i });
    expect(boton).toBeDisabled();
    await userEvent.type(
      screen.getByPlaceholderText(/motivo de la reactivación/i),
      "Caso resuelto",
    );
    await userEvent.click(boton);

    await waitFor(() =>
      expect(reactivar).toHaveBeenCalledWith("token-de-prueba", 10, "Caso resuelto"),
    );
    expect(await screen.findByText(/fue reactivada/i)).toBeInTheDocument();
  });

  it("cambia el rol de un usuario desde el modal", async () => {
    mockData();
    const cambiar = vi
      .spyOn(gestionService, "cambiarRolUsuario")
      .mockResolvedValue(usuario({ id_rol: 5, rol_descripcion: "soporte" }));

    renderWithProviders(<Gestion />);
    await abrirUsuario("Marta Ruiz");

    await userEvent.click(screen.getByRole("button", { name: "Soporte" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => expect(cambiar).toHaveBeenCalledWith("token-de-prueba", 10, 5));
    expect(await screen.findByText(/actualizado a soporte/i)).toBeInTheDocument();
  });

  it("cierra el modal de usuario", async () => {
    mockData();

    renderWithProviders(<Gestion />);
    await abrirUsuario("Marta Ruiz");
    const cerrar = screen.getAllByRole("button", { name: "Cerrar" });
    expect(cerrar.length).toBeGreaterThan(0);

    await userEvent.click(cerrar[cerrar.length - 1]);

    expect(screen.queryByRole("button", { name: "Cerrar" })).not.toBeInTheDocument();
  });

  it("lista los extravíos con su estado", async () => {
    mockData({
      reportes: [reporte(), reporte({ id: 4, estado_reporte: "finalizado", tipo_reporte: "Perdido" })],
    });

    renderWithProviders(<Gestion />);
    await userEvent.click(await screen.findByRole("button", { name: /extravíos/i }));

    expect(screen.getByText("Robado — Marta Ruiz")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.getByText("Finalizado")).toBeInTheDocument();
  });

  it("filtra los tickets de soporte por estado y tipo", async () => {
    mockData();

    renderWithProviders(<Gestion />);
    await userEvent.click(await screen.findByRole("button", { name: /tickets de soporte/i }));

    const [estado, tipo] = screen.getAllByRole("combobox");
    await userEvent.selectOptions(estado, "resuelto");
    await userEvent.selectOptions(tipo, "reclamo");
    await userEvent.click(screen.getByRole("button", { name: "Filtrar" }));

    await waitFor(() =>
      expect(ticketService.getAllTicketsAdmin).toHaveBeenLastCalledWith("token-de-prueba", {
        estado: "resuelto",
        tipo: "reclamo",
      }),
    );
  });

  it("abre el detalle de un ticket desde la tabla", async () => {
    mockData();
    vi.spyOn(ticketService, "getTicketDetalleAdmin").mockResolvedValue({
      ticket: ticket(),
      respuestas: [],
    });

    renderWithProviders(<Gestion />);
    await userEvent.click(await screen.findByRole("button", { name: /tickets de soporte/i }));
    await userEvent.click(screen.getByText("Consulta sobre el plan"));

    await waitFor(() =>
      expect(ticketService.getTicketDetalleAdmin).toHaveBeenCalledWith("token-de-prueba", 55),
    );
  });

  it("avisa cuando no hay tickets ni reportes", async () => {
    mockData({ reportes: [], tickets: [] });

    renderWithProviders(<Gestion />);
    await userEvent.click(await screen.findByRole("button", { name: /extravíos/i }));
    expect(screen.getByText("Sin reportes.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /tickets de soporte/i }));
    expect(screen.getByText(/no hay tickets con los filtros seleccionados/i)).toBeInTheDocument();
  });

  it("oculta la pestaña de planes a quien no es admin", async () => {
    localStorage.clear();
    seedSession({ id_rol: 5 });
    mockData();

    renderWithProviders(<Gestion />);
    await screen.findByText("1 registros");

    expect(screen.queryByRole("button", { name: /planes/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /auditoría/i })).toBeInTheDocument();
  });
});
