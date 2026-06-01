import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { olvideContrasenaRequest, reenviarVerificacionRequest } from "../../services/authService";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

type ModalView = "login" | "forgot" | "forgot-sent";

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Iniciar sesión",
  subtitle = "Ingresa con tus credenciales de Zentinel para continuar.",
}: LoginModalProps) {
  const { login } = useAuth();
  const [view, setView] = useState<ModalView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [error, setError] = useState("");
  const [isUnverified, setIsUnverified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setForgotEmail("");
      setError("");
      setIsUnverified(false);
      setIsSubmitting(false);
      setResendStatus("idle");
      setView("login");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      setError("Completa email y contraseña.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setIsUnverified(false);
    try {
      await login(email, password);
      onClose();
      onSuccess?.();
    } catch (loginError: any) {
      if (loginError?.code === "EMAIL_NOT_VERIFIED") {
        setIsUnverified(true);
        setError(loginError.message);
      } else if (loginError instanceof Error) {
        setError(loginError.message);
      } else {
        setError("No se pudo iniciar sesión.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || resendStatus !== "idle") return;
    setResendStatus("sending");
    try {
      await reenviarVerificacionRequest(email);
      setResendStatus("sent");
    } catch {
      setResendStatus("idle");
    }
  };

  const handleForgotSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!forgotEmail) {
      setError("Ingresá tu email.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await olvideContrasenaRequest(forgotEmail);
      setView("forgot-sent");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No se pudo enviar el correo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const sharedBoxClass =
    "relative w-full max-w-md rounded-2xl border border-zentinel-gold/30 bg-zentinel-dark-secondary p-6 shadow-2xl shadow-black/40";
  const sharedBoxStyle = {
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px color-mix(in srgb, var(--color-zentinel-gold) 20%, transparent)",
  };

  const modalContent = (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zentinel-text/20 backdrop-blur-md dark:bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── LOGIN VIEW ── */}
      {view === "login" && (
        <div className={sharedBoxClass} style={sharedBoxStyle}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zentinel-text">{title}</h2>
            <p className="mt-1 text-sm text-zentinel-text-muted">{subtitle}</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zentinel-gold"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-zentinel-gold-dark/30 bg-zentinel-dark p-3 text-zentinel-text outline-none transition-all focus:border-zentinel-gold focus:ring-1 focus:ring-zentinel-gold/40"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zentinel-gold"
              >
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-zentinel-gold-dark/30 bg-zentinel-dark p-3 text-zentinel-text outline-none transition-all focus:border-zentinel-gold focus:ring-1 focus:ring-zentinel-gold/40"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => { setError(""); setView("forgot"); }}
                className="text-xs text-zentinel-text-muted underline-offset-2 hover:text-zentinel-gold hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-300 space-y-1">
                <p>{error}</p>
                {isUnverified && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendStatus !== "idle"}
                    className="text-xs text-blue-400 hover:underline disabled:opacity-60"
                  >
                    {resendStatus === "sending"
                      ? "Enviando..."
                      : resendStatus === "sent"
                      ? "✓ Correo reenviado"
                      : "Reenviar correo de verificación"}
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-zentinel-gold-dark/30 px-4 py-2 text-sm font-medium text-zentinel-text-muted transition-colors hover:bg-zentinel-text/5"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-zentinel-gold px-4 py-2 text-sm font-bold text-zentinel-dark transition-colors hover:bg-zentinel-gold-light disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── FORGOT PASSWORD VIEW ── */}
      {view === "forgot" && (
        <div className={sharedBoxClass} style={sharedBoxStyle}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zentinel-text">Recuperar contraseña</h2>
            <p className="mt-1 text-sm text-zentinel-text-muted">
              Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>

          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="forgot-email"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zentinel-gold"
              >
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full rounded-md border border-zentinel-gold-dark/30 bg-zentinel-dark p-3 text-zentinel-text outline-none transition-all focus:border-zentinel-gold focus:ring-1 focus:ring-zentinel-gold/40"
                placeholder="tu@email.com"
                required
              />
            </div>

            {error && (
              <p className="rounded-md border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => { setError(""); setView("login"); }}
                className="rounded-md border border-zentinel-gold-dark/30 px-4 py-2 text-sm font-medium text-zentinel-text-muted transition-colors hover:bg-zentinel-text/5"
                disabled={isSubmitting}
              >
                Volver al login
              </button>
              <button
                type="submit"
                className="rounded-md bg-zentinel-gold px-4 py-2 text-sm font-bold text-zentinel-dark transition-colors hover:bg-zentinel-gold-light disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── FORGOT SENT CONFIRMATION ── */}
      {view === "forgot-sent" && (
        <div className={sharedBoxClass} style={sharedBoxStyle}>
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/20">
              <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zentinel-text">Revisá tu bandeja</h2>
            <p className="text-sm text-zentinel-text-muted">
              Si el email <span className="font-semibold text-zentinel-text">{forgotEmail}</span> está registrado, vas a recibir las instrucciones en los próximos minutos.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-md bg-zentinel-gold px-6 py-2 text-sm font-bold text-zentinel-dark transition-colors hover:bg-zentinel-gold-light"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
