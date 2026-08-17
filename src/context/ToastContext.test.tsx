import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "./ToastContext";

const Probe = () => {
  const { showToast } = useToast();
  return (
    <div>
      <button onClick={() => showToast("Guardado")}>ok</button>
      <button onClick={() => showToast("Falló", "error")}>error</button>
      <button onClick={() => showToast("Procesando", "info")}>info</button>
    </div>
  );
};

const renderProbe = () => render(<ToastProvider><Probe /></ToastProvider>);

const click = (name: string) =>
  act(() => {
    screen.getByRole("button", { name }).click();
  });

afterEach(() => {
  vi.useRealTimers();
});

describe("ToastProvider", () => {
  it("no muestra ningún toast al inicio", () => {
    renderProbe();
    expect(screen.queryByText("Guardado")).not.toBeInTheDocument();
  });

  it("muestra un toast de éxito por defecto", () => {
    renderProbe();
    click("ok");
    expect(screen.getByText("Guardado")).toBeInTheDocument();
    expect(screen.getByText("Guardado")).toHaveClass("bg-green-600");
  });

  it("distingue el estilo de error y de info", () => {
    renderProbe();
    click("error");
    click("info");
    expect(screen.getByText("Falló")).toHaveClass("bg-red-600");
    expect(screen.getByText("Procesando")).toHaveClass("text-zentinel-gold");
  });

  it("apila varios toques simultáneos", () => {
    renderProbe();
    click("ok");
    click("error");
    expect(screen.getByText("Guardado")).toBeInTheDocument();
    expect(screen.getByText("Falló")).toBeInTheDocument();
  });

  it("oculta el toast después de 3,5 segundos", () => {
    vi.useFakeTimers();
    renderProbe();
    click("ok");

    act(() => {
      vi.advanceTimersByTime(3499);
    });
    expect(screen.getByText("Guardado")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText("Guardado")).not.toBeInTheDocument();
  });

  it("useToast falla fuera del provider", () => {
    expect(() => render(<Probe />)).toThrow("useToast debe usarse dentro de ToastProvider");
  });
});
