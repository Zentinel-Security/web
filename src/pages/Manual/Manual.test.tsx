import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Manual from "./Manual";
import { renderWithProviders } from "../../test/helpers";

describe("Manual de usuario", () => {
  it("renderiza el índice completo del manual", () => {
    renderWithProviders(<Manual />);

    expect(screen.getByRole("heading", { name: /manual de usuario/i })).toBeInTheDocument();
    ["introduccion", "registro", "grupos", "zonas", "monitoreo", "soporte", "preguntas"].forEach(
      (id) => expect(document.getElementById(id)).not.toBeNull(),
    );
  });

  it("hace scroll suave hacia la sección elegida del índice", async () => {
    renderWithProviders(<Manual />);
    const scrollIntoView = vi.fn();
    const seccion = document.getElementById("grupos");
    expect(seccion).not.toBeNull();
    seccion!.scrollIntoView = scrollIntoView;

    await userEvent.click(screen.getAllByRole("link", { name: /grupos/i })[0]);

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });
});
