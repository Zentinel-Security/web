import { useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { updateProfile, fetchSelfUser } from "../../services/profileService";

const ROL_LABELS: Record<number, string> = {
  1: "Usuario",
  2: "Admin",
  3: "Usuario",
  4: "Manager",
  5: "Soporte",
};

const ROL_BADGE: Record<number, string> = {
  1: "bg-zentinel-text/8 text-zentinel-text-muted",
  2: "bg-amber-400/15 text-amber-400",
  3: "bg-zentinel-text/8 text-zentinel-text-muted",
  4: "bg-blue-400/15 text-blue-400",
  5: "bg-purple-400/15 text-purple-400",
};

export default function Perfil() {
  const { user, token, updateUser } = useAuth();
  const { showToast } = useToast();

  const [nombre, setNombre] = useState(user?.nombre ?? "");
  const [apellido, setApellido] = useState(user?.apellido ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials =
    `${user?.nombre?.charAt(0) ?? ""}${user?.apellido?.charAt(0) ?? ""}`.toUpperCase();

  const currentAvatar = avatarPreview ?? user?.avatar ?? null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user || !token) return;
    if (!nombre.trim() || !apellido.trim()) {
      showToast("El nombre y apellido son obligatorios.", "error");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(token, user.id, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        avatarFile,
      });
      const fresh = await fetchSelfUser(token, user.id);
      updateUser({
        nombre: fresh.nombre,
        apellido: fresh.apellido,
        avatar: fresh.avatar,
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      showToast("Perfil actualizado correctamente.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al guardar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const isDirty =
    nombre.trim() !== (user?.nombre ?? "") ||
    apellido.trim() !== (user?.apellido ?? "") ||
    avatarFile !== null;

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zentinel-gold tracking-tight">Mi perfil</h1>
        <p className="mt-1 text-zentinel-text-muted">
          Actualizá tu información personal y foto de perfil.
        </p>
      </div>

      <div className="rounded-2xl border border-zentinel-gold-dark/25 bg-zentinel-dark-secondary overflow-hidden shadow-xl">

        {/* ── Avatar section ───────────────────────────────── */}
        <div className="px-6 pt-6 pb-5 border-b border-zentinel-gold-dark/15 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full border-2 border-zentinel-gold/30 overflow-hidden flex items-center justify-center bg-zentinel-gold/10 shadow-lg">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  style={{ imageRendering: "auto", display: "block" }}
                />
              ) : (
                <span className="text-3xl font-bold text-zentinel-gold select-none">{initials}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 rounded-full bg-zentinel-gold p-1.5 shadow-lg hover:bg-zentinel-gold-light transition-colors"
              title="Cambiar foto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-zentinel-dark">
                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <p className="font-bold text-zentinel-text text-lg leading-tight">
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-sm text-zentinel-text-muted mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROL_BADGE[user?.id_rol ?? 1] ?? "bg-zentinel-text/8 text-zentinel-text-muted"}`}>
                {ROL_LABELS[user?.id_rol ?? 1] ?? "Usuario"}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${user?.estado_cuenta === "activa" || !user?.estado_cuenta ? "bg-green-500/12 text-green-400" : "bg-red-500/12 text-red-400"}`}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "currentColor" }} />
                {user?.estado_cuenta === "suspendida" ? "Suspendida" : "Activa"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Form ─────────────────────────────────────────── */}
        <div className="px-6 py-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted mb-1.5">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-xl border border-zentinel-gold-dark/30 bg-zentinel-dark px-4 py-2.5 text-sm text-zentinel-text placeholder-zentinel-text-muted/50 focus:border-zentinel-gold focus:outline-none transition-colors"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted mb-1.5">
                Apellido
              </label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full rounded-xl border border-zentinel-gold-dark/30 bg-zentinel-dark px-4 py-2.5 text-sm text-zentinel-text placeholder-zentinel-text-muted/50 focus:border-zentinel-gold focus:outline-none transition-colors"
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full rounded-xl border border-zentinel-gold-dark/15 bg-zentinel-dark/50 px-4 py-2.5 text-sm text-zentinel-text-muted cursor-not-allowed"
            />
            <p className="mt-1.5 text-xs text-zentinel-text-muted/60">El email no puede modificarse desde la web.</p>
          </div>

          {avatarFile && (
            <div className="flex items-center gap-3 rounded-xl border border-zentinel-gold/25 bg-zentinel-gold/5 px-4 py-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-zentinel-gold flex-shrink-0">
                <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-zentinel-text-muted flex-1 truncate">
                Nueva foto: <span className="text-zentinel-text font-medium">{avatarFile.name}</span>
              </p>
              <button
                onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                className="text-xs text-zentinel-text-muted hover:text-red-400 transition-colors"
              >
                Quitar
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="px-6 pb-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="inline-flex items-center gap-2 rounded-xl bg-zentinel-gold px-6 py-2.5 text-sm font-bold text-zentinel-dark transition-all hover:bg-zentinel-gold-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando…
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
