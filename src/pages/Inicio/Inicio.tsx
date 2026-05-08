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

// Utilidad para formatear la fecha a hora local (Argentina)
const formatLocalTime = (dateString: string | null | undefined) => {
  if (!dateString) return "No disponible";
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Cordoba",
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(dateString));
};

export default function Inicio() {
  const { isAuthenticated, token } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<ReportDraft>(initialDraft);
  const [, setPendingReport] = useState<ReportDraft | null>(null);
  const [summaryReport, setSummaryReport] = useState<ReportDraft | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [isReactivatingAccount, setIsReactivatingAccount] = useState(false);
  const [isAccountSuspended, setIsAccountSuspended] = useState(false);
  const [isAccountRecovered, setIsAccountRecovered] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(isAuthenticated);
  const [latestReport, setLatestReport] = useState<DeviceReport | null>(null);
  const [feedbackIsError, setFeedbackIsError] = useState(false);

  // Limpieza total de estados al cerrar sesión
  useEffect(() => {
    if (!isAuthenticated) {
      setFeedbackMessage("");
      setFeedbackIsError(false);
      setPendingReport(null);
      setSummaryReport(null);
      setShowForm(false);
      setDraft(initialDraft);
      setIsAccountRecovered(false);
    }
  }, [isAuthenticated]);

  // Sincronización robusta que atrapa reportes pendientes post-login
  useEffect(() => {
    const syncReportStatus = async () => {
      if (!isAuthenticated || !token) {
        setIsAccountSuspended(false);
        setIsLoadingStatus(false);
        setLatestReport(null);

        setFeedbackMessage("");
        setFeedbackIsError(false);
        setDraft(initialDraft); // Borra los datos oxidados del formulario
        setPendingReport(null);
        setShowForm(false); // Vuelve a mostrar el botón gigante principal

        setIsLoginOpen(false);
        setIsSummaryOpen(false);
        setSummaryReport(null);

        return;
      }

      setIsLoadingStatus(true);
      try {
        const status = await getMyReportStatus(token);
        const isSuspended = status.estado_cuenta === "suspendida";

        setIsAccountSuspended(isSuspended);
        setLatestReport(status.ultimo_reporte);

        // Si el usuario acaba de loguearse y tenía un reporte en progreso...
        setPendingReport((currentPending) => {
          if (currentPending) {
            if (isSuspended) {
              // Si ya estaba suspendido, abortamos el formulario y avisamos
              setFeedbackIsError(true);
              setFeedbackMessage("Operación cancelada: Ya posees un reporte activo y tu cuenta está suspendida.");
              setShowForm(false);
            } else {
              // Si todo está bien, le mostramos el modal para confirmar
              setSummaryReport(currentPending);
              setIsSummaryOpen(true);
            }
            return null; // Limpiamos el pendiente
          }
          return currentPending;
        });

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
      setIsAccountSuspended(false); // Quitamos la tarjeta roja
      setLatestReport(status.ultimo_reporte);
      setFeedbackMessage(""); // Limpiamos el toast de arriba
      setIsAccountRecovered(true); // Mostramos la tarjeta Verde
    } catch (error) {
      setFeedbackIsError(true);
      setFeedbackMessage(error instanceof Error ? error.message : "No se pudo reactivar la cuenta.");
    } finally {
      setIsReactivatingAccount(false);
    }
  };

  const handleSubmitReport = (report: ReportDraft) => {
    setFeedbackMessage("");
    setFeedbackIsError(false);
    setIsAccountRecovered(false); // Limpiar vistas anteriores si intenta de nuevo

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

  // Verificación estricta tras iniciar sesión
  const handleLoginSuccess = () => {
    // Solo cerramos el modal. El useEffect de arriba (syncReportStatus) 
    // se encarga de manera determinista de procesar el pendingReport.
    setIsLoginOpen(false);
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
      await createDeviceReport({ draft: summaryReport, token });

      setIsAccountSuspended(true);
      setIsSummaryOpen(false);
      setSummaryReport(null);
      setPendingReport(null);
      setDraft(initialDraft);
      setShowForm(false);
      setIsAccountRecovered(false); // Asegurarnos de limpiar la vista verde

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
      setFeedbackMessage(error instanceof Error ? error.message : "No se pudo guardar el reporte.");
    } finally {
      setIsSavingReport(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Ocultar encabezado genérico si hay pantalla de estado activa */}
      {!isAccountSuspended && !isAccountRecovered && (
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-zentinel-gold sm:text-5xl mb-4 tracking-tight">
            Centro de Reportes
          </h1>
          <p className="text-lg text-zentinel-text-muted max-w-2xl">
            Si has perdido tu dispositivo con Zentinel instalado, es vital actuar rápido. Reporta el incidente para iniciar inmediatamente los protocolos de seguridad y rastreo.
          </p>
        </div>
      )}

      {/* Notificaciones al tope */}
      {feedbackMessage ? (
        <div className={`mb-8 rounded-lg border p-4 text-sm shadow-md animate-in fade-in slide-in-from-top-2 ${feedbackIsError
          ? "border-red-500/30 bg-red-950/30 text-red-300"
          : "border-emerald-500/30 bg-emerald-950/30 text-emerald-200"
          }`}>
          {feedbackMessage}
        </div>
      ) : null}

      <div className="mt-8">
        {isAuthenticated && isLoadingStatus ? (
          <div className="rounded-xl border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary p-8 text-center animate-pulse">
            <p className="text-zentinel-text-muted text-sm">Verificando estado de la cuenta...</p>
          </div>
        ) : isAuthenticated && isAccountSuspended ? (

          /* UI CUENTA SUSPENDIDA (ROJA) */
          <div className="overflow-hidden rounded-2xl border border-red-500/20 bg-zentinel-dark-secondary shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-red-950/20 p-6 sm:p-8 border-b border-red-500/10">
              <div className="flex items-center gap-4 mb-2">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <h3 className="text-2xl font-bold text-red-200 tracking-tight">Cuenta Suspendida</h3>
              </div>
              <p className="text-sm text-red-200/60 ml-7">
                Protocolo de seguridad activo. Operaciones restringidas por reporte de extravío.
              </p>
            </div>

            {latestReport && (
              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zentinel-gold mb-4">
                    Detalles del Incidente
                  </h4>
                  <div className="grid gap-y-4 gap-x-8 sm:grid-cols-2 bg-black/20 rounded-xl p-5 border border-white/5">
                    <div>
                      <p className="text-[11px] uppercase text-zentinel-text-muted mb-1">Evento Reportado</p>
                      <p className="text-sm font-medium text-white">{latestReport.tipo_reporte}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase text-zentinel-text-muted mb-1">Estado</p>
                      {/* Formateo semántico */}
                      <p className="text-sm font-medium text-red-400">
                        {latestReport.estado_reporte === "creado" ? "Activo (En búsqueda)" : "Finalizado"}
                      </p>
                    </div>
                    <div className="sm:col-span-2 pt-2 border-t border-white/5">
                      <p className="text-[11px] uppercase text-zentinel-text-muted mb-1">Descripción</p>
                      <p className="text-sm text-white/80 whitespace-pre-line italic">
                        "{latestReport.descripcion || "Sin descripción proporcionada"}"
                      </p>
                    </div>
                  </div>
                </div>

                {latestReport.incluye_ubicacion && latestReport.latitud && latestReport.longitud ? (
                  <div className="mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zentinel-gold mb-1">
                          Última Ubicación Conocida
                        </h4>
                        <p className="text-xs text-zentinel-text-muted">
                          Registrada el: <span className="text-white/70">{formatLocalTime(latestReport.fecha_ubicacion)}</span>
                        </p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${latestReport.latitud},${latestReport.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        Abrir Externamente
                      </a>
                    </div>

                    <div className="w-full h-64 rounded-xl overflow-hidden border border-white/10 shadow-inner bg-black">
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
                  </div>
                ) : (
                  <div className="rounded-lg bg-black/20 border border-white/5 p-4 text-center">
                    <p className="text-sm text-zentinel-text-muted italic">
                      No se adjuntó ubicación en este reporte o el rastreo global falló.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-red-950/10 p-6 sm:px-8 border-t border-red-500/10 flex justify-center">
              <button
                onClick={handleReactivateAccount}
                disabled={isReactivatingAccount}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-6 py-2.5 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
              >
                {isReactivatingAccount ? "Procesando..." : "Cancelar Reporte y Reactivar Cuenta"}
              </button>
            </div>
          </div>

        ) : isAuthenticated && isAccountRecovered ? (

          /* DETALLE 4: UI CUENTA REACTIVADA (VERDE) */
          <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-zentinel-dark-secondary shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-emerald-950/20 p-6 sm:p-8 border-b border-emerald-500/10">
              <div className="flex items-center gap-4 mb-2">
                <div className="relative flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <h3 className="text-2xl font-bold text-emerald-200 tracking-tight">Cuenta Reactivada</h3>
              </div>
              <p className="text-sm text-emerald-200/60 ml-7">
                El protocolo de seguridad se ha desactivado con éxito. Tu dispositivo vuelve a operar con total normalidad.
              </p>
            </div>

            {latestReport && (
              <div className="p-6 sm:p-8">
                <div className="mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zentinel-gold mb-4">
                    Resumen del Incidente Finalizado
                  </h4>
                  <div className="grid gap-y-4 gap-x-8 sm:grid-cols-2 bg-black/20 rounded-xl p-5 border border-white/5">
                    <div>
                      <p className="text-[11px] uppercase text-zentinel-text-muted mb-1">Evento Reportado</p>
                      <p className="text-sm font-medium text-white">{latestReport.tipo_reporte}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase text-zentinel-text-muted mb-1">Estado</p>
                      <p className="text-sm font-medium text-emerald-400">Resuelto (Finalizado)</p>
                    </div>
                    <div className="sm:col-span-2 pt-2 border-t border-white/5">
                      <p className="text-[11px] uppercase text-zentinel-text-muted mb-1">Descripción Guardada</p>
                      <p className="text-sm text-white/80 whitespace-pre-line italic">
                        "{latestReport.descripcion || "Sin descripción proporcionada"}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-emerald-950/10 p-6 sm:px-8 border-t border-emerald-500/10 flex justify-center">
              <button
                onClick={() => setIsAccountRecovered(false)}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-6 py-2.5 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/20 shadow-sm"
              >
                Volver al Centro de Reportes
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
                Haz clic aquí para comenzar el proceso de reporte y bloqueo preventivo.
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