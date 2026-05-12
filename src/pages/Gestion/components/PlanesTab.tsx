import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  activatePlan,
  createPlan,
  deactivatePlan,
  getFeatures,
  getPlanesAdmin,
  updatePlan,
  type Plan,
  type PlanFeatureDef,
  type UpdatePlanPayload,
} from "../../../services/planesService";

interface Props {
  token: string;
}

const INTERVAL_LABELS: Record<string, string> = {
  mes: "mes",
  año: "año",
  month: "mes",
  year: "año",
  infinito: "único",
};

function formatPrice(price: number, interval: string) {
  if (price === 0) return "Gratis";
  const int = INTERVAL_LABELS[interval] ?? interval;
  return `$${price.toLocaleString("es-AR")} / ${int}`;
}

function formatPlanName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " ");
}

const BADGE_COLOR = (price: number, active: boolean) => {
  if (!active) return "bg-zinc-500/15 text-zinc-400";
  if (price === 0) return "bg-zentinel-text/8 text-zentinel-text-muted";
  if (price < 3000) return "bg-zentinel-gold/15 text-zentinel-gold";
  return "bg-blue-500/15 text-blue-400";
};

const EMPTY_FORM = (): UpdatePlanPayload => ({
  nombre: "",
  descripcion: "",
  precio: 0,
  intervalo: "mes",
  limits: {},
});

