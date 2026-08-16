import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";

const THEME_STORAGE_KEY = "zentinel-theme";

const Probe = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>cambiar</button>
    </div>
  );
};

const renderProbe = () => render(<ThemeProvider><Probe /></ThemeProvider>);

const stubPrefersDark = (matches: boolean) => {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );
};

afterEach(() => {
  document.documentElement.classList.remove("dark");
});

describe("ThemeProvider", () => {
  it("usa el tema guardado en localStorage", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    renderProbe();
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("cae a la preferencia del sistema si no hay valor guardado", () => {
    stubPrefersDark(true);
    renderProbe();
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("usa light cuando el sistema no prefiere oscuro", () => {
    stubPrefersDark(false);
    renderProbe();
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("ignora un valor guardado inválido", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "fucsia");
    stubPrefersDark(true);
    renderProbe();
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("alterna el tema, la clase del documento y lo persiste", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    renderProbe();
    expect(document.documentElement).toHaveClass("dark");

    await userEvent.click(screen.getByRole("button", { name: "cambiar" }));

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    await userEvent.click(screen.getByRole("button", { name: "cambiar" }));

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("sobrevive a un localStorage que lanza excepciones", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    stubPrefersDark(false);

    expect(() => renderProbe()).not.toThrow();
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("useTheme falla fuera del provider", () => {
    expect(() => render(<Probe />)).toThrow("useTheme debe usarse dentro de ThemeProvider");
  });
});
