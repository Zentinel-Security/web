import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Navbar from "./Navbar";
import { renderWithProviders, seedSession } from "../../test/helpers";
import { AUTH_STORAGE_KEY } from "../../utils/apiFetch";

const linksVisibles = () =>
  screen.getAllByRole("link").map((el) => el.textContent);

describe("Navbar", () => {
  it("muestra la navegación pública y el botón de ingresar sin sesión", () => {
    renderWithProviders(<Navbar />);

    expect(linksVisibles()).toEqual(["Inicio", "Extravío", "Soporte", "Manual"]);
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /menú de usuario/i })).not.toBeInTheDocument();
  });

  it("agrega Métricas y Gestión sólo para staff", () => {
    seedSession({ id_rol: 4 });
    renderWithProviders(<Navbar />);

    expect(linksVisibles()).toContain("Métricas");
    expect(linksVisibles()).toContain("Gestión");
  });

  it("oculta las secciones de staff a un usuario común", () => {
    seedSession({ id_rol: 1 });
    renderWithProviders(<Navbar />);

    expect(linksVisibles()).not.toContain("Gestión");
  });

  it("abre el modal de login desde el botón Ingresar", async () => {
    renderWithProviders(<Navbar />);

    await userEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("muestra las iniciales del usuario logueado y su menú", async () => {
    seedSession({ nombre: "Ana", apellido: "Pérez", email: "ana@zentinel.test" });
    renderWithProviders(<Navbar />);

    expect(screen.getByText("AP")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /menú de usuario/i }));

    expect(screen.getByText("ana@zentinel.test")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mi perfil/i })).toBeInTheDocument();
  });

  it("muestra el avatar cuando el usuario tiene foto", () => {
    seedSession({ avatar: "https://cdn.test/ana.png" });
    renderWithProviders(<Navbar />);

    expect(document.querySelector("img")).toHaveAttribute("src", "https://cdn.test/ana.png");
  });

  it("cierra el menú de usuario al hacer clic afuera", async () => {
    seedSession();
    renderWithProviders(<Navbar />);

    await userEvent.click(screen.getByRole("button", { name: /menú de usuario/i }));
    expect(screen.getByRole("button", { name: /mi perfil/i })).toBeInTheDocument();

    await userEvent.click(document.body);
    expect(screen.queryByRole("button", { name: /mi perfil/i })).not.toBeInTheDocument();
  });

  it("cierra la sesión desde el menú de usuario", async () => {
    seedSession();
    renderWithProviders(<Navbar />);

    await userEvent.click(screen.getByRole("button", { name: /menú de usuario/i }));
    await userEvent.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
  });

  it("alterna el tema desde la navbar", async () => {
    localStorage.setItem("zentinel-theme", "dark");
    renderWithProviders(<Navbar />);

    await userEvent.click(screen.getByRole("button", { name: /cambiar a modo claro/i }));

    expect(screen.getByRole("button", { name: /cambiar a modo oscuro/i })).toBeInTheDocument();
    expect(localStorage.getItem("zentinel-theme")).toBe("light");
  });

  it("abre y cierra el menú mobile bloqueando el scroll del body", async () => {
    seedSession();
    renderWithProviders(<Navbar />);

    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getAllByRole("link", { name: "Manual" })).toHaveLength(2);

    await userEvent.click(screen.getByRole("button", { name: "Cerrar menú" }));
    expect(document.body.style.overflow).toBe("");
  });

  it("permite ir al perfil y cerrar sesión desde el menú mobile", async () => {
    seedSession();
    renderWithProviders(<Navbar />);

    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }));
    await userEvent.click(screen.getAllByRole("button", { name: /mi perfil/i })[0]);
    expect(screen.queryByRole("button", { name: "Cerrar menú" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }));
    await userEvent.click(screen.getAllByRole("button", { name: /cerrar sesión/i })[0]);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
