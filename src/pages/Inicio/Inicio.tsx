// src/pages/Inicio/Inicio.tsx
import { useEffect, useState } from "react";
import ReportForm from "./components/ReportForm";
import type { ReportDraft } from "./components/ReportForm";
import ReportSummaryModal from "./components/ReportSummaryModal";
import LoginModal from "../../components/auth/LoginModal";
import { useAuth } from "../../context/AuthContext";
import { validateReportDraft } from "../../utils/reportValidations";
import {
  createDeviceReport,
  getMyReportStatus,
  reactivateMyAccount,
  type DeviceReport,
} from "../../services/reportService";

const initialDraft: ReportDraft = {
  reportType: "Perdido",
  description: "",
  includeLocation: false,
};

export default function Inicio() {
  const { isAuthenticated, token } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<ReportDraft>(initialDraft);
  const [pendingReport, setPendingReport] = useState<ReportDraft | null>(null);
  const [summaryReport, setSummaryReport] = useState<ReportDraft | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [isReactivatingAccount, setIsReactivatingAccount] = useState(false);
  const [isAccountSuspended, setIsAccountSuspended] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(isAuthenticated);
  const [latestReport, setLatestReport] = useState<DeviceReport | null>(null);
  const [feedbackIsError, setFeedbackIsError] = useState(false);

  useEffect(() => {
    const syncReportStatus = async () => {
      if (!isAuthenticated || !token) {
        setIsAccountSuspended(false);
        setIsLoadingStatus(false);
        setLatestReport(null);
        return;
      }

      setIsLoadingStatus(true);
      try {
        const status = await getMyReportStatus(token);
        setIsAccountSuspended(status.estado_cuenta === "suspendida");
        setLatestReport(status.ultimo_reporte);
      } catch {
        setIsAccountSuspended(false);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    void syncReportStatus();
  }, [isAuthenticated, token]);

  const handleReactivateAccount = async () => {
    if (!token) {
      setFeedbackIsError(true);
      setFeedbackMessage("No se pudo reactivar la cuenta. Inicia sesión nuevamente.");
      return;
    }

    setIsReactivatingAccount(true);

    try {
      const status = await reactivateMyAccount(token);
      setIsAccountSuspended(status.estado_cuenta === "suspendida");
      setLatestReport(status.ultimo_reporte);
      setFeedbackIsError(false);
      setFeedbackMessage("Cuenta reactivada correctamente.");
    } catch (error) {
      setFeedbackIsError(true);
      if (error instanceof Error) {
        setFeedbackMessage(error.message);
      } else {
        setFeedbackMessage("No se pudo reactivar la cuenta.");
      }
    } finally {
      setIsReactivatingAccount(false);
    }
  };

  const handleSubmitReport = (report: ReportDraft) => {
    setFeedbackMessage("");
    setFeedbackIsError(false);

    // Validación del reporte antes de proceder
    const { isValid, errors } = validateReportDraft(report);
    if (!isValid) {
      setFeedbackIsError(true);
      setFeedbackMessage(Object.values(errors)[0] || "Revisa los datos del formulario.");
      return;
    }

    if (!isAuthenticated) {
      setPendingReport(report);
      setIsLoginOpen(true);
      return;
    }

    setSummaryReport(report);
    setIsSummaryOpen(true);
  };

  const handleLoginSuccess = () => {
    if (!pendingReport) return;
    setSummaryReport(pendingReport);
    setPendingReport(null);
    setIsSummaryOpen(true);
  };

  const handleConfirmReport = async () => {
    if (!summaryReport || !token) {
      setFeedbackIsError(true);
      setFeedbackMessage("No se pudo confirmar el reporte. Inicia sesión nuevamente.");
      setIsSummaryOpen(false);
      return;
    }

    setIsSavingReport(true);

    try {
      await createDeviceReport({
        draft: summaryReport,
        token,
      });

      setIsAccountSuspended(true);
      setIsSummaryOpen(false);
      setSummaryReport(null);
      setPendingReport(null);
      setDraft(initialDraft);
      setShowForm(false);

      try {
        const status = await getMyReportStatus(token);
        setLatestReport(status.ultimo_reporte);
      } catch {
        setLatestReport(null);
      }

      setFeedbackIsError(false);
      setFeedbackMessage("Reporte creado y cuenta suspendida correctamente.");
    } catch (error) {
      setFeedbackIsError(true);
      if (error instanceof Error) {
        setFeedbackMessage(error.message);
      } else {
        setFeedbackMessage("No se pudo guardar el reporte.");
      }
    } finally {
      setIsSavingReport(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-zentinel-gold sm:text-5xl mb-4 tracking-tight">
          Centro de Reportes
        </h1>
        <p className="text-lg text-zentinel-text-muted max-w-2xl">
          Si has perdido tu dispositivo con Zentinel instalado, es vital actuar
          rápido. Reporta el incidente para iniciar inmediatamente los
          protocolos de seguridad y rastreo.
        </p>
      </div>

      {/* Notificaciones al tope para feedback inmediato */}
      {feedbackMessage ? (
        <div className={`mb-6 rounded-lg border p-4 text-sm ${feedbackIsError
          ? "border-red-500/30 bg-red-950/30 text-red-300"
          : "border-emerald-500/30 bg-emerald-950/30 text-emerald-200"
          }`}>
          {feedbackMessage}
        </div>
      ) : null}

      <div className="mt-8">
        {isAuthenticated && isLoadingStatus ? (
          <div className="rounded-xl border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary p-8 text-center">
            <p className="text-zentinel-text-muted text-sm">Verificando estado de la cuenta...</p>
          </div>
        ) : isAuthenticated && isAccountSuspended ? (
          <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-6 text-red-100">
            <h3 className="text-xl font-bold text-red-200">Cuenta suspendida</h3>
            <p className="mt-2 text-sm text-red-100/90">
              Tu cuenta se encuentra en estado suspendida por un reporte activo en estado creado.
            </p>

            {latestReport ? (
              <div className="mt-4 rounded-lg border border-red-400/30 bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-gold">
                  Último reporte enviado
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <p className="text-sm">
                    <span className="font-semibold text-white/80">Tipo:</span> {latestReport.tipo_reporte}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-white/80">Estado:</span> {latestReport.estado_reporte}
                  </p>
                  <p className="text-sm col-span-full whitespace-pre-line">
                    <span className="font-semibold text-white/80">Descripción:</span>{" "}
                    {latestReport.descripcion || "Sin descripción."}
                  </p>
                </div>

                {/* VISUALIZACIÓN DINÁMICA DE MAPA (REFACTOR UI) */}
                {latestReport.incluye_ubicacion && latestReport.latitud && latestReport.longitud ? (
                  <div className="mt-4 pt-4 border-t border-red-400/20">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-gold mb-2">
                      Última Ubicación Detectada
                    </p>
                    <p className="text-sm text-red-100/70 mb-4">
                      <span className="font-semibold text-white/80">Registrada el: </span>
                      {latestReport.fecha_ubicacion ? new Date(latestReport.fecha_ubicacion).toLocaleString() : 'N/A'}
                    </p>

                    <div className="w-full h-56 sm:h-72 rounded-lg overflow-hidden border border-red-400/20 shadow-inner bg-black/30">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${latestReport.latitud},${latestReport.longitud}&zoom=16`}
                      ></iframe>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${latestReport.latitud},${latestReport.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-zentinel-gold hover:text-white transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        Abrir externamente
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-red-400/20">
                    <p className="text-sm text-red-200/60">No se adjuntó ubicación en este reporte o el rastreo global falló.</p>
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-5">
              <button
                onClick={handleReactivateAccount}
                disabled={isReactivatingAccount}
                className="rounded-lg border border-zentinel-gold/60 bg-zentinel-gold/10 px-4 py-2 text-sm font-semibold text-zentinel-gold transition-colors hover:bg-zentinel-gold/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isReactivatingAccount ? "Reactivando cuenta..." : "Reactivar cuenta"}
              </button>
            </div>
          </div>
        ) : !showForm ? (
          /* Estado inicial: Botón grande de llamada a la acción - también para usuarios no autenticados */
          <button
            onClick={() => setShowForm(true)}
            className="group w-full sm:w-auto flex flex-col items-center sm:flex-row gap-6 bg-zentinel-dark-secondary hover:bg-zentinel-dark-secondary/80 border-2 border-zentinel-gold p-8 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(212,175,55,0.3)] hover:scale-[1.02] cursor-pointer text-left"
          >
            <div className="bg-zentinel-gold/10 p-4 rounded-full border border-zentinel-gold/30 group-hover:bg-zentinel-gold/20 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 text-zentinel-gold"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-zentinel-gold transition-colors">
                Denunciar Dispositivo Extraviado
              </h2>
              <p className="text-zentinel-text-muted">
                Haz clic aquí para comenzar el proceso de reporte y bloqueo
                preventivo.
              </p>
            </div>
          </button>
        ) : (
          /* Estado secundario: El formulario */
          <ReportForm
            onCancel={() => {
              setShowForm(false);
              setPendingReport(null);
              setFeedbackMessage("");
            }}
            values={draft}
            onChange={setDraft}
            onSubmitReport={handleSubmitReport}
          />
        )}

        {feedbackMessage ? (
          <div className={`mt-6 rounded-lg border p-4 text-sm ${feedbackIsError
              ? "border-red-500/30 bg-red-950/30 text-red-300"
              : "border-emerald-500/30 bg-emerald-950/30 text-emerald-200"
            }`}>
            {feedbackMessage}
          </div>
        ) : null}
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
        title="Inicia sesión para continuar"
        subtitle="Necesitas autenticarte para confirmar el reporte del incidente."
      />

      <ReportSummaryModal
        isOpen={isSummaryOpen}
        report={summaryReport}
        onClose={() => setIsSummaryOpen(false)}
        onEdit={() => setIsSummaryOpen(false)}
        onConfirm={handleConfirmReport}
        isSaving={isSavingReport}
      />
    </div>
  );
}