import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Footer from "./Footer";
import { renderWithProviders } from "../../test/helpers";

afterEach(() => {
  vi.useRealTimers();
});

describe("Footer", () => {
  it("enlaza las secciones públicas", () => {
    renderWithProviders(<Footer />);

    const hrefs = screen.getAllByRole("link").map((el) => el.getAttribute("href"));
    expect(hrefs).toEqual(["/", "/extravios", "/soporte", "/manual"]);
  });

  it("muestra el año corriente en el copyright", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2031-03-01T00:00:00Z"));

    renderWithProviders(<Footer />);

    expect(screen.getByText(/© 2031 Zentinel/)).toBeInTheDocument();
  });

  it("anuncia la app como próximamente disponible", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByTitle("Próximamente disponible")).toBeInTheDocument();
  });
});
