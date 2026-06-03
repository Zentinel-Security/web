import { useState, useEffect, useCallback, useRef } from "react";
import { getAuditLog, type AuditLogEntry, type AuditLogResult } from "../../../services/gestionService";

const TIPO_EVENTO_LABELS: Record<string, string> = {
  suspender_cuenta:     "Suspensión de cuenta",
  reactivar_cuenta:     "Reactivación de cuenta",
  cambio_rol:           "Cambio de rol",
  crear_plan:           "Plan creado",
  actualizar_plan:      "Plan actualizado",
  desactivar_plan:      "Plan desactivado",
  activar_plan:         "Plan activado",
  cambio_estado_ticket: "Cambio estado ticket",
  respuesta_ticket:     "Respuesta a ticket",
};

const TIPO_EVENTO_BADGE: Record<string, string> = {
  suspender_cuenta:     "bg-red-500/15 text-red-400",
  reactivar_cuenta:     "bg-green-500/15 text-green-400",
  cambio_rol:           "bg-blue-500/15 text-blue-400",
  crear_plan:           "bg-purple-500/15 text-purple-400",
  actualizar_plan:      "bg-purple-500/15 text-purple-400",
  desactivar_plan:      "bg-orange-500/15 text-orange-400",
  activar_plan:         "bg-green-500/15 text-green-400",
  cambio_estado_ticket: "bg-amber-500/15 text-amber-400",
  respuesta_ticket:     "bg-sky-500/15 text-sky-400",
};

const PAGE_SIZE = 15;

