import type { ReportDraft } from "./ReportForm";

interface ReportSummaryModalProps {
  isOpen: boolean;
  report: ReportDraft | null;
  onClose: () => void;
  onEdit: () => void;
  onConfirm: () => void;
}

export default function ReportSummaryModal({
  isOpen,
  report,
  onClose,
  onEdit,
  onConfirm,
}: ReportSummaryModalProps) {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl rounded-xl border border-zentinel-gold-dark/40 bg-zentinel-dark-secondary p-6 shadow-2xl shadow-black/60">
        <h3 className="text-2xl font-bold text-white">Resumen del reporte</h3>
        <p className="mt-1 text-sm text-zentinel-text-muted">
          Verifica los datos antes de confirmar.
        </p>

        <div className="mt-6 space-y-4 rounded-lg border border-zentinel-gold-dark/30 bg-zentinel-dark/60 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-gold">
              Número de celular extraviado
            </p>
            <p className="mt-1 text-zentinel-text">{report.phone}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-gold">
              Email de contacto alternativo
            </p>
            <p className="mt-1 text-zentinel-text">{report.email}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-gold">
              Información adicional
            </p>
            <p className="mt-1 whitespace-pre-line text-zentinel-text">
              {report.description || "Sin detalles adicionales."}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md border border-zentinel-gold-dark/30 px-4 py-2 text-sm font-medium text-zentinel-text-muted transition-colors hover:bg-white/5"
          >
            Volver a editar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-zentinel-gold px-4 py-2 text-sm font-bold text-zentinel-dark transition-colors hover:bg-zentinel-gold-light"
          >
            Confirmar reporte
          </button>
        </div>
      </div>
    </div>
  );
}
