import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TicketForm from "./TicketForm";

const setup = (
  { onSubmit = vi.fn().mockResolvedValue(undefined), isSubmitting = false } = {},
) => {
  const onCancel = vi.fn();
  render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} isSubmitting={isSubmitting} />);
  return { onSubmit, onCancel };
};

const completar = async (asunto: string, descripcion: string) => {
  await userEvent.type(screen.getByLabelText(/asunto/i), asunto);
  await userEvent.type(screen.getByLabelText(/descripción/i), descripcion);
};

describe("TicketForm", () => {
  it("arranca con el tipo consulta y ofrece los cinco tipos", () => {
    setup();
    expect(screen.getByLabelText(/tipo de consulta/i)).toHaveValue("consulta");
    expect(screen.getAllByRole("option")).toHaveLength(5);
  });

  it("envía tipo, asunto y descripción recortados", async () => {
    const { onSubmit } = setup();

    await userEvent.selectOptions(screen.getByLabelText(/tipo de consulta/i), "facturacion");
    await completar("  Cobro doble  ", "  Me cobraron dos veces  ");
    await userEvent.click(screen.getByRole("button", { name: /enviar ticket/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      tipo: "facturacion",
      asunto: "Cobro doble",
      descripcion: "Me cobraron dos veces",
    });
  });

  it("muestra el error devuelto por el envío", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Backend caído"));
    setup({ onSubmit });

    await completar("Asunto", "Descripción");
    await userEvent.click(screen.getByRole("button", { name: /enviar ticket/i }));

    expect(await screen.findByText("Backend caído")).toBeInTheDocument();
  });

  it("usa un mensaje genérico si el rechazo no es un Error", async () => {
    const onSubmit = vi.fn().mockRejectedValue("boom");
    setup({ onSubmit });

    await completar("Asunto", "Descripción");
    await userEvent.click(screen.getByRole("button", { name: /enviar ticket/i }));

    expect(await screen.findByText("No se pudo crear el ticket.")).toBeInTheDocument();
  });

  it("limpia el error anterior al reintentar", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error("Backend caído"))
      .mockResolvedValueOnce(undefined);
    setup({ onSubmit });

    await completar("Asunto", "Descripción");
    await userEvent.click(screen.getByRole("button", { name: /enviar ticket/i }));
    expect(await screen.findByText("Backend caído")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /enviar ticket/i }));
    expect(screen.queryByText("Backend caído")).not.toBeInTheDocument();
  });

  it("bloquea el botón mientras envía", () => {
    setup({ isSubmitting: true });
    expect(screen.getByRole("button", { name: /enviando/i })).toBeDisabled();
  });

  it("cancela sin enviar", async () => {
    const { onCancel, onSubmit } = setup();
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