interface Props {
  token: string;
  isAdmin: boolean;
  staffList: { id: number; nombre: string; apellido: string }[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getObjetivoLabel(entry: AuditLogEntry): string {
  const nombre = entry.objetivo_usuario_nombre?.trim();
  if (nombre) return `${nombre} (${entry.objetivo_usuario_email ?? ""})`;
  if (entry.objetivo_plan_nombre)    return `Plan: ${entry.objetivo_plan_nombre}`;
  if (entry.objetivo_ticket_asunto)  return `Ticket #${entry.objetivo_ticket_asunto}`;
  return "—";
}

// ── Field rendering helpers ─────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  activo:        "Estado",
  estado_cuenta: "Estado de cuenta",
  id_rol:        "Rol",
  nombre:        "Nombre",
  precio:        "Precio",
  estado:        "Estado del ticket",
  mensaje:       "Mensaje",
};

const ROL_NAMES: Record<number, string> = { 1: "usuario", 2: "admin", 3: "usuario", 4: "manager", 5: "soporte" };
const ROL_BADGE: Record<number, string> = {
  2: "bg-amber-400/15 text-amber-400",
  4: "bg-blue-400/15 text-blue-400",
  5: "bg-purple-400/15 text-purple-400",
};

const ESTADO_TICKET_BADGE: Record<string, string> = {
  abierto:     "bg-blue-500/15 text-blue-400",
  en_progreso: "bg-amber-500/15 text-amber-400",
  resuelto:    "bg-green-500/15 text-green-400",
  cerrado:     "bg-zentinel-text/10 text-zentinel-text-muted",
};
const ESTADO_TICKET_LABELS: Record<string, string> = {
  abierto:     "Abierto",
  en_progreso: "En progreso",
  resuelto:    "Resuelto",
  cerrado:     "Cerrado",
};

function FieldValue({ fieldKey, value }: { fieldKey: string; value: unknown }) {
  if (fieldKey === "activo") {
    return value
      ? <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Activo</span>
      : <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Inactivo</span>;
  }
  if (fieldKey === "estado_cuenta") {
    const v = String(value ?? "");
    return v === "activa"
      ? <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Activa</span>
      : <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Suspendida</span>;
  }
  if (fieldKey === "id_rol") {
    const num  = Number(value);
    const name = ROL_NAMES[num] ?? `Rol ${value}`;
    const cls  = ROL_BADGE[num] ?? "bg-zentinel-text/8 text-zentinel-text-muted";
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{name}</span>;
  }
  if (fieldKey === "estado") {
    const v = String(value ?? "");
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_TICKET_BADGE[v] ?? "bg-zentinel-text/10 text-zentinel-text-muted"}`}>{ESTADO_TICKET_LABELS[v] ?? v}</span>;
  }
  if (fieldKey === "precio") {
    return <span className="text-sm font-semibold text-zentinel-text">${Number(value).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>;
  }
  if (fieldKey === "mensaje") {
    return <span className="text-sm text-zentinel-text leading-relaxed">{String(value)}</span>;
  }
  if (fieldKey.startsWith("limits.")) {
    if (value === null || value === undefined) return <span className="text-zentinel-text-muted text-sm">—</span>;
    if (value === -1)  return <span className="inline-flex rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs font-semibold text-purple-400">Ilimitado</span>;
    if (value === true)  return <span className="inline-flex rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-400">Sí</span>;
    if (value === false) return <span className="inline-flex rounded-full bg-zentinel-text/10 px-2.5 py-0.5 text-xs font-semibold text-zentinel-text-muted">No</span>;
    return <span className="text-sm font-semibold text-zentinel-text">{String(value)}</span>;
  }
  if (value === null || value === undefined) {
    return <span className="text-zentinel-text-muted text-sm">—</span>;
  }
  return <span className="text-sm text-zentinel-text">{String(value)}</span>;
}

// ── Flatten nested objects (e.g. limits.{key}) for diff ─────────
function flattenRecord(obj: Record<string, unknown> | null): Record<string, unknown> {
  if (!obj) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      for (const [sk, sv] of Object.entries(v as Record<string, unknown>)) {
        out[`${k}.${sk}`] = sv;
      }
    } else {
      out[k] = v;
    }
  }
  return out;
}

function snakeToLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getLabelForKey(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  if (key.startsWith("limits.")) return snakeToLabel(key.slice(7));
  return snakeToLabel(key);
}

function DiffSection({ anterior, nuevo }: { anterior: Record<string, unknown> | null; nuevo: Record<string, unknown> | null }) {
  const flatAnterior = flattenRecord(anterior);
  const flatNuevo    = flattenRecord(nuevo);

  const rawKeys = Array.from(new Set([
    ...Object.keys(flatAnterior),
    ...Object.keys(flatNuevo),
  ]));

  // Drop 'activo' when 'estado_cuenta' is also present (redundant)
  const allKeys = rawKeys.includes("estado_cuenta")
    ? rawKeys.filter((k) => k !== "activo")
    : rawKeys;

  const isOnlyNew = !anterior && nuevo;

  // For diff mode: only show fields that actually changed
  const visibleKeys = isOnlyNew
    ? allKeys
    : allKeys.filter((k) => JSON.stringify(flatAnterior[k]) !== JSON.stringify(flatNuevo[k]));

  if (visibleKeys.length === 0) {
    return (
      <p className="text-sm text-zentinel-text-muted italic px-1">Sin diferencias registradas.</p>
    );
  }

  return (
    <div className="rounded-xl border border-zentinel-gold-dark/15 overflow-hidden">
      {/* Header */}
      <div className={`grid gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted bg-zentinel-gold/5 border-b border-zentinel-gold-dark/10 ${isOnlyNew ? "grid-cols-[1fr_1fr]" : "grid-cols-[1fr_1fr_auto_1fr]"}`}>
        <span>Campo</span>
        {isOnlyNew ? (
          <span className="text-right">Valor</span>
        ) : (
          <>
            <span>Antes</span>
            <span />
            <span>Después</span>
          </>
        )}
      </div>

      {/* Rows — only changed fields */}
      <div className="divide-y divide-zentinel-gold-dark/8">
        {visibleKeys.map((key) => {
          const before = flatAnterior[key];
          const after  = flatNuevo[key];
          const label  = getLabelForKey(key);

          return (
            <div key={key} className={`grid gap-4 items-center px-4 py-3 ${isOnlyNew ? "grid-cols-[1fr_1fr]" : "grid-cols-[1fr_1fr_auto_1fr]"}`}>
              <span className="text-xs font-medium text-zentinel-text-muted truncate">{label}</span>

              {isOnlyNew ? (
                <div className="flex justify-end">
                  <FieldValue fieldKey={key} value={after} />
                </div>
              ) : (
                <>
                  <div><FieldValue fieldKey={key} value={before} /></div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0 text-zentinel-text-muted/40">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                  </svg>
                  <div className="flex justify-end"><FieldValue fieldKey={key} value={after} /></div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Detail Modal ────────────────────────────────────────────────
function DetailModal({ entry, onClose }: { entry: AuditLogEntry; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-zentinel-gold-dark/25 bg-zentinel-dark-secondary shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zentinel-gold-dark/15"
          style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--color-zentinel-gold) 5%, transparent), transparent)" }}
        >
          <div className="flex items-center gap-3">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${TIPO_EVENTO_BADGE[entry.tipo_evento] ?? "bg-zentinel-text/10 text-zentinel-text-muted"}`}>
              {TIPO_EVENTO_LABELS[entry.tipo_evento] ?? entry.tipo_evento}
            </span>
            <span className="text-xs text-zentinel-text-muted">{formatDate(entry.created_at)}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zentinel-text-muted hover:bg-zentinel-text/10 hover:text-zentinel-text transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted mb-1.5">Actor</p>
              <p className="font-medium text-zentinel-text text-sm">{entry.actor_nombre}</p>
              <p className="text-xs text-zentinel-text-muted mt-0.5">{entry.actor_email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted mb-1.5">Objetivo</p>
              <p className="text-zentinel-text text-sm leading-relaxed">{getObjetivoLabel(entry)}</p>
            </div>
          </div>

          {entry.motivo && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted mb-1.5">Motivo</p>
              <div className="flex gap-2 bg-zentinel-bg rounded-xl px-4 py-3 border-l-2 border-zentinel-gold/40">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-zentinel-gold shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                <p className="text-sm text-zentinel-text leading-relaxed">{entry.motivo}</p>
              </div>
            </div>
          )}

