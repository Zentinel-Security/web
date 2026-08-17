import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VerificarEmail from "./VerificarEmail";
import * as authService from "../../services/authService";

const renderCon = (query: string) =>
  render(
    <MemoryRouter initialEntries={[`/verificar-email${query}`]}>
      <Routes>
        <Route path="/verificar-email" element={<VerificarEmail />} />
        <Route path="/" element={<p>inicio</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe("VerificarEmail", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("marca enlace inválido si falta el token", async () => {
    const verificar = vi.spyOn(authService, "verificarEmailRequest");
    renderCon("");

    expect(await screen.findByText("Enlace inválido")).toBeInTheDocument();
    expect(verificar).not.toHaveBeenCalled();
  });

  it("verifica el token de la URL y muestra el éxito", async () => {
    const verificar = vi
      .spyOn(authService, "verificarEmailRequest")
      .mockResolvedValue(undefined as never);

    renderCon("?token=abc123");

    expect(screen.getByText(/verificando tu email/i)).toBeInTheDocument();
    expect(await screen.findByText("¡Email verificado!")).toBeInTheDocument();
    expect(verificar).toHaveBeenCalledWith("abc123");
    expect(screen.getByRole("link", { name: /ir al inicio/i })).toHaveAttribute("href", "/");
  });

  it("ofrece reenviar el correo cuando el token está vencido", async () => {
    vi.spyOn(authService, "verificarEmailRequest").mockRejectedValue(
      Object.assign(new Error("Token inválido"), { code: "INVALID_TOKEN" }),
    );
    const reenviar = vi
      .spyOn(authService, "reenviarVerificacionRequest")
      .mockResolvedValue(undefined as never);

    renderCon("?token=viejo");

    expect(await screen.findByText("Enlace expirado")).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText("tu@email.com"), "ana@zentinel.test");
    await userEvent.click(screen.getByRole("button", { name: /reenviar/i }));

    expect(reenviar).toHaveBeenCalledWith("ana@zentinel.test");
    expect(await screen.findByText(/correo reenviado/i)).toBeInTheDocument();
  });

  it("muestra el error si el reenvío falla", async () => {
    vi.spyOn(authService, "verificarEmailRequest").mockRejectedValue(
      Object.assign(new Error("Token inválido"), { code: "INVALID_TOKEN" }),
    );
    vi.spyOn(authService, "reenviarVerificacionRequest").mockRejectedValue(
      new Error("Demasiados intentos"),
    );

    renderCon("?token=viejo");
    await screen.findByText("Enlace expirado");

    await userEvent.type(screen.getByPlaceholderText("tu@email.com"), "ana@zentinel.test");
    await userEvent.click(screen.getByRole("button", { name: /reenviar/i }));

    expect(await screen.findByText("Demasiados intentos")).toBeInTheDocument();
  });

  it("trata cualquier otro error como enlace inválido", async () => {
    vi.spyOn(authService, "verificarEmailRequest").mockRejectedValue(new Error("Boom"));

    renderCon("?token=abc");

    expect(await screen.findByText("Enlace inválido")).toBeInTheDocument();
  });

  it("no repite la verificación en el doble render de StrictMode", async () => {
    const verificar = vi
      .spyOn(authService, "verificarEmailRequest")
      .mockResolvedValue(undefined as never);

    renderCon("?token=abc123");

    await waitFor(() => expect(verificar).toHaveBeenCalledTimes(1));
  });
});
