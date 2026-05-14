import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getUsuariosAdmin, getReportesAdmin, suspenderUsuario, reactivarUsuario, cambiarRolUsuario, type UsuarioAdmin, type ReporteDispositivoAdmin } from "../../services/gestionService";
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

const ROL_LABELS: Record<number, string> = { 1: 'usuario', 2: 'admin', 3: 'usuario', 4: 'manager', 5: 'soporte' };
const ROLES_ASIGNABLES = [{ id: 3, label: 'Usuario' }, { id: 4, label: 'Manager' }, { id: 5, label: 'Soporte' }];

const PAGE_SIZE = 10;

export default function Gestion() {
  const { token, user: authUser, isSupport } = useAuth();
  const isAdmin = authUser?.id_rol === 2;
  const { showToast } = useToast();
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
  const [rolCambio, setRolCambio] = useState<number | "">("");

  // ─── Pagination ──────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  const closeModal = () => {
    setSelectedUser(null);
    setConfirmSuspend(false);
    setRolCambio("");
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

  const handleCambiarRol = async () => {
    if (!selectedUser || !token || rolCambio === "") return;
    setActionLoading(true);
    try {
      const updated = await cambiarRolUsuario(token, selectedUser.id, rolCambio);
      const updatedUser: UsuarioAdmin = {
        ...selectedUser,
        id_rol: updated.id_rol,
        rol_descripcion: ROL_LABELS[updated.id_rol] ?? null,
      };
      setUsuarios((prev) => prev.map((u) => (u.id === selectedUser.id ? updatedUser : u)));
      setSelectedUser(updatedUser);
      setRolCambio("");
      showToast(`Rol de ${selectedUser.nombre} actualizado a ${ROL_LABELS[rolCambio]}.`, "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error al cambiar el rol", "error");
    } finally {
      setActionLoading(false);
    }
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
        : "text-zentinel-text-muted hover:text-zentinel-gold-light hover:bg-zentinel-text/5"
    }`;

  // ─── CSV Export ───────────────────────────────────────────────
  const exportCSV = useCallback(() => {
    const headers = ["ID", "Nombre", "Apellido", "Email", "Rol", "Estado"];
    const rows = usuarios.map((u) => [
      u.id,
      u.nombre,
      u.apellido,
      u.email,
      u.rol_descripcion ?? ROL_LABELS[u.id_rol] ?? "usuario",
      u.activo ? "activa" : "suspendida",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usuarios-zentinel-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [usuarios]);

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

  const totalPages = Math.max(1, Math.ceil(filteredUsuarios.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUsuarios = filteredUsuarios.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ─── Stats header ─────────────────────────────────────────
  const totalUsuarios   = usuarios.length;
  const suspendidos     = usuarios.filter((u) => !u.activo).length;
  const reportesActivos = reportes.filter((r) => r.estado_reporte === "creado").length;
  const ticketsAbiertos = tickets.filter((t) => t.estado === "abierto").length;

  return (
    <div className="space-y-6">

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={closeModal}>
          <div className="w-full max-w-md rounded-2xl border border-zentinel-gold-dark/25 bg-zentinel-dark-secondary shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="relative px-6 pt-6 pb-5 border-b border-zentinel-gold-dark/15" style={{background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-zentinel-gold) 6%, transparent), transparent)'}}>
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-zentinel-text-muted transition-colors hover:bg-zentinel-text/10 hover:text-zentinel-text"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-4 pr-8">
                {/* Avatar */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-zentinel-gold/25 overflow-hidden flex items-center justify-center bg-zentinel-gold/10">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-zentinel-gold select-none">
                      {selectedUser.nombre.charAt(0).toUpperCase()}{selectedUser.apellido.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Name + email + badges */}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-zentinel-text text-base truncate leading-tight">
                    {selectedUser.nombre} {selectedUser.apellido}
                  </p>
                  <p className="text-xs text-zentinel-text-muted truncate mt-0.5">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Rol badge con colores por rol */}
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      selectedUser.id_rol === 2 ? "bg-amber-400/15 text-amber-400" :
                      selectedUser.id_rol === 4 ? "bg-blue-400/15 text-blue-400" :
                      selectedUser.id_rol === 5 ? "bg-purple-400/15 text-purple-400" :
                      "bg-zentinel-text/8 text-zentinel-text-muted"
                    }`}>
                      {ROL_LABELS[selectedUser.id_rol] ?? "usuario"}
                    </span>
                    {/* Estado badge */}
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${selectedUser.activo ? "bg-green-500/12 text-green-400" : "bg-red-500/12 text-red-400"}`}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{background: 'currentColor'}} />
                      {selectedUser.activo ? "Activa" : "Suspendida"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Body ───────────────────────────────────────────── */}
            <div className="px-6 py-5 space-y-5">

              {/* Role picker — solo admin, sobre usuarios no-admin */}
              {isAdmin && selectedUser.id_rol !== 2 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted mb-3">Cambiar rol</p>
                  <div className="flex flex-wrap gap-2">
                    {ROLES_ASIGNABLES.map((r) => {
                      const isCurrent = r.id === selectedUser.id_rol;
                      const isSelected = r.id === rolCambio;
                      return (
                        <button
                          key={r.id}
                          onClick={() => setRolCambio(isCurrent ? "" : (isSelected ? "" : r.id))}
                          disabled={isCurrent}
                          className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                            isCurrent
                              ? "border-zentinel-gold-dark/30 bg-zentinel-gold/10 text-zentinel-gold/50 cursor-default"
                              : isSelected
                              ? "border-zentinel-gold bg-zentinel-gold/15 text-zentinel-gold shadow-sm"
                              : "border-zentinel-gold-dark/25 bg-transparent text-zentinel-text-muted hover:border-zentinel-gold/50 hover:text-zentinel-text hover:bg-zentinel-text/5"
                          }`}
                        >
                          {isCurrent && <span className="mr-1 text-xs opacity-70">✓</span>}
                          {r.label}
                        </button>
                      );
                    })}
                  </div>

                  {rolCambio !== "" && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-zentinel-gold/25 bg-zentinel-gold/5 px-4 py-2.5">
                      <p className="text-sm text-zentinel-text-muted">
                        Asignar rol <span className="font-semibold text-zentinel-gold">{ROLES_ASIGNABLES.find(r => r.id === rolCambio)?.label}</span>
                      </p>
                      <button
                        onClick={handleCambiarRol}
                        disabled={actionLoading}
                        className="ml-4 rounded-lg bg-zentinel-gold px-4 py-1.5 text-xs font-bold text-zentinel-dark transition-colors hover:bg-zentinel-gold-light disabled:opacity-50"
                      >
                        {actionLoading ? "Guardando…" : "Confirmar"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm suspend warning */}
              {confirmSuspend && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  <p className="text-sm text-red-300 leading-relaxed">
                    ¿Suspender a <span className="font-semibold">{selectedUser.nombre} {selectedUser.apellido}</span>? No podrá iniciar sesión hasta ser reactivado.
                  </p>
                </div>
              )}
            </div>

            {/* ── Footer actions ──────────────────────────────────── */}
            <div className="px-6 pb-5 flex items-center justify-between border-t border-zentinel-gold-dark/10 pt-4">
              <button onClick={closeModal} className="text-sm text-zentinel-text-muted transition-colors hover:text-zentinel-text">
                Cerrar
              </button>

              {isSupport && (
                <div className="flex gap-2">
                  {confirmSuspend ? (
                    <>
                      <button onClick={() => setConfirmSuspend(false)} disabled={actionLoading} className="rounded-lg border border-zentinel-gold-dark/30 px-4 py-2 text-sm text-zentinel-text-muted transition-colors hover:bg-zentinel-text/5 disabled:opacity-50">
                        Cancelar
                      </button>
                      <button onClick={handleSuspend} disabled={actionLoading} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50">
                        {actionLoading ? "Suspendiendo…" : "Sí, suspender"}
                      </button>
                    </>
                  ) : selectedUser.activo ? (
                    <button
                      onClick={() => setConfirmSuspend(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Suspender
                    </button>
                  ) : (
                    <button
                      onClick={handleReactivar}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400 transition-all hover:border-green-500/50 hover:bg-green-500/20 disabled:opacity-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      {actionLoading ? "Reactivando…" : "Reactivar"}
                    </button>
                  )}
                </div>
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
          { label: "Usuarios",          value: totalUsuarios   || "—", color: "text-zentinel-text" },
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zentinel-gold-dark/20 px-6 py-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zentinel-gold">Usuarios</h2>
              <span className="rounded-full bg-zentinel-gold/10 px-3 py-0.5 text-xs text-zentinel-gold">
                {loadingUsuarios ? "Cargando..." : `${filteredUsuarios.length} registros`}
              </span>
            </div>
            {!loadingUsuarios && usuarios.length > 0 && (
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zentinel-gold-dark/30 px-3 py-1.5 text-xs font-semibold text-zentinel-text-muted transition-colors hover:border-zentinel-gold/40 hover:text-zentinel-gold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                Exportar CSV
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex flex-col gap-3 border-b border-zentinel-gold-dark/10 px-6 py-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 overflow-hidden rounded-lg border border-zentinel-gold-dark/20">
              <button
                onClick={() => setSearchMode("nombre")}
                className={`shrink-0 px-3 py-2 text-xs font-semibold transition-colors ${searchMode === "nombre" ? "bg-zentinel-gold/15 text-zentinel-gold" : "text-zentinel-text-muted hover:bg-zentinel-text/5"}`}
              >
                Nombre
              </button>
              <button
                onClick={() => setSearchMode("email")}
                className={`shrink-0 border-l border-zentinel-gold-dark/20 px-3 py-2 text-xs font-semibold transition-colors ${searchMode === "email" ? "bg-zentinel-gold/15 text-zentinel-gold" : "text-zentinel-text-muted hover:bg-zentinel-text/5"}`}
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
            <div className="divide-y divide-zentinel-gold-dark/10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-zentinel-gold-dark/15 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-1/3 rounded bg-zentinel-gold-dark/20" />
                    <div className="h-2.5 w-1/2 rounded bg-zentinel-gold-dark/10" />
                  </div>
                  <div className="h-5 w-16 rounded-full bg-zentinel-gold-dark/15" />
                  <div className="h-5 w-16 rounded-full bg-zentinel-gold-dark/15" />
                </div>
              ))}
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zentinel-gold/8 text-zentinel-gold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-zentinel-text mb-1">Sin resultados</p>
              <p className="text-xs text-zentinel-text-muted">No se encontraron usuarios con esos filtros.</p>
            </div>
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
                  {paginatedUsuarios.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => { setSelectedUser(u); setConfirmSuspend(false); }}
                      className="cursor-pointer hover:bg-zentinel-text/5 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-zentinel-gold/10 border border-zentinel-gold/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {u.avatar ? (
                              <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-zentinel-gold">{(u.nombre.charAt(0) + u.apellido.charAt(0)).toUpperCase()}</span>
                            )}
                          </div>
                          <span className="font-medium text-zentinel-text">{u.nombre} {u.apellido}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-zentinel-text-muted">{u.email}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.id_rol === 2 ? "bg-amber-400/15 text-amber-400"
                          : u.id_rol === 4 ? "bg-blue-400/15 text-blue-400"
                          : u.id_rol === 5 ? "bg-purple-400/15 text-purple-400"
                          : "bg-zentinel-text/5 text-zentinel-text-muted"
                        }`}>
                          {u.rol_descripcion ?? ROL_LABELS[u.id_rol] ?? "usuario"}
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
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-zentinel-gold-dark/10 px-6 py-3">
                  <p className="text-xs text-zentinel-text-muted">
                    Página <span className="font-semibold text-zentinel-text">{safePage}</span> de{" "}
                    <span className="font-semibold text-zentinel-text">{totalPages}</span>
                    {" "}·{" "}{filteredUsuarios.length} usuarios
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="rounded-lg border border-zentinel-gold-dark/20 px-3 py-1.5 text-xs font-semibold text-zentinel-text-muted transition-colors hover:border-zentinel-gold/40 hover:text-zentinel-gold disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className="rounded-lg border border-zentinel-gold-dark/20 px-3 py-1.5 text-xs font-semibold text-zentinel-text-muted transition-colors hover:border-zentinel-gold/40 hover:text-zentinel-gold disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
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
                  <div key={r.id} className="flex items-center justify-between px-6 py-4 hover:bg-zentinel-text/5 transition-colors">
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
                        className="hover:bg-zentinel-text/5 transition-colors cursor-pointer"
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
                          <span className="rounded-full bg-zentinel-text/5 px-2.5 py-0.5 text-xs text-zentinel-text-muted">
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
          canEdit={isSupport}
        />
      ) : null}
    </div>
  );
}
