import type { ReportDraft } from "../pages/Inicio/components/ReportForm";

export const validateReportDraft = (draft: ReportDraft) => {
  const errors: Partial<Record<keyof ReportDraft, string>> = {};
  if (!draft.reportType || !["Perdido", "Robado"].includes(draft.reportType)) {
    errors.reportType = "Tipo de reporte inválido.";
  }

  if (draft.description && draft.description.trim().length > 500) {
    errors.description = "La descripción no puede superar los 500 caracteres.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
