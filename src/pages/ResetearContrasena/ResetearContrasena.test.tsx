import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResetearContrasena from "./ResetearContrasena";
import * as authService from "../../services/authService";

const renderCon = (query: string) =>
  render(
    <MemoryRouter initialEntries={[`/resetear-contrasena${query}`]}>
      <Routes>
        <Route path="/resetear-contrasena" element={<ResetearContrasena />} />
        <Route path="/" element={<p>inicio</p>} />
      </Routes>
    </MemoryRouter>,
  );

const completar = async (password: string, confirmacion: string) => {
  await userEvent.type(screen.getByLabelText(/nueva contraseña/i), password);
  await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), confirmacion);
  await userEvent.click(screen.getByRole("button", { name: /restablecer contraseña/i }));
};

describe("ResetearContrasena", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra enlace inválido si la URL no trae token", () => {
    renderCon("");
    expect(screen.getByText("Enlace inválido")).toBeInTheDocument();
    expect(screen.getByText("El enlace no contiene un token válido.")).toBeInTheDocument();
  });

  it("exige al menos 8 caracteres sin llamar al backend", async () => {
    const reset = vi.spyOn(authService, "resetearContrasenaRequest");
    renderCon("?token=abc");

    await completar("corta", "corta");

    expect(screen.getByText("La contraseña debe tener al menos 8 caracteres.")).toBeInTheDocument();
    expect(reset).not.toHaveBeenCalled();
  });

  it("exige que ambas contraseñas coincidan", async () => {
    const reset = vi.spyOn(authService, "resetearContrasenaRequest");
    renderCon("?token=abc");

    await completar("ClaveSegura1", "ClaveSegura2");

    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
    expect(reset).not.toHaveBeenCalled();
  });

  it("restablece la contraseña con el token de la URL", async () => {
    const reset = vi
      .spyOn(authService, "resetearContrasenaRequest")
      .mockResolvedValue(undefined as never);

    renderCon("?token=abc");
    await completar("ClaveSegura1", "ClaveSegura1");

    expect(reset).toHaveBeenCalledWith("abc", "ClaveSegura1");
    expect(await screen.findByText("¡Contraseña actualizada!")).toBeInTheDocument();
  });

  it("deja reintentar en el formulario si la contraseña es la misma de antes", async () => {
    vi.spyOn(authService, "resetearContrasenaRequest").mockRejectedValue(
      Object.assign(new Error("No puede ser igual a la anterior"), { code: "SAME_PASSWORD" }),
    );

    renderCon("?token=abc");
    await completar("ClaveSegura1", "ClaveSegura1");

    expect(await screen.findByText("No puede ser igual a la anterior")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /restablecer contraseña/i })).toBeInTheDocument();
  });

  it("cae a la pantalla de error ante un token vencido", async () => {
    vi.spyOn(authService, "resetearContrasenaRequest").mockRejectedValue(
      new Error("Token expirado"),
    );

    renderCon("?token=abc");
    await completar("ClaveSegura1", "ClaveSegura1");

    expect(await screen.findByText("Enlace inválido")).toBeInTheDocument();
    expect(screen.getByText("Token expirado")).toBeInTheDocument();
  });

  it("usa un mensaje genérico si el error no trae texto", async () => {
    vi.spyOn(authService, "resetearContrasenaRequest").mockRejectedValue({});

    renderCon("?token=abc");
    await completar("ClaveSegura1", "ClaveSegura1");

    expect(await screen.findByText("No se pudo restablecer la contraseña.")).toBeInTheDocument();
  });
});
