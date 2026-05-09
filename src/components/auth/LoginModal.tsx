import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Iniciar sesión",
  subtitle = "Ingresa con tus credenciales de Zentinel para continuar.",
}: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setError("Completa email y contraseña.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await login(email, password);
      onClose();
      onSuccess?.();
    } catch (loginError) {
      if (loginError instanceof Error) {
        setError(loginError.message);
      } else {
        setError("No se pudo iniciar sesión.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zentinel-text/20 backdrop-blur-md dark:bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-zentinel-gold/30 bg-zentinel-dark-secondary p-6 shadow-2xl shadow-black/40" style={{boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px color-mix(in srgb, var(--color-zentinel-gold) 20%, transparent)'}}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zentinel-text">{title}</h2>
          <p className="mt-1 text-sm text-zentinel-text-muted">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              onChange={(event) => setEmail(event.target.value)}
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
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-zentinel-gold-dark/30 bg-zentinel-dark p-3 text-zentinel-text outline-none transition-all focus:border-zentinel-gold focus:ring-1 focus:ring-zentinel-gold/40"
              placeholder="••••••••"
              required
            />
          </div>

          {error ? (
            <p className="rounded-md border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}

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
    </div>
  );

  return createPortal(modalContent, document.body);
}
