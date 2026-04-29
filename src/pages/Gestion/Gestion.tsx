import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUsuariosAdmin, getReportesAdmin, suspenderUsuario, reactivarUsuario, type UsuarioAdmin, type ReporteDispositivoAdmin } from "../../services/gestionService";
import { getAllTicketsAdmin, type TicketConUsuario, type TicketEstado, type TicketTipo } from "../../services/ticketService";
import { TIPO_LABELS, ESTADO_BADGE, ESTADO_LABELS } from "../Soporte/soporteConstants";
import AdminTicketDetail from "./components/AdminTicketDetail";

type Tab = "usuarios" | "reportes" | "soporte";

const estadoReporteStyle: Record<string, string> = {
  creado:     "bg-amber-500/15 text-amber-400",
  finalizado: "bg-green-500/15 text-green-400",
};

const estadoCuentaStyle = (activo: boolean) =>
  activo ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400";

const TICKET_TIPO_OPTIONS: Array<{ value: TicketTipo | ""; label: string }> = [
  { value: "",               label: "Todos los tipos" },
  { value: "consulta",       label: "Consulta" },
  { value: "reclamo",        label: "Reclamo" },
  { value: "soporte_tecnico",label: "Soporte Técnico" },
  { value: "facturacion",    label: "Facturación" },
  { value: "reporte",        label: "Reporte" },
];

const TICKET_ESTADO_OPTIONS: Array<{ value: TicketEstado | ""; label: string }> = [
  { value: "",            label: "Todos los estados" },
  { value: "abierto",     label: "Abierto" },
  { value: "en_progreso", label: "En Progreso" },
  { value: "resuelto",    label: "Resuelto" },
  { value: "cerrado",     label: "Cerrado" },
];

