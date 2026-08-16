import { describe, expect, it } from "vitest";
import { validateReportDraft } from "./reportValidations";
import type { ReportDraft } from "../pages/Inicio/components/ReportForm";

const draft = (overrides: Partial<ReportDraft> = {}): ReportDraft => ({
  reportType: "Perdido",
  description: "",
  includeLocation: false,
  ...overrides,
});

describe("validateReportDraft", () => {
  it("acepta un borrador válido", () => {
    expect(validateReportDraft(draft({ description: "Lo perdí en el subte" }))).toEqual({
      isValid: true,
      errors: {},
    });
  });

  it("acepta ambos tipos de reporte", () => {
    expect(validateReportDraft(draft({ reportType: "Robado" })).isValid).toBe(true);
  });

  it("rechaza un tipo de reporte desconocido", () => {
    const { isValid, errors } = validateReportDraft(
      draft({ reportType: "Extraviado" as ReportDraft["reportType"] }),
    );
    expect(isValid).toBe(false);
    expect(errors.reportType).toBe("Tipo de reporte inválido.");
  });

  it("rechaza un tipo de reporte vacío", () => {
    const { isValid } = validateReportDraft(
      draft({ reportType: "" as ReportDraft["reportType"] }),
    );
    expect(isValid).toBe(false);
  });

  it("rechaza descripciones de más de 500 caracteres", () => {
    const { isValid, errors } = validateReportDraft(draft({ description: "a".repeat(501) }));
    expect(isValid).toBe(false);
    expect(errors.description).toBe("La descripción no puede superar los 500 caracteres.");
  });

  it("acepta exactamente 500 caracteres e ignora espacios al recortar", () => {
    expect(validateReportDraft(draft({ description: "a".repeat(500) })).isValid).toBe(true);
    expect(validateReportDraft(draft({ description: `  ${"a".repeat(499)}  ` })).isValid).toBe(true);
  });
});
