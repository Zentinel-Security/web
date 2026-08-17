import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ReportSummaryModal from "./ReportSummaryModal";
import type { ReportDraft } from "./ReportForm";

const report: ReportDraft = {
  reportType: "Robado",
  description: "Me lo sacaron en el colectivo",
  includeLocation: true,
};

const setup = (props: Partial<React.ComponentProps<typeof ReportSummaryModal>> = {}) => {
  const handlers = { onClose: vi.fn(), onEdit: vi.fn(), onConfirm: vi.fn() };
  const utils = render(
    <ReportSummaryModal isOpen report={report} {...handlers} {...props} />,
  );
  return { ...handlers, ...utils };
};

describe("ReportSummaryModal", () => {
  it("no renderiza nada si está cerrado o sin reporte", () => {
    const { container, rerender } = setup({ isOpen: false });
    expect(container).toBeEmptyDOMElement();

    rerender(
      <ReportSummaryModal
        isOpen
        report={null}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("muestra el resumen del borrador", () => {
    setup();
    expect(screen.getByText("Robado")).toBeInTheDocument();
    expect(screen.getByText("Me lo sacaron en el colectivo")).toBeInTheDocument();
    expect(screen.getByText("Incluida")).toBeInTheDocument();
  });

  it("usa textos por defecto sin descripción ni ubicación", () => {
    setup({ report: { reportType: "Perdido", description: "", includeLocation: false } });
    expect(screen.getByText("Sin detalles adicionales.")).toBeInTheDocument();
    expect(screen.getByText("No incluida")).toBeInTheDocument();
  });

  it("permite volver a editar y confirmar", async () => {
    const { onEdit, onConfirm } = setup();

    await userEvent.click(screen.getByRole("button", { name: /volver a editar/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirmar reporte/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("cierra al hacer clic en el fondo", async () => {
    const { onClose, container } = setup();

    await userEvent.click(container.querySelector('[aria-hidden="true"]')!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("bloquea los botones mientras guarda", () => {
    setup({ isSaving: true });

    expect(screen.getByRole("button", { name: /guardando/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /volver a editar/i })).toBeDisabled();
  });
});
