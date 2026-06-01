import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verificarEmailRequest, reenviarVerificacionRequest } from "../../services/authService";

type Status = "loading" | "success" | "error-expired" | "error-invalid";

export default function VerificarEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (!token) {
      setStatus("error-invalid");
      return;
    }

    verificarEmailRequest(token)
      .then(() => setStatus("success"))
      .catch((err: any) => {
        if (err?.code === "INVALID_TOKEN") {
          setStatus("error-expired");
        } else {
          setStatus("error-invalid");
        }
      });
  }, [token]);

  const handleResend = async (e: FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResendStatus("sending");
    setResendError("");
    try {
      await reenviarVerificacionRequest(resendEmail);
      setResendStatus("sent");
    } catch (err) {
      setResendError(err instanceof Error ? err.message : "No se pudo reenviar el correo.");
      setResendStatus("error");
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zentinel-card-border bg-zentinel-card p-8 shadow-lg text-center">

        {/* ── LOADING ── */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zentinel-primary/30 border-t-zentinel-primary" />
            <p className="text-zentinel-text-muted">Verificando tu email...</p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
              <svg className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zentinel-text">¡Email verificado!</h1>
            <p className="text-zentinel-text-muted">
              Tu cuenta está activa. Ya podés iniciar sesión.
            </p>
            <Link
              to="/"
              className="mt-2 inline-block rounded-md bg-zentinel-primary px-6 py-2 text-sm font-bold text-white transition-colors hover:opacity-90"
            >
              Ir al inicio
            </Link>
          </div>
        )}

        {/* ── ERROR: EXPIRED TOKEN ── */}
        {status === "error-expired" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/20">
              <svg className="h-7 w-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zentinel-text">Enlace expirado</h1>
            <p className="text-zentinel-text-muted">
              El enlace de verificación expiró (24 horas). Ingresá tu email para recibir uno nuevo.
            </p>

            {resendStatus === "sent" ? (
              <div className="mt-2 rounded-md border border-green-500/30 bg-green-950/40 px-4 py-3 text-sm text-green-300">
                ✓ Correo reenviado. Revisá tu bandeja de entrada.
              </div>
            ) : (
              <form onSubmit={handleResend} className="mt-2 flex w-full gap-2">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="flex-1 rounded-md border border-zentinel-card-border bg-zentinel-bg p-2.5 text-sm text-zentinel-text outline-none focus:border-zentinel-primary focus:ring-1 focus:ring-zentinel-primary/40"
                />
                <button
                  type="submit"
                  disabled={resendStatus === "sending"}
                  className="rounded-md bg-zentinel-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:opacity-90 disabled:opacity-60"
                >
                  {resendStatus === "sending" ? "..." : "Reenviar"}
                </button>
              </form>
            )}

            {resendStatus === "error" && (
              <p className="text-sm text-red-400">{resendError}</p>
            )}
          </div>
        )}

        {/* ── ERROR: INVALID TOKEN ── */}
        {status === "error-invalid" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
              <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zentinel-text">Enlace inválido</h1>
            <p className="text-zentinel-text-muted">
              Este enlace de verificación no es válido. Si el problema persiste, contactá al soporte.
            </p>
            <Link
              to="/"
              className="mt-2 inline-block rounded-md border border-zentinel-card-border px-6 py-2 text-sm font-medium text-zentinel-text-muted transition-colors hover:bg-zentinel-primary/10"
            >
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
