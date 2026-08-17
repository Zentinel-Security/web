import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ReportForm, { type ReportDraft } from "./ReportForm";

const baseDraft: ReportDraft = {
  reportType: "Perdido",
  description: "",
  includeLocation: false,
};

const setup = (values: Partial<ReportDraft> = {}) => {
  const onChange = vi.fn();
  const onCancel = vi.fn();
  const onSubmitReport = vi.fn();
  const draft = { ...baseDraft, ...values };

  render(
    <ReportForm
      values={draft}
      onChange={onChange}
      onCancel={onCancel}
      onSubmitReport={onSubmitReport}
    />,
  );

  return { onChange, onCancel, onSubmitReport, draft };
};

describe("ReportForm", () => {
  it("refleja los valores recibidos", () => {
    setup({ reportType: "Robado", description: "Lo dejé en el taxi", includeLocation: true });

    expect(screen.getByLabelText(/tipo de reporte/i)).toHaveValue("Robado");
    expect(screen.getByLabelText(/información adicional/i)).toHaveValue("Lo dejé en el taxi");
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("notifica el cambio de tipo de reporte", async () => {
    const { onChange, draft } = setup();

    await userEvent.selectOptions(screen.getByLabelText(/tipo de reporte/i), "Robado");

    expect(onChange).toHaveBeenCalledWith({ ...draft, reportType: "Robado" });
  });

  it("notifica cada tecla de la descripción", async () => {
    const { onChange, draft } = setup();

    await userEvent.type(screen.getByLabelText(/información adicional/i), "Ho");

    expect(onChange).toHaveBeenNthCalledWith(1, { ...draft, description: "H" });
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("notifica el toggle de ubicación en ambos sentidos", async () => {
    const { onChange, draft } = setup();
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith({ ...draft, includeLocation: true });

    onChange.mockClear();
    const activo = setup({ includeLocation: true });
    await userEvent.click(screen.getAllByRole("checkbox")[1]);
    expect(activo.onChange).toHaveBeenCalledWith({ ...activo.draft, includeLocation: false });
  });

  it("envía el borrador actual sin recargar la página", async () => {
    const { onSubmitReport, draft } = setup({ description: "detalle" });

    await userEvent.click(screen.getByRole("button", { name: /enviar reporte/i }));

    expect(onSubmitReport).toHaveBeenCalledWith(draft);
  });

  it("cancela sin enviar", async () => {
    const { onCancel, onSubmitReport } = setup();

    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmitReport).not.toHaveBeenCalled();
  });
});
