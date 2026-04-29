// src/pages/Inicio/Inicio.tsx
import { useEffect, useState } from "react";
import ReportForm from "./components/ReportForm";
import type { ReportDraft } from "./components/ReportForm";
import ReportSummaryModal from "./components/ReportSummaryModal";
import LoginModal from "../../components/auth/LoginModal";
import { useAuth } from "../../context/AuthContext";
import {
  createDeviceReport,
  getMyReportStatus,
  reactivateMyAccount,
  type DeviceReport,
} from "../../services/reportService";

const initialDraft: ReportDraft = {
  reportType: "Perdido",
  phone: "",
  email: "",
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

        setFeedbackMessage("");
        setFeedbackIsError(false);
        setDraft(initialDraft); // Borra los datos oxidados del formulario
        setPendingReport(null);
        setShowForm(false); // Vuelve a mostrar el botón gigante principal

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

    if (!isAuthenticated) {
      setPendingReport(report);
      setIsLoginOpen(true);
      return;
    }

    setSummaryReport(report);
    setIsSummaryOpen(true);
  };

  const handleLoginSuccess = async () => {
    if (!pendingReport) return;

    // 1. Cerramos el modal de login inmediatamente
    setIsLoginOpen(false);

    // 2. Obtenemos el token más reciente de forma síncrona desde localStorage
    const stored = localStorage.getItem("zentinel-web-auth");
    let currentToken = token;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        currentToken = parsed.token;
      } catch {
        // Ignoramos el error silenciosamente si el JSON almacenado es inválido
      }
    }

    if (!currentToken) return;

    // 3. Verificamos el estado de la cuenta antes de abrir el modal de confirmación
    setIsLoadingStatus(true);
    try {
      const status = await getMyReportStatus(currentToken);
      setIsAccountSuspended(status.estado_cuenta === "suspendida");
      setLatestReport(status.ultimo_reporte);

      if (status.estado_cuenta === "suspendida") {
        // Cuenta suspendida: abortamos el reporte pendiente y mostramos mensaje
        setPendingReport(null);
        setShowForm(false);
        setFeedbackIsError(true);
        setFeedbackMessage("No se pudo generar el reporte: tu cuenta ya se encuentra suspendida por un reporte activo.");
      } else {
        // Cuenta activa: avanzamos al modal de confirmación
        setSummaryReport(pendingReport);
        setPendingReport(null);
        setIsSummaryOpen(true);
      }
    } catch (error) {
      setFeedbackIsError(true);
      console.error("Error al obtener estado:", error);
      setFeedbackMessage("Error al verificar el estado de la cuenta tras iniciar sesión.");
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleConfirmReport = async () => {
    if (!summaryReport || !token) {
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
                <p className="mt-2 text-sm">
                  <span className="font-semibold">Tipo:</span> {latestReport.tipo_reporte}
                </p>
                <p className="mt-1 text-sm">
                  <span className="font-semibold">Estado:</span> {latestReport.estado_reporte}
                </p>
                <p className="mt-1 text-sm">
                  <span className="font-semibold">Incluye ubicación:</span>{" "}
                  {latestReport.incluye_ubicacion ? "Sí" : "No"}
                </p>
                <p className="mt-1 text-sm whitespace-pre-line">
                  <span className="font-semibold">Descripción:</span>{" "}
                  {latestReport.descripcion || "Sin descripción."}
                </p>
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
