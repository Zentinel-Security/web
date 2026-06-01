import { useState, type FormEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { resetearContrasenaRequest } from "../../services/authService";

type Status = "form" | "loading" | "success" | "error";

export default function ResetearContrasena() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<Status>(token ? "form" : "error");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(
    !token ? "El enlace no contiene un token válido." : ""
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setStatus("loading");
    try {
      await resetearContrasenaRequest(token, password);
      setStatus("success");
    } catch (err: any) {
      setError(err?.message || "No se pudo restablecer la contraseña.");
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zentinel-card-border bg-zentinel-card p-8 shadow-lg">

        {/* ── LOADING ── */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zentinel-primary/30 border-t-zentinel-primary" />
            <p className="text-zentinel-text-muted">Actualizando contraseña...</p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
              <svg className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zentinel-text">¡Contraseña actualizada!</h1>
            <p className="text-zentinel-text-muted">
              Tu contraseña fue restablecida correctamente. Ya podés iniciar sesión con la nueva contraseña.
            </p>
            <Link
              to="/"
              className="mt-2 inline-block rounded-md bg-zentinel-primary px-6 py-2 text-sm font-bold text-white transition-colors hover:opacity-90"
            >
              Ir al inicio
            </Link>
          </div>
        )}

        {/* ── ERROR (invalid/expired token) ── */}
        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
              <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zentinel-text">Enlace inválido</h1>
            <p className="text-zentinel-text-muted">{error}</p>
            <Link
              to="/"
              className="mt-2 inline-block rounded-md border border-zentinel-card-border px-6 py-2 text-sm font-medium text-zentinel-text-muted transition-colors hover:bg-zentinel-primary/10"
            >
              Volver al inicio
            </Link>
          </div>
        )}

        {/* ── FORM ── */}
        {status === "form" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-zentinel-text">Nueva contraseña</h1>
              <p className="mt-1 text-sm text-zentinel-text-muted">
                Ingresá y confirmá tu nueva contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="reset-password"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zentinel-primary"
                >
                  Nueva contraseña
                </label>
                <input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-zentinel-card-border bg-zentinel-bg p-3 text-zentinel-text outline-none transition-all focus:border-zentinel-primary focus:ring-1 focus:ring-zentinel-primary/40"
                  placeholder="Mínimo 8 caracteres"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="reset-confirm"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zentinel-primary"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="reset-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-zentinel-card-border bg-zentinel-bg p-3 text-zentinel-text outline-none transition-all focus:border-zentinel-primary focus:ring-1 focus:ring-zentinel-primary/40"
                  placeholder="Repetí la contraseña"
                  required
                />
              </div>

              {error && (
                <p className="rounded-md border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-md bg-zentinel-primary py-3 text-sm font-bold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Restablecer contraseña
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