export default function PlanesTab({ token }: Props) {
  const { showToast } = useToast();

  const [planes, setPlanes] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<PlanFeatureDef[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState<UpdatePlanPayload>(EMPTY_FORM());
  const [saving, setSaving] = useState(false);

  // Confirm deactivate
  const [confirmDeact, setConfirmDeact] = useState<Plan | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Filtro inactivos
  const [showInactive, setShowInactive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [p, f] = await Promise.all([
        getPlanesAdmin(token),
        getFeatures(token),
      ]);
      setPlanes(p);
      setFeatures(f);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando planes");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  // ── Open modal ──────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingPlan(null);
    const limits: Record<string, number | boolean> = {};
    features.forEach((f) => {
      limits[f.codigo] = f.tipo_limite === "boolean" ? false : 0;
    });
    setForm({ ...EMPTY_FORM(), limits });
    setModalOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    const limits: Record<string, number | boolean> = {};
    features.forEach((f) => {
      const v = plan.limits?.[f.codigo];
      limits[f.codigo] = v !== undefined ? v : f.tipo_limite === "boolean" ? false : 0;
    });
    setForm({
      nombre: plan.name,
      descripcion: plan.description ?? "",
      precio: plan.price,
      intervalo: plan.interval ?? "mes",
      limits,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPlan(null);
    setForm(EMPTY_FORM());
  };

  // ── Save ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.nombre.trim()) {
      showToast("El nombre del plan es obligatorio.", "error");
      return;
    }
    if (form.precio < 0) {
      showToast("El precio no puede ser negativo.", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingPlan) {
        await updatePlan(token, editingPlan.id, form);
        showToast(`Plan "${formatPlanName(form.nombre)}" actualizado.`, "success");
      } else {
        await createPlan(token, form);
        showToast(`Plan "${formatPlanName(form.nombre)}" creado.`, "success");
      }
      closeModal();
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error al guardar.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ───────────────────────────────────────────────────
  const handleToggleActive = async (plan: Plan) => {
    if (plan.active) {
      setConfirmDeact(plan);
      return;
    }
    setTogglingId(plan.id);
    try {
      await activatePlan(token, plan.id);
      setPlanes((prev) => prev.map((p) => p.id === plan.id ? { ...p, active: true } : p));
      showToast(`Plan "${formatPlanName(plan.name)}" activado.`, "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error.", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!confirmDeact) return;
    setTogglingId(confirmDeact.id);
    const name = confirmDeact.name;
    setConfirmDeact(null);
    try {
      await deactivatePlan(token, confirmDeact.id);
      setPlanes((prev) => prev.map((p) => p.id === confirmDeact.id ? { ...p, active: false } : p));
      showToast(`Plan "${formatPlanName(name)}" desactivado.`, "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error.", "error");
    } finally {
      setTogglingId(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary p-6 space-y-4"
          >
            <div className="h-5 w-1/2 rounded bg-zentinel-gold-dark/20" />
            <div className="h-8 w-1/3 rounded bg-zentinel-gold-dark/15" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => <div key={j} className="h-3 rounded bg-zentinel-gold-dark/10" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <button onClick={load} className="mt-3 text-xs text-zentinel-gold underline">
          Reintentar
        </button>
      </div>
    );
  }

  const activePlanes = planes.filter((p) => p.active);
  const inactivePlanes = planes.filter((p) => !p.active);
  const visiblePlanes = showInactive ? planes : activePlanes;

  return (
    <>
      {/* Header + botón crear */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zentinel-text-muted">
            {activePlanes.length} plan{activePlanes.length !== 1 ? "es" : ""} activo{activePlanes.length !== 1 ? "s" : ""}
            {inactivePlanes.length > 0 && (
              <span className="text-zentinel-text-muted/50">
                {" "}· {inactivePlanes.length} inactivo{inactivePlanes.length !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-zentinel-gold px-4 py-2 text-sm font-bold text-zentinel-dark transition-colors hover:bg-zentinel-gold-light"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          Nuevo plan
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePlanes.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-6 flex flex-col gap-4 transition-all ${
              !plan.active
                ? "border-zentinel-gold-dark/10 bg-zentinel-dark-secondary/50 opacity-60"
                : "border-zentinel-gold-dark/20 bg-zentinel-dark-secondary shadow-lg shadow-black/20"
            }`}
          >
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${BADGE_COLOR(plan.price, plan.active)}`}>
                {formatPlanName(plan.name)}
              </span>
              {(plan as any).inicial && (
                <span className="rounded-full bg-zentinel-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zentinel-gold">
                  Inicial
                </span>
              )}
              {!plan.active && (
                <span className="rounded-full bg-zinc-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Inactivo
                </span>
              )}
            </div>

            {/* Precio */}
            <div>
              <p className="text-3xl font-extrabold text-zentinel-text leading-none">
                {formatPrice(plan.price, plan.interval)}
              </p>
              {plan.price > 0 && (
                <p className="mt-0.5 text-xs text-zentinel-text-muted">
                  {INTERVAL_LABELS[plan.interval] ?? plan.interval}
                </p>
              )}
            </div>

            {/* Descripción */}
            {plan.description && (
              <p className="text-xs text-zentinel-text-muted leading-relaxed">{plan.description}</p>
            )}

            {/* Límites */}
            {plan.features && plan.features.length > 0 && (
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f.codigo} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-zentinel-text-muted">{f.nombre}</span>
                    <span className="text-xs font-semibold text-zentinel-text">
                      {f.tipo_limite === "boolean"
                        ? f.valor
                          ? "✓"
                          : "—"
                        : f.valor === -1
                        ? "∞"
                        : String(f.valor ?? "—")}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Acciones */}
            <div className="mt-auto flex gap-2 pt-2 border-t border-zentinel-gold-dark/10">
              <button
                onClick={() => openEdit(plan)}
                className="flex-1 rounded-lg border border-zentinel-gold/30 py-1.5 text-xs font-semibold text-zentinel-gold transition-colors hover:bg-zentinel-gold/10"
              >
                Editar
              </button>
              <button
                onClick={() => handleToggleActive(plan)}
                disabled={togglingId === plan.id}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                  plan.active
                    ? "border border-red-500/30 text-red-400 hover:bg-red-500/10"
                    : "border border-green-500/30 text-green-400 hover:bg-green-500/10"
                }`}
              >
                {togglingId === plan.id
                  ? "..."
                  : plan.active
                  ? "Desactivar"
                  : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Banner de inactivos ────────────────────────────────────── */}
      {inactivePlanes.length > 0 && (
        <button
          onClick={() => setShowInactive((v) => !v)}
          className="group flex w-full items-center gap-3 rounded-xl border border-dashed border-zentinel-gold-dark/20 px-4 py-3 text-left transition-colors hover:border-zentinel-gold-dark/40 hover:bg-zentinel-gold-dark/5"
        >
          <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
            showInactive
              ? "bg-zinc-500/20 text-zinc-400"
              : "bg-zinc-500/15 text-zinc-400 group-hover:bg-zinc-500/25"
          }`}>
            {inactivePlanes.length}
          </span>
          <span className="flex-1 text-xs text-zentinel-text-muted">
            {showInactive
              ? "Ocultar planes inactivos"
              : `${inactivePlanes.length} plan${inactivePlanes.length !== 1 ? "es" : ""} inactivo${inactivePlanes.length !== 1 ? "s" : ""} oculto${inactivePlanes.length !== 1 ? "s"  : ""}`}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-4 h-4 flex-shrink-0 text-zentinel-text-muted/50 transition-transform ${showInactive ? "rotate-180" : ""}`}
          >
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* ── Modal edición / creación ───────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zentinel-gold-dark/25 bg-zentinel-dark-secondary shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="relative px-6 pt-6 pb-5 border-b border-zentinel-gold-dark/15"
              style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--color-zentinel-gold) 6%, transparent), transparent)" }}
            >
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-zentinel-text-muted transition-colors hover:bg-zentinel-text/10 hover:text-zentinel-text"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
              <h2 className="text-lg font-bold text-zentinel-gold">
                {editingPlan ? `Editar plan: ${formatPlanName(editingPlan.name)}` : "Nuevo plan"}
              </h2>
              <p className="mt-0.5 text-sm text-zentinel-text-muted">
                {editingPlan ? "Los cambios se reflejan en la app mobile automáticamente." : "Completá los datos para crear un nuevo plan."}
              </p>
            </div>

            {/* Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-160px)] px-6 py-5 space-y-5">

              {/* Datos básicos */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zentinel-text-muted">Datos del plan</h3>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zentinel-text-muted">Nombre</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    placeholder="ej: premium"
                    className="w-full rounded-lg border border-zentinel-gold-dark/25 bg-zentinel-dark px-3 py-2 text-sm text-zentinel-text placeholder-zentinel-text-muted/40 outline-none transition focus:border-zentinel-gold/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zentinel-text-muted">Descripción</label>
                  <input
                    type="text"
                    value={form.descripcion}
                    onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                    placeholder="ej: Plan para equipos de trabajo"
                    className="w-full rounded-lg border border-zentinel-gold-dark/25 bg-zentinel-dark px-3 py-2 text-sm text-zentinel-text placeholder-zentinel-text-muted/40 outline-none transition focus:border-zentinel-gold/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zentinel-text-muted">Precio ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zentinel-text-muted">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={form.precio === 0 ? "" : String(form.precio)}
                        placeholder="0"
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9.]/g, "");
                          setForm((f) => ({ ...f, precio: raw === "" ? 0 : parseFloat(raw) || 0 }));
                        }}
                        className="w-full rounded-lg border border-zentinel-gold-dark/25 bg-zentinel-dark pl-7 pr-3 py-2 text-sm text-zentinel-text placeholder-zentinel-text-muted/30 outline-none transition focus:border-zentinel-gold/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zentinel-text-muted">Intervalo</label>
                    <select
                      value={form.intervalo}
                      onChange={(e) => setForm((f) => ({ ...f, intervalo: e.target.value }))}
                      className="w-full rounded-lg border border-zentinel-gold-dark/25 bg-zentinel-dark px-3 py-2 text-sm text-zentinel-text outline-none transition focus:border-zentinel-gold/50"
                    >
                      <option value="mes">Mensual</option>
                      <option value="año">Anual</option>
                      <option value="infinito">Pago único</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Límites */}
              {features.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zentinel-text-muted">Límites</h3>
                    <span className="text-[10px] text-zentinel-text-muted/60">— usa −1 para sin límite</span>
                  </div>

                  <div className="rounded-xl border border-zentinel-gold-dark/15 overflow-hidden divide-y divide-zentinel-gold-dark/10">
                    {features.map((f) => (
                      <div key={f.codigo} className="flex items-center gap-4 px-4 py-3 bg-zentinel-dark/40">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zentinel-text leading-none">{f.nombre}</p>
                          {f.descripcion && (
                            <p className="mt-0.5 text-xs text-zentinel-text-muted truncate">{f.descripcion}</p>
                          )}
                        </div>
                        {f.tipo_limite === "boolean" ? (
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                limits: { ...prev.limits, [f.codigo]: !prev.limits[f.codigo] },
                              }))
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              form.limits[f.codigo] ? "bg-zentinel-gold" : "bg-zentinel-gold-dark/25"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                form.limits[f.codigo] ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        ) : (
                          <div className="relative w-28">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={form.limits[f.codigo] === 0 ? "" : String(form.limits[f.codigo])}
                              placeholder="0"
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^0-9-]/g, "");
                                const num = raw === "" || raw === "-" ? 0 : parseInt(raw, 10);
                                setForm((prev) => ({
                                  ...prev,
                                  limits: { ...prev.limits, [f.codigo]: isNaN(num) ? 0 : num },
                                }));
                              }}
                              className="w-full rounded-lg border border-zentinel-gold-dark/25 bg-zentinel-dark px-3 py-1.5 text-right text-sm font-semibold text-zentinel-text placeholder-zentinel-text-muted/40 outline-none transition focus:border-zentinel-gold/50"
                            />
                            {(form.limits[f.codigo] as number) === -1 && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zentinel-gold">∞</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-zentinel-gold-dark/15 px-6 py-4">
              <button
                onClick={closeModal}
                className="flex-1 rounded-xl border border-zentinel-gold-dark/25 py-2.5 text-sm font-semibold text-zentinel-text-muted transition-colors hover:border-zentinel-gold/30 hover:text-zentinel-text"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-zentinel-gold py-2.5 text-sm font-bold text-zentinel-dark transition-colors hover:bg-zentinel-gold-light disabled:opacity-60"
              >
                {saving ? "Guardando…" : editingPlan ? "Guardar cambios" : "Crear plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm desactivar ─────────────────────────────────────── */}
      {confirmDeact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setConfirmDeact(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-zentinel-dark-secondary p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-zentinel-text mb-1">
              ¿Desactivar "{formatPlanName(confirmDeact.name)}"?
            </h3>
            <p className="text-sm text-zentinel-text-muted mb-5">
              El plan dejará de estar visible para los usuarios. Los que ya lo tengan activo no se verán afectados.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeact(null)}
                className="flex-1 rounded-xl border border-zentinel-gold-dark/25 py-2.5 text-sm font-semibold text-zentinel-text-muted hover:text-zentinel-text transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeactivate}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-colors"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
