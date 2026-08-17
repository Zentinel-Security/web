import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AuditoriaTab from "./AuditoriaTab";
import { renderWithProviders } from "../../../test/helpers";
import * as gestionService from "../../../services/gestionService";
import type { AuditLogEntry, AuditLogResult } from "../../../services/gestionService";

const entrada = (overrides: Partial<AuditLogEntry> = {}): AuditLogEntry => ({
  id: 1,
  tipo_evento: "suspender_cuenta",
  motivo: "Uso indebido",
  datos_anteriores: { estado_cuenta: "activa", activo: true, id_rol: 3 },
  datos_nuevos: { estado_cuenta: "suspendida", activo: false, id_rol: 3 },
  created_at: "2026-02-10T12:00:00Z",
  actor_id: 2,
  actor_nombre: "Sofía Admin",
  actor_email: "sofia@zentinel.test",
  objetivo_usuario_id: 10,
  objetivo_usuario_nombre: "Marta Ruiz",
  objetivo_usuario_email: "marta@zentinel.test",
  objetivo_plan_id: null,
  objetivo_plan_nombre: null,
  objetivo_ticket_id: null,
  objetivo_ticket_asunto: null,
  ...overrides,
});

const resultado = (overrides: Partial<AuditLogResult> = {}): AuditLogResult => ({
  data: [entrada()],
  total: 1,
  page: 1,
  limit: 15,
  totalPages: 1,
  ...overrides,
});

const staffList = [
  { id: 2, nombre: "Sofía", apellido: "Admin" },
  { id: 3, nombre: "Luis", apellido: "Soporte" },
];

const render = (isAdmin = true) =>
  renderWithProviders(
    <AuditoriaTab token="token-de-prueba" isAdmin={isAdmin} staffList={staffList} />,
  );