          {(entry.datos_anteriores || entry.datos_nuevos) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted mb-2">
                {entry.datos_anteriores ? "Cambios realizados" : "Información registrada"}
              </p>
              <DiffSection
                anterior={entry.datos_anteriores as Record<string, unknown> | null}
                nuevo={entry.datos_nuevos as Record<string, unknown> | null}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zentinel-gold-dark/10 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-zentinel-gold-dark/25 px-4 py-2 text-sm text-zentinel-text-muted hover:bg-zentinel-text/5 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Actor search autocomplete ───────────────────────────────────
function ActorSearch({
  staffList,
  value,
  onChange,
}: {
  staffList: Props["staffList"];
  value: number | "";
  onChange: (id: number | "") => void;
}) {
  const [query, setQuery]       = useState("");
  const [open, setOpen]         = useState(false);
  const containerRef            = useRef<HTMLDivElement>(null);

  const selectedStaff = value !== "" ? staffList.find((s) => s.id === value) : null;

  const filtered = query.trim()
    ? staffList.filter((s) =>
        `${s.nombre} ${s.apellido}`.toLowerCase().includes(query.toLowerCase()),
      )
    : staffList;

  const handleSelect = (s: Props["staffList"][number] | null) => {
    if (s) {
      onChange(s.id);
      setQuery(`${s.nombre} ${s.apellido}`);
    } else {
      onChange("");
      setQuery("");
    }
    setOpen(false);
  };

  useEffect(() => {
    if (selectedStaff) setQuery(`${selectedStaff.nombre} ${selectedStaff.apellido}`);
    else setQuery("");
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (!selectedStaff) setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [selectedStaff]);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1 min-w-[200px]">
      <label className="text-xs font-medium text-zentinel-text-muted">Actor (empleado)</label>
      <div className="relative">
        <input
          type="text"
          value={query}
          placeholder="Buscar por nombre…"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange("");
            setOpen(true);
          }}
          className="w-full rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-bg px-3 py-2 pr-8 text-sm text-zentinel-text placeholder:text-zentinel-text-muted/50 focus:outline-none focus:border-zentinel-gold/50"
        />
        {query && (
          <button
            onClick={() => handleSelect(null)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zentinel-text-muted hover:text-zentinel-text transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          <button
            onClick={() => handleSelect(null)}
            className="w-full px-3 py-2 text-left text-sm text-zentinel-text-muted hover:bg-zentinel-gold/5 transition-colors border-b border-zentinel-gold-dark/10"
          >
            Todos los empleados
          </button>
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s)}
              className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-zentinel-gold/5 ${
                value === s.id ? "bg-zentinel-gold/10 text-zentinel-gold font-semibold" : "text-zentinel-text"
              }`}
            >
              {s.nombre} {s.apellido}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────
export default function AuditoriaTab({ token, isAdmin, staffList }: Props) {
  const [result, setResult]         = useState<AuditLogResult | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [page, setPage]             = useState(1);
  const [modalEntry, setModalEntry] = useState<AuditLogEntry | null>(null);

  const [filterTipo,       setFilterTipo]       = useState("");
  const [filterActor,      setFilterActor]      = useState<number | "">("");
  const [filterFechaDesde, setFilterFechaDesde] = useState("");
  const [filterFechaHasta, setFilterFechaHasta] = useState("");

  const load = useCallback(
    async (p = 1) => {
      setLoading(true);
      setError("");
      try {
        const data = await getAuditLog(token, {
          tipo_evento:  filterTipo      || undefined,
          id_actor:     filterActor !== "" ? Number(filterActor) : undefined,
          fecha_desde:  filterFechaDesde || undefined,
          fecha_hasta:  filterFechaHasta ? `${filterFechaHasta}T23:59:59` : undefined,
          page:         p,
          limit:        PAGE_SIZE,
        });
        setResult(data);
        setPage(p);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar auditoría");
      } finally {
        setLoading(false);
      }
    },
    [token, filterTipo, filterActor, filterFechaDesde, filterFechaHasta],
  );

  useEffect(() => { void load(1); }, [token]);

  const handleApply = () => { setPage(1); void load(1); };
  const handleClear = () => {
    setFilterTipo("");
    setFilterActor("");
    setFilterFechaDesde("");
    setFilterFechaHasta("");
    setPage(1);
  };

  useEffect(() => {
    if (!filterTipo && !filterActor && !filterFechaDesde && !filterFechaHasta) {
      void load(1);
    }
  }, [filterTipo, filterActor, filterFechaDesde, filterFechaHasta]);

  const entries = result?.data ?? [];

  return (
    <div className="space-y-4">

      {/* ── Detail modal ────────────────────────────────────── */}
      {modalEntry && <DetailModal entry={modalEntry} onClose={() => setModalEntry(null)} />}

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-zentinel-gold-dark/15 bg-zentinel-dark-secondary p-4">
        <div className="flex flex-wrap gap-3 items-end">

          {/* Tipo de evento */}
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-xs font-medium text-zentinel-text-muted">Tipo de evento</label>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-bg px-3 py-2 text-sm text-zentinel-text focus:outline-none focus:border-zentinel-gold/50"
            >
              <option value="">Todos</option>
              {Object.entries(TIPO_EVENTO_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Actor search (admin only) */}
          {isAdmin && (
            <ActorSearch
              staffList={staffList}
              value={filterActor}
              onChange={setFilterActor}
            />
          )}

          {/* Fecha desde */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zentinel-text-muted">Desde</label>
            <input
              type="date"
              value={filterFechaDesde}
              onChange={(e) => setFilterFechaDesde(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-bg px-3 py-2 text-sm text-zentinel-text focus:outline-none focus:border-zentinel-gold/50"
            />
          </div>

          {/* Fecha hasta */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zentinel-text-muted">Hasta</label>
            <input
              type="date"
              value={filterFechaHasta}
              onChange={(e) => setFilterFechaHasta(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-bg px-3 py-2 text-sm text-zentinel-text focus:outline-none focus:border-zentinel-gold/50"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="rounded-lg bg-zentinel-gold/10 border border-zentinel-gold/25 px-4 py-2 text-sm font-medium text-zentinel-gold hover:bg-zentinel-gold/20 transition-colors"
            >
              Aplicar
            </button>
            <button
              onClick={handleClear}
              className="rounded-lg border border-zentinel-gold-dark/20 px-4 py-2 text-sm font-medium text-zentinel-text-muted hover:bg-zentinel-text/5 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* ── Results info ────────────────────────────────────── */}
      {result && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zentinel-text-muted">
            {result.total} evento{result.total !== 1 ? "s" : ""} encontrado{result.total !== 1 ? "s" : ""}
          </p>
          <p className="text-sm text-zentinel-text-muted">
            Página {result.page} de {result.totalPages}
          </p>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
      )}

      {/* ── Table ───────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-zentinel-gold/30 border-t-zentinel-gold animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-zentinel-text-muted text-sm">
          No hay eventos registrados para los filtros seleccionados.
        </div>
      ) : (
        <div className="rounded-xl border border-zentinel-gold-dark/15 bg-zentinel-dark-secondary overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zentinel-gold-dark/15 bg-zentinel-gold/5">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zentinel-text-muted uppercase tracking-wide">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zentinel-text-muted uppercase tracking-wide">Tipo</th>
                  {isAdmin && <th className="px-4 py-3 text-left text-xs font-semibold text-zentinel-text-muted uppercase tracking-wide">Actor</th>}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zentinel-text-muted uppercase tracking-wide">Objetivo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zentinel-text-muted uppercase tracking-wide">Motivo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zentinel-text-muted uppercase tracking-wide">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zentinel-gold-dark/10">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-zentinel-gold/5 transition-colors">
                    <td className="px-4 py-3 text-xs text-zentinel-text-muted whitespace-nowrap">{formatDate(entry.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_EVENTO_BADGE[entry.tipo_evento] ?? "bg-zentinel-text/10 text-zentinel-text-muted"}`}>
                        {TIPO_EVENTO_LABELS[entry.tipo_evento] ?? entry.tipo_evento}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="font-medium text-zentinel-text truncate max-w-[140px]">{entry.actor_nombre}</div>
                        <div className="text-xs text-zentinel-text-muted truncate max-w-[140px]">{entry.actor_email}</div>
                      </td>
                    )}
                    <td className="px-4 py-3 text-zentinel-text-muted text-xs max-w-[180px] truncate">
                      {getObjetivoLabel(entry)}
                    </td>
                    <td className="px-4 py-3 text-zentinel-text text-xs max-w-[200px]">
                      {entry.motivo
                        ? <span className="line-clamp-2">{entry.motivo}</span>
                        : <span className="text-zentinel-text-muted">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      {(entry.datos_anteriores || entry.datos_nuevos) && (
                        <button
                          onClick={() => setModalEntry(entry)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-zentinel-gold border border-zentinel-gold/25 bg-zentinel-gold/8 hover:bg-zentinel-gold/15 rounded-lg px-2.5 py-1 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                            <path fillRule="evenodd" d="M1.38 8a7 7 0 0 1 13.24 0 .75.75 0 0 1 0 .39 7 7 0 0 1-13.24 0A.75.75 0 0 1 1.38 8Zm5.12 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z" clipRule="evenodd" />
                          </svg>
                          Ver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────── */}
      {result && result.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => load(page - 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-zentinel-gold-dark/20 text-zentinel-text-muted disabled:opacity-40 hover:bg-zentinel-text/5 transition-colors"
          >
            ← Anterior
          </button>
          {Array.from({ length: result.totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2)
            .map((p) => (
              <button
                key={p}
                onClick={() => load(p)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  p === page
                    ? "border-zentinel-gold/40 bg-zentinel-gold/10 text-zentinel-gold font-semibold"
                    : "border-zentinel-gold-dark/20 text-zentinel-text-muted hover:bg-zentinel-text/5"
                }`}
              >
                {p}
              </button>
            ))}
          <button
            disabled={page >= result.totalPages}
            onClick={() => load(page + 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-zentinel-gold-dark/20 text-zentinel-text-muted disabled:opacity-40 hover:bg-zentinel-text/5 transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
