import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { seedSession } from "./test/helpers";
import { UNAUTHORIZED_EVENT } from "./utils/apiFetch";

// Las páginas se sustituyen por marcadores: acá se valida el ruteo y los guards,
// no el contenido de cada pantalla (cubierto en sus propios tests).
const { stub } = vi.hoisted(() => ({
  stub: (nombre: string) => ({ default: () => <div>{`pantalla ${nombre}`}</div> }),
}));

vi.mock("./pages/Home/Home", () => stub("home"));
vi.mock("./pages/Inicio/Inicio", () => stub("extravios"));
vi.mock("./pages/Metricas/Metricas", () => stub("metricas"));
vi.mock("./pages/Gestion/Gestion", () => stub("gestion"));
vi.mock("./pages/Soporte/Soporte", () => stub("soporte"));
vi.mock("./pages/Manual/Manual", () => stub("manual"));
vi.mock("./pages/Perfil/Perfil", () => stub("perfil"));
vi.mock("./pages/VerificarEmail/VerificarEmail", () => stub("verificar email"));
vi.mock("./pages/ResetearContrasena/ResetearContrasena", () => stub("resetear"));
vi.mock("./pages/NotFound/NotFound", () => stub("no encontrada"));
vi.mock("./components/Navbar/Navbar", () => stub("navbar"));
vi.mock("./components/Footer/Footer", () => stub("footer"));

const renderApp = (hash = "#/") => {
  window.location.hash = hash;
  return render(
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>,
  );
};

describe("App", () => {
  beforeEach(() => {
    window.location.hash = "#/";
  });

  it("muestra la home con navbar y footer", async () => {
    renderApp();

    expect(await screen.findByText("pantalla home")).toBeInTheDocument();
    expect(screen.getByText("pantalla navbar")).toBeInTheDocument();
    expect(screen.getByText("pantalla footer")).toBeInTheDocument();
  });

  it.each([
    ["#/extravios", "pantalla extravios"],
    ["#/soporte", "pantalla soporte"],
    ["#/manual", "pantalla manual"],
    ["#/verificar-email", "pantalla verificar email"],
    ["#/resetear-contrasena", "pantalla resetear"],
  ])("resuelve la ruta pública %s", async (hash, texto) => {
    renderApp(hash);

    expect(await screen.findByText(texto)).toBeInTheDocument();
  });

  it("cae en la pantalla 404 para una ruta desconocida", async () => {
    renderApp("#/ruta-inexistente");

    expect(await screen.findByText("pantalla no encontrada")).toBeInTheDocument();
  });

  it.each(["#/metricas", "#/gestion"])(
    "redirige %s a la home cuando el usuario no es staff",
    async (hash) => {
      seedSession({ id_rol: 3 });
      renderApp(hash);

      expect(await screen.findByText("pantalla home")).toBeInTheDocument();
    },
  );

  it("deja entrar al staff a métricas y gestión", async () => {
    seedSession({ id_rol: 4 });

    const { unmount } = renderApp("#/metricas");
    expect(await screen.findByText("pantalla metricas")).toBeInTheDocument();
    unmount();

    renderApp("#/gestion");
    expect(await screen.findByText("pantalla gestion")).toBeInTheDocument();
  });

  it("redirige el perfil a la home sin sesión y lo muestra con sesión", async () => {
    const { unmount } = renderApp("#/perfil");
    expect(await screen.findByText("pantalla home")).toBeInTheDocument();
    unmount();

    seedSession();
    renderApp("#/perfil");
    expect(await screen.findByText("pantalla perfil")).toBeInTheDocument();
  });

  it("abre el modal de sesión expirada y lo cierra al cancelar", async () => {
    seedSession();
    renderApp();
    await screen.findByText("pantalla home");

    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));

    expect(await screen.findByText("Sesión expirada")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(screen.queryByText("Sesión expirada")).not.toBeInTheDocument();
  });
});