describe("AuditoriaTab", () => {
  it("lista los eventos con actor, objetivo y motivo", async () => {
    vi.spyOn(gestionService, "getAuditLog").mockResolvedValue(resultado());

    render();

    expect(await screen.findByText("1 evento encontrado")).toBeInTheDocument();
    expect(screen.getAllByText("Suspensión de cuenta").length).toBeGreaterThan(0);
    expect(screen.getByText("Sofía Admin")).toBeInTheDocument();
    expect(screen.getByText("Marta Ruiz (marta@zentinel.test)")).toBeInTheDocument();
    expect(screen.getByText("Uso indebido")).toBeInTheDocument();
  });

  it("oculta la columna de actor cuando no es admin", async () => {
    vi.spyOn(gestionService, "getAuditLog").mockResolvedValue(resultado());

    render(false);

    await screen.findByText("1 evento encontrado");
    expect(screen.queryByText("Sofía Admin")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/buscar por nombre/i)).not.toBeInTheDocument();
  });

  it("avisa cuando no hay eventos", async () => {
    vi.spyOn(gestionService, "getAuditLog").mockResolvedValue(
      resultado({ data: [], total: 0, totalPages: 0 }),
    );

    render();

    expect(await screen.findByText(/no hay eventos registrados/i)).toBeInTheDocument();
    expect(screen.getByText("0 eventos encontrados")).toBeInTheDocument();
  });

  it("muestra el error del backend", async () => {
    vi.spyOn(gestionService, "getAuditLog").mockRejectedValue(new Error("Sin permisos"));

    render();

    expect(await screen.findByText("Sin permisos")).toBeInTheDocument();
  });

  it("aplica los filtros de tipo y fechas", async () => {
    const spy = vi.spyOn(gestionService, "getAuditLog").mockResolvedValue(resultado());

    const { container } = render();
    await screen.findByText("1 evento encontrado");

    await userEvent.selectOptions(
      screen.getByRole("combobox"),
      "cambio_rol",
    );
    const fechas = container.querySelectorAll('input[type="date"]');
    await userEvent.type(fechas[0] as HTMLInputElement, "2026-02-01");
    await userEvent.type(fechas[1] as HTMLInputElement, "2026-02-28");
    await userEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    await waitFor(() =>
      expect(spy).toHaveBeenLastCalledWith("token-de-prueba", {
        tipo_evento: "cambio_rol",
        id_actor: undefined,
        fecha_desde: "2026-02-01",
        fecha_hasta: "2026-02-28T23:59:59",
        page: 1,
        limit: 15,
      }),
    );
  });

  it("filtra por actor desde el autocompletado y limpia los filtros", async () => {
    const spy = vi.spyOn(gestionService, "getAuditLog").mockResolvedValue(resultado());

    render();
    await screen.findByText("1 evento encontrado");

    const buscador = screen.getByPlaceholderText(/buscar por nombre/i);
    await userEvent.click(buscador);
    await userEvent.type(buscador, "luis");
    await userEvent.click(screen.getByRole("button", { name: "Luis Soporte" }));
    await userEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    await waitFor(() =>
      expect(spy).toHaveBeenLastCalledWith(
        "token-de-prueba",
        expect.objectContaining({ id_actor: 3 }),
      ),
    );

    await userEvent.click(screen.getByRole("button", { name: "Limpiar" }));

    await waitFor(() =>
      expect(spy).toHaveBeenLastCalledWith(
        "token-de-prueba",
        expect.objectContaining({ id_actor: undefined, tipo_evento: undefined }),
      ),
    );
    expect(buscador).toHaveValue("");
  });

  it("navega entre páginas", async () => {
    const spy = vi
      .spyOn(gestionService, "getAuditLog")
      .mockResolvedValue(resultado({ total: 30, totalPages: 2 }));

    render();
    await screen.findByText("30 eventos encontrados");

    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    await waitFor(() =>
      expect(spy).toHaveBeenLastCalledWith(
        "token-de-prueba",
        expect.objectContaining({ page: 2 }),
      ),
    );
  });

  it("abre el detalle con el diff de los campos que cambiaron", async () => {
    vi.spyOn(gestionService, "getAuditLog").mockResolvedValue(resultado());

    render();
    await userEvent.click(await screen.findByRole("button", { name: /ver/i }));

    expect(screen.getByText("Cambios realizados")).toBeInTheDocument();
    expect(screen.getByText("Estado de cuenta")).toBeInTheDocument();
    expect(screen.getByText("Activa")).toBeInTheDocument();
    expect(screen.getByText("Suspendida")).toBeInTheDocument();
    // id_rol no cambió, así que no aparece en el diff.
    expect(screen.queryByText("Rol")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(screen.queryByText("Cambios realizados")).not.toBeInTheDocument();
  });

  it("muestra los valores registrados cuando no hay datos anteriores", async () => {
    vi.spyOn(gestionService, "getAuditLog").mockResolvedValue(
      resultado({
        data: [
          entrada({
            tipo_evento: "crear_plan",
            motivo: null,
            datos_anteriores: null,
            datos_nuevos: { nombre: "familiar", precio: 2500, limits: { zonas: -1, sos: true } },
            objetivo_usuario_nombre: null,
            objetivo_usuario_email: null,
            objetivo_plan_nombre: "familiar",
          }),
        ],
      }),
    );

    render();
    expect(screen.queryByText("Uso indebido")).not.toBeInTheDocument();
    await userEvent.click(await screen.findByRole("button", { name: /ver/i }));

    const modal = screen.getByText("Información registrada").parentElement as HTMLElement;
    expect(within(modal).getByText("Zonas")).toBeInTheDocument();
    expect(within(modal).getByText("Ilimitado")).toBeInTheDocument();
    expect(within(modal).getByText("Sí")).toBeInTheDocument();
    expect(within(modal).getByText("$2.500,00")).toBeInTheDocument();
    expect(screen.getAllByText("Plan: familiar").length).toBe(2);
  });

  it("indica cuando el evento no tiene diferencias", async () => {
    vi.spyOn(gestionService, "getAuditLog").mockResolvedValue(
      resultado({
        data: [
          entrada({
            tipo_evento: "respuesta_ticket",
            datos_anteriores: { estado: "abierto" },
            datos_nuevos: { estado: "abierto" },
            objetivo_usuario_nombre: null,
            objetivo_ticket_asunto: "Cobro duplicado",
          }),
        ],
      }),
    );

    render();
    await userEvent.click(await screen.findByRole("button", { name: /ver/i }));

    expect(screen.getByText(/sin diferencias registradas/i)).toBeInTheDocument();
    expect(screen.getAllByText("Ticket #Cobro duplicado").length).toBe(2);
  });
});
