import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import {
  AUTH_STORAGE_KEY,
  TOKEN_REFRESHED_EVENT,
  UNAUTHORIZED_EVENT,
} from "../utils/apiFetch";
import { jsonResponse, makeUser, mockFetch, seedSession } from "../test/helpers";

const Probe = () => {
  const {
    user,
    token,
    isAuthenticated,
    isStaff,
    isSupport,
    sessionExpired,
    login,
    logout,
    updateUser,
    clearSessionExpired,
  } = useAuth();

  return (
    <div>
      <span data-testid="token">{token ?? "sin-token"}</span>
      <span data-testid="nombre">{user?.nombre ?? "sin-usuario"}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="staff">{String(isStaff)}</span>
      <span data-testid="support">{String(isSupport)}</span>
      <span data-testid="expired">{String(sessionExpired)}</span>
      <button onClick={() => login("ana@zentinel.test", "secreta")}>login</button>
      <button onClick={logout}>logout</button>
      <button onClick={() => updateUser({ nombre: "Anabella" })}>editar</button>
      <button onClick={clearSessionExpired}>limpiar</button>
    </div>
  );
};

const renderProbe = () => render(<AuthProvider><Probe /></AuthProvider>);

const stored = () => JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? "null");

describe("AuthProvider", () => {
  it("arranca sin sesión cuando no hay nada guardado", () => {
    renderProbe();
    expect(screen.getByTestId("auth")).toHaveTextContent("false");
    expect(screen.getByTestId("token")).toHaveTextContent("sin-token");
  });

  it("rehidrata la sesión guardada en localStorage", () => {
    seedSession({ nombre: "Ana" }, "token-guardado");
    renderProbe();
    expect(screen.getByTestId("auth")).toHaveTextContent("true");
    expect(screen.getByTestId("token")).toHaveTextContent("token-guardado");
    expect(screen.getByTestId("nombre")).toHaveTextContent("Ana");
  });

  it("ignora un localStorage corrupto o incompleto", () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "{no-es-json");
    const { unmount } = renderProbe();
    expect(screen.getByTestId("auth")).toHaveTextContent("false");
    unmount();

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: "t" }));
    renderProbe();
    expect(screen.getByTestId("auth")).toHaveTextContent("false");
  });

  it("marca isStaff para admin/soporte/operador e isSupport sólo para roles de soporte", () => {
    const roles: Array<[number, string, string]> = [
      [1, "false", "false"],
      [2, "true", "true"],
      [4, "true", "false"],
      [5, "true", "true"],
    ];

    for (const [id_rol, staff, support] of roles) {
      localStorage.clear();
      seedSession({ id_rol });
      const { unmount } = renderProbe();
      expect(screen.getByTestId("staff")).toHaveTextContent(staff);
      expect(screen.getByTestId("support")).toHaveTextContent(support);
      unmount();
    }
  });

  it("guarda la sesión al hacer login", async () => {
    mockFetch(
      jsonResponse({ access_token: "nuevo", refresh_token: "ref", usuario: makeUser() }),
    );
    renderProbe();

    await userEvent.click(screen.getByRole("button", { name: "login" }));

    expect(screen.getByTestId("token")).toHaveTextContent("nuevo");
    expect(stored()).toMatchObject({ token: "nuevo", refreshToken: "ref" });
  });

  it("borra la sesión al hacer logout", async () => {
    seedSession();
    renderProbe();

    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    expect(screen.getByTestId("auth")).toHaveTextContent("false");
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("persiste los cambios de perfil con updateUser", async () => {
    seedSession({ nombre: "Ana" });
    renderProbe();

    await userEvent.click(screen.getByRole("button", { name: "editar" }));

    expect(screen.getByTestId("nombre")).toHaveTextContent("Anabella");
    expect(stored().user.nombre).toBe("Anabella");
  });

  it("no hace nada al editar si no hay sesión", async () => {
    renderProbe();
    await userEvent.click(screen.getByRole("button", { name: "editar" }));
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("cierra la sesión y avisa expiración ante el evento de no autorizado", async () => {
    seedSession();
    renderProbe();

    act(() => {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    });

    expect(screen.getByTestId("auth")).toHaveTextContent("false");
    expect(screen.getByTestId("expired")).toHaveTextContent("true");

    await userEvent.click(screen.getByRole("button", { name: "limpiar" }));
    expect(screen.getByTestId("expired")).toHaveTextContent("false");
  });

  it("actualiza el token en memoria cuando apiFetch lo renueva", () => {
    seedSession({}, "viejo");
    renderProbe();

    act(() => {
      window.dispatchEvent(
        new CustomEvent(TOKEN_REFRESHED_EVENT, { detail: { token: "renovado" } }),
      );
    });

    expect(screen.getByTestId("token")).toHaveTextContent("renovado");
  });

  it("se sincroniza con el logout de otra pestaña", () => {
    seedSession();
    renderProbe();

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: AUTH_STORAGE_KEY, newValue: null }),
      );
    });

    expect(screen.getByTestId("auth")).toHaveTextContent("false");
  });

  it("ignora cambios de otras claves de localStorage", () => {
    seedSession();
    renderProbe();

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "otra-clave", newValue: null }),
      );
    });

    expect(screen.getByTestId("auth")).toHaveTextContent("true");
  });

  it("useAuth falla fuera del provider", () => {
    expect(() => render(<Probe />)).toThrow("useAuth debe usarse dentro de AuthProvider");
  });
});