export default function Gestion() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) || "usuarios";
  const setActiveTab = (tab: Tab) => setSearchParams({ tab });

  // ─── Usuarios ────────────────────────────────────────────
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState("");

  // ─── Reportes ────────────────────────────────────────────
  const [reportes, setReportes] = useState<ReporteDispositivoAdmin[]>([]);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const [errorReportes, setErrorReportes] = useState("");

  // ─── User filters ─────────────────────────────────────────
  const [searchValue, setSearchValue] = useState("");
  const [searchMode, setSearchMode] = useState<"nombre" | "email">("nombre");
  const [searchEstado, setSearchEstado] = useState<"" | "activa" | "suspendida">("");

  // ─── User detail modal ───────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState<UsuarioAdmin | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ─── Toast ───────────────────────────────────────────────────
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setConfirmSuspend(false);
  };

  // ─── Tickets ─────────────────────────────────────────────
  const [tickets, setTickets] = useState<TicketConUsuario[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [errorTickets, setErrorTickets] = useState("");
  const [filterEstado, setFilterEstado] = useState<TicketEstado | "">("");
  const [filterTipo, setFilterTipo] = useState<TicketTipo | "">("");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    void loadUsuarios();
    void loadReportes();
    void loadTickets();
  }, [token]);

  const loadUsuarios = async () => {
    if (!token) return;
    setLoadingUsuarios(true);
    setErrorUsuarios("");
    try {
      const data = await getUsuariosAdmin(token);
      setUsuarios(data);
    } catch (err) {
      setErrorUsuarios(err instanceof Error ? err.message : "No se pudieron cargar los usuarios.");
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const loadReportes = async () => {
    if (!token) return;
    setLoadingReportes(true);
    setErrorReportes("");
    try {
      const data = await getReportesAdmin(token);
      setReportes(data);
    } catch (err) {
      setErrorReportes(err instanceof Error ? err.message : "No se pudieron cargar los reportes.");
    } finally {
      setLoadingReportes(false);
    }
  };

  const loadTickets = async () => {
    if (!token) return;
    setLoadingTickets(true);
    setErrorTickets("");
    try {
      const data = await getAllTicketsAdmin(
        token,
        filterEstado || filterTipo
          ? { estado: filterEstado || undefined, tipo: filterTipo || undefined }
          : undefined,
      );
      setTickets(data);
    } catch (err) {
      setErrorTickets(err instanceof Error ? err.message : "No se pudieron cargar los tickets.");
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleApplyFilters = () => {
    setTickets([]);
    void loadTickets();
  };

  const handleSuspend = async () => {
    if (!selectedUser || !token) return;
    setActionLoading(true);
    try {
      await suspenderUsuario(token, selectedUser.id);
      const updated: UsuarioAdmin = { ...selectedUser, estado_cuenta: "suspendida", activo: false };
      setUsuarios((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
      setSelectedUser(updated);
      setConfirmSuspend(false);
      showToast(`La cuenta de ${selectedUser.nombre} ${selectedUser.apellido} fue suspendida.`, "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error al suspender usuario", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivar = async () => {
    if (!selectedUser || !token) return;
    setActionLoading(true);
    try {
      await reactivarUsuario(token, selectedUser.id);
      const updated: UsuarioAdmin = { ...selectedUser, estado_cuenta: "activa", activo: true };
      setUsuarios((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
      setSelectedUser(updated);
      showToast(`La cuenta de ${selectedUser.nombre} ${selectedUser.apellido} fue reactivada.`, "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error al reactivar usuario", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTicketUpdated = (ticketId: number, newEstado: TicketEstado) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, estado: newEstado } : t)),
    );
  };

  const tabClass = (tab: Tab) =>
    `px-4 py-2 text-sm font-medium transition-colors rounded-md ${
      activeTab === tab
        ? "bg-zentinel-gold/10 text-zentinel-gold border border-zentinel-gold/20 font-bold"
        : "text-zentinel-text-muted hover:text-zentinel-gold-light hover:bg-white/5"
    }`;

  // ─── Derived ──────────────────────────────────────────────
  const filteredUsuarios = usuarios.filter((u) => {
    if (searchValue) {
      if (searchMode === "nombre") {
        if (!`${u.nombre} ${u.apellido}`.toLowerCase().includes(searchValue.toLowerCase())) return false;
      } else {
        if (!u.email.toLowerCase().includes(searchValue.toLowerCase())) return false;
      }
    }
    if (searchEstado) {
      const estado = u.activo ? "activa" : "suspendida";
      if (estado !== searchEstado) return false;
    }
    return true;
  });

  // ─── Stats header ─────────────────────────────────────────
  const totalUsuarios   = usuarios.length;
  const suspendidos     = usuarios.filter((u) => !u.activo).length;
  const reportesActivos = reportes.filter((r) => r.estado_reporte === "creado").length;
  const ticketsAbiertos = tickets.filter((t) => t.estado === "abierto").length;

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-5 py-3 text-sm font-medium shadow-xl ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.message}
        </div>
      )}

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={closeModal}>
          <div className="w-full max-w-sm rounded-xl border border-zentinel-gold-dark/30 bg-zentinel-dark-secondary p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-zentinel-text">Detalle de usuario</h3>
              <button onClick={closeModal} className="text-xl leading-none text-zentinel-text-muted transition-colors hover:text-zentinel-text">×</button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-zentinel-text-muted">Nombre</p>
                <p className="mt-0.5 font-semibold text-zentinel-text">{selectedUser.nombre} {selectedUser.apellido}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-zentinel-text-muted">Email</p>
                <p className="mt-0.5 text-sm text-zentinel-text">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-zentinel-text-muted">Rol</p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${selectedUser.id_rol === 2 ? "bg-zentinel-gold/15 text-zentinel-gold" : "bg-white/5 text-zentinel-text-muted"}`}>
                  {selectedUser.rol_descripcion ?? "usuario"}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-zentinel-text-muted">Estado</p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoCuentaStyle(selectedUser.activo)}`}>
                  {selectedUser.activo ? "Activa" : "Suspendida"}
                </span>
              </div>
            </div>
            {confirmSuspend && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm text-red-300">
                  ¿Confirmar suspensión de <span className="font-semibold">{selectedUser.nombre}</span>? El usuario no podrá iniciar sesión hasta ser reactivado.
                </p>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              {confirmSuspend ? (
                <>
                  <button onClick={() => setConfirmSuspend(false)} disabled={actionLoading} className="rounded-lg border border-zentinel-gold-dark/30 px-4 py-2 text-sm text-zentinel-text-muted transition-colors hover:bg-white/5 disabled:opacity-50">
                    Cancelar
                  </button>
                  <button onClick={handleSuspend} disabled={actionLoading} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50">
                    {actionLoading ? "Suspendiendo…" : "Sí, suspender"}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={closeModal} className="rounded-lg border border-zentinel-gold-dark/30 px-4 py-2 text-sm text-zentinel-text-muted transition-colors hover:bg-white/5">
                    Cerrar
                  </button>
                  {selectedUser.activo ? (
                    <button onClick={() => setConfirmSuspend(true)} className="rounded-lg bg-red-600/20 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-600/40">
                      Suspender cuenta
                    </button>
                  ) : (
                    <button onClick={handleReactivar} disabled={actionLoading} className="rounded-lg bg-green-600/20 px-4 py-2 text-sm font-semibold text-green-400 transition-colors hover:bg-green-600/40 disabled:opacity-50">
                      {actionLoading ? "Reactivando…" : "Reactivar cuenta"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <header>
        <h1 className="text-3xl font-bold text-zentinel-gold">Gestión de Backoffice</h1>
        <p className="mt-2 text-zentinel-text-muted">
          Administración centralizada de usuarios, reportes y tickets de soporte.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Usuarios",          value: totalUsuarios   || "—", color: "text-white" },
          { label: "Suspendidos",        value: suspendidos     || "—", color: "text-red-400" },
          { label: "Reportes activos",   value: reportesActivos || "—", color: "text-amber-400" },
          { label: "Tickets abiertos",   value: ticketsAbiertos || "—", color: "text-zentinel-gold" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary p-5 shadow-lg shadow-black/20"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted">{s.label}</p>
            <p className={`mt-2 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zentinel-gold-dark/20 pb-2">
        <button className={tabClass("usuarios")} onClick={() => setActiveTab("usuarios")}>Usuarios</button>
        <button className={tabClass("reportes")} onClick={() => setActiveTab("reportes")}>Reportes de Dispositivo</button>
        <button className={tabClass("soporte")}  onClick={() => setActiveTab("soporte")}>Tickets de Soporte</button>
      </div>

      {/* ── Tab: Usuarios ─────────────────────────────────── */}
      {activeTab === "usuarios" && (
        <div className="rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary shadow-lg shadow-black/20">
          <div className="flex items-center justify-between border-b border-zentinel-gold-dark/20 px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zentinel-gold">Usuarios</h2>
            <span className="rounded-full bg-zentinel-gold/10 px-3 py-0.5 text-xs text-zentinel-gold">
              {loadingUsuarios ? "Cargando..." : `${filteredUsuarios.length} registros`}
            </span>
          </div>

          {/* Filtros */}
          <div className="flex flex-col gap-3 border-b border-zentinel-gold-dark/10 px-6 py-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 overflow-hidden rounded-lg border border-zentinel-gold-dark/20">
              <button
                onClick={() => setSearchMode("nombre")}
                className={`shrink-0 px-3 py-2 text-xs font-semibold transition-colors ${searchMode === "nombre" ? "bg-zentinel-gold/15 text-zentinel-gold" : "text-zentinel-text-muted hover:bg-white/5"}`}
              >
                Nombre
              </button>
              <button
                onClick={() => setSearchMode("email")}
                className={`shrink-0 border-l border-zentinel-gold-dark/20 px-3 py-2 text-xs font-semibold transition-colors ${searchMode === "email" ? "bg-zentinel-gold/15 text-zentinel-gold" : "text-zentinel-text-muted hover:bg-white/5"}`}
              >
                Email
              </button>
              <input
                type="text"
                placeholder={searchMode === "nombre" ? "Buscar por nombre…" : "Buscar por email…"}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="min-w-0 flex-1 border-l border-zentinel-gold-dark/20 bg-zentinel-dark px-3 py-2 text-sm text-zentinel-text placeholder-zentinel-text-muted outline-none"
              />
            </div>
            <select
              value={searchEstado}
              onChange={(e) => setSearchEstado(e.target.value as "" | "activa" | "suspendida")}
              className="rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-dark px-3 py-2 text-sm text-zentinel-text outline-none transition-colors focus:border-zentinel-gold/50"
            >
              <option value="">Todos los estados</option>
              <option value="activa">Activo</option>
              <option value="suspendida">Suspendido</option>
            </select>
          </div>

          {errorUsuarios ? (
            <p className="px-6 py-4 text-sm text-red-400">{errorUsuarios}</p>
          ) : loadingUsuarios ? (
            <p className="px-6 py-6 text-sm text-zentinel-text-muted text-center">Cargando usuarios...</p>
          ) : filteredUsuarios.length === 0 ? (
            <p className="px-6 py-6 text-sm text-zentinel-text-muted text-center">No se encontraron usuarios.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zentinel-gold-dark/10 text-left text-xs uppercase tracking-wider text-zentinel-text-muted">
                    <th className="px-6 py-3">Nombre</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3 text-center">Rol</th>
                    <th className="px-6 py-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zentinel-gold-dark/10">
                  {filteredUsuarios.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => { setSelectedUser(u); setConfirmSuspend(false); }}
                      className="cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-zentinel-text">{u.nombre} {u.apellido}</td>
                      <td className="px-6 py-3 text-zentinel-text-muted">{u.email}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.id_rol === 2
                            ? "bg-zentinel-gold/15 text-zentinel-gold"
                            : "bg-white/5 text-zentinel-text-muted"
                        }`}>
                          {u.rol_descripcion ?? "usuario"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoCuentaStyle(u.activo)}`}>
                          {u.activo ? "activa" : "suspendida"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Reportes ─────────────────────────────────── */}
      {activeTab === "reportes" && (
        <div className="rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary shadow-lg shadow-black/20">
          <div className="flex items-center justify-between border-b border-zentinel-gold-dark/20 px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zentinel-gold">Reportes de Dispositivo</h2>
            <span className="rounded-full bg-red-500/10 px-3 py-0.5 text-xs text-red-400">
              {loadingReportes ? "Cargando..." : `${reportes.filter((r) => r.estado_reporte === "creado").length} activos`}
            </span>
          </div>
          {errorReportes ? (
            <p className="px-6 py-4 text-sm text-red-400">{errorReportes}</p>
          ) : loadingReportes ? (
            <p className="px-6 py-6 text-sm text-zentinel-text-muted text-center">Cargando reportes...</p>
          ) : (
            <div className="divide-y divide-zentinel-gold-dark/10">
              {reportes.length === 0 ? (
                <p className="px-6 py-6 text-sm text-zentinel-text-muted text-center">Sin reportes.</p>
              ) : (
                reportes.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zentinel-text">
                        {r.tipo_reporte} — {r.nombre} {r.apellido}
                      </p>
                      <p className="text-xs text-zentinel-text-muted">
                        {r.email} ·{" "}
                        {new Date(r.fecha_creacion).toLocaleDateString("es-AR", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className={`ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoReporteStyle[r.estado_reporte]}` }>
                      {r.estado_reporte === "creado" ? "Activo" : "Finalizado"}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Soporte ──────────────────────────────────── */}
      {activeTab === "soporte" && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted mb-1">Estado</label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value as TicketEstado | "")}
                className="rounded-md border border-zentinel-gold-dark/30 bg-zentinel-dark px-3 py-2 text-sm text-zentinel-text focus:border-zentinel-gold focus:outline-none"
              >
                {TICKET_ESTADO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted mb-1">Tipo</label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value as TicketTipo | "")}
                className="rounded-md border border-zentinel-gold-dark/30 bg-zentinel-dark px-3 py-2 text-sm text-zentinel-text focus:border-zentinel-gold focus:outline-none"
              >
                {TICKET_TIPO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleApplyFilters}
              disabled={loadingTickets}
              className="rounded-md bg-zentinel-gold px-4 py-2 text-sm font-bold text-zentinel-dark transition-colors hover:bg-zentinel-gold-light disabled:opacity-60"
            >
              {loadingTickets ? "Cargando..." : "Filtrar"}
            </button>
          </div>

          {/* Lista */}
          <div className="rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary shadow-lg shadow-black/20">
            <div className="flex items-center justify-between border-b border-zentinel-gold-dark/20 px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zentinel-gold">Tickets de Soporte</h2>
              <span className="rounded-full bg-zentinel-gold/10 px-3 py-0.5 text-xs text-zentinel-gold">
                {loadingTickets ? "Cargando..." : `${tickets.length} tickets`}
              </span>
            </div>

            {errorTickets ? (
              <p className="px-6 py-4 text-sm text-red-400">{errorTickets}</p>
            ) : loadingTickets ? (
              <p className="px-6 py-6 text-sm text-zentinel-text-muted text-center">Cargando tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="px-6 py-6 text-sm text-zentinel-text-muted text-center">No hay tickets con los filtros seleccionados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zentinel-gold-dark/10 text-left text-xs uppercase tracking-wider text-zentinel-text-muted">
                      <th className="px-6 py-3">#</th>
                      <th className="px-6 py-3">Usuario</th>
                      <th className="px-6 py-3">Asunto</th>
                      <th className="px-6 py-3 text-center">Tipo</th>
                      <th className="px-6 py-3 text-center">Estado</th>
                      <th className="px-6 py-3">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zentinel-gold-dark/10">
                    {tickets.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTicketId(t.id)}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-3 text-zentinel-text-muted">{t.id}</td>
                        <td className="px-6 py-3">
                          <p className="font-medium text-zentinel-text">{t.nombre} {t.apellido}</p>
                          <p className="text-xs text-zentinel-text-muted">{t.email}</p>
                        </td>
                        <td className="px-6 py-3 max-w-[200px]">
                          <p className="text-zentinel-text truncate">{t.asunto}</p>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-zentinel-text-muted">
                            {TIPO_LABELS[t.tipo]}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_BADGE[t.estado]}`}>
                            {ESTADO_LABELS[t.estado]}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-xs text-zentinel-text-muted whitespace-nowrap">
                          {new Date(t.fecha_creacion).toLocaleDateString("es-AR", {
                            day: "2-digit", month: "2-digit", year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTicketId !== null && token ? (
        <AdminTicketDetail
          ticketId={selectedTicketId}
          token={token}
          onClose={() => setSelectedTicketId(null)}
          onUpdated={handleTicketUpdated}
        />
      ) : null}
    </div>
  );
}
