import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Perfil from "./Perfil";
import { renderWithProviders, seedSession } from "../../test/helpers";
import * as profileService from "../../services/profileService";

const archivo = () => new File(["binario"], "foto.png", { type: "image/png" });

describe("Perfil", () => {
  beforeEach(() => {
    if (!URL.createObjectURL) {
      URL.createObjectURL = () => "blob:preview";
    }
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");
  });

  it("muestra los datos del usuario, su rol y su estado", () => {
    seedSession({ id_rol: 4, estado_cuenta: "activa" });
    renderWithProviders(<Perfil />);

    expect(screen.getByRole("heading", { name: /mi perfil/i })).toBeInTheDocument();
    expect(screen.getByText("AP")).toBeInTheDocument();
    expect(screen.getByText("Manager")).toBeInTheDocument();
    expect(screen.getByText("Activa")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ana@zentinel.test")).toBeDisabled();
  });

  it("marca la cuenta suspendida y el rol desconocido como usuario", () => {
    seedSession({ id_rol: 99, estado_cuenta: "suspendida" });
    renderWithProviders(<Perfil />);

    expect(screen.getByText("Suspendida")).toBeInTheDocument();
    expect(screen.getByText("Usuario")).toBeInTheDocument();
  });

  it("deshabilita guardar hasta que haya cambios", async () => {
    seedSession();
    renderWithProviders(<Perfil />);

    const guardar = screen.getByRole("button", { name: /guardar cambios/i });
    expect(guardar).toBeDisabled();

    await userEvent.type(screen.getByPlaceholderText("Tu nombre"), "s");
    expect(guardar).toBeEnabled();
  });

  it("valida que nombre y apellido no queden vacíos", async () => {
    seedSession();
    const actualizar = vi.spyOn(profileService, "updateProfile");
    renderWithProviders(<Perfil />);

    await userEvent.clear(screen.getByPlaceholderText("Tu nombre"));
    await userEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    expect(await screen.findByText(/obligatorios/i)).toBeInTheDocument();
    expect(actualizar).not.toHaveBeenCalled();
  });

  it("guarda los cambios y refresca el usuario en sesión", async () => {
    seedSession();
    const actualizar = vi.spyOn(profileService, "updateProfile").mockResolvedValue(undefined);
    vi.spyOn(profileService, "fetchSelfUser").mockResolvedValue({
      id: 1,
      nombre: "Ana María",
      apellido: "Pérez",
      email: "ana@zentinel.test",
      estado_cuenta: "activa",
      id_rol: 1,
      avatar: "https://cdn.test/nueva.png",
    });

    renderWithProviders(<Perfil />);
    await userEvent.type(screen.getByPlaceholderText("Tu nombre"), " María ");
    await userEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() =>
      expect(actualizar).toHaveBeenCalledWith("token-de-prueba", 1, {
        nombre: "Ana María",
        apellido: "Pérez",
        avatarFile: null,
      }),
    );
    expect(await screen.findByText(/perfil actualizado correctamente/i)).toBeInTheDocument();
  });

  it("avisa cuando el backend rechaza la actualización", async () => {
    seedSession();
    vi.spyOn(profileService, "updateProfile").mockRejectedValue(new Error("Avatar muy pesado"));

    renderWithProviders(<Perfil />);
    await userEvent.type(screen.getByPlaceholderText("Tu apellido"), "z");
    await userEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    expect(await screen.findByText("Avatar muy pesado")).toBeInTheDocument();
  });

  it("previsualiza la foto elegida y permite quitarla", async () => {
    seedSession();
    renderWithProviders(<Perfil />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, archivo());

    expect(screen.getByText("foto.png")).toBeInTheDocument();
    expect(screen.getByAltText("Avatar")).toHaveAttribute("src", "blob:preview");

    await userEvent.click(screen.getByRole("button", { name: /quitar/i }));
    expect(screen.queryByText("foto.png")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeDisabled();
  });

  it("envía el avatar seleccionado junto con los datos", async () => {
    seedSession();
    const nuevoAvatar = archivo();
    const actualizar = vi.spyOn(profileService, "updateProfile").mockResolvedValue(undefined);
    vi.spyOn(profileService, "fetchSelfUser").mockResolvedValue({
      id: 1,
      nombre: "Ana",
      apellido: "Pérez",
      email: "ana@zentinel.test",
      estado_cuenta: "activa",
      id_rol: 1,
      avatar: "https://cdn.test/nueva.png",
    });

    renderWithProviders(<Perfil />);
    await userEvent.upload(
      document.querySelector('input[type="file"]') as HTMLInputElement,
      nuevoAvatar,
    );
    await userEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() =>
      expect(actualizar).toHaveBeenCalledWith("token-de-prueba", 1, {
        nombre: "Ana",
        apellido: "Pérez",
        avatarFile: nuevoAvatar,
      }),
    );
  });
});
