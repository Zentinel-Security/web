import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchMetricas, type MetricasData } from "../../services/metricasService";
import MetricasHistorico from "./MetricasHistorico";

const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);
const IconGroup = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
  </svg>
);
const IconMembers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
  </svg>
);
const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.25-8.25-3.286Z" />
  </svg>
);
const IconZone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);
const IconBell = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);
const IconPanic = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);

const PIE_PALETTE = ["#6b7280","#3b82f6","#fbbf24","#10b981","#f97316","#8b5cf6","#ef4444","#06b6d4"];

const formatPlanLabel = (name: string) =>
  name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function PieChart({ data }: { data: { plan: string; cantidad: number; color?: string }[] }) {
  const total = data.reduce((acc, d) => acc + d.cantidad, 0);
  if (total === 0) {
    return (
      <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-zentinel-gold-dark/20">
        <span className="text-xs text-zentinel-text-muted">Sin datos</span>
      </div>
    );
  }

  let cumulative = 0;
  const slices = data.map((d) => {
    const pct = d.cantidad / total;
    const start = cumulative;
    cumulative += pct;
    return { ...d, start, end: cumulative, pct };
  });

  const toXY = (pct: number, r: number) => {
    const angle = pct * 2 * Math.PI - Math.PI / 2;
    return { x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle) };
  };

  return (
    <svg viewBox="0 0 100 100" className="h-40 w-40">
      {slices.map((s) => {
        if (s.pct === 0) return null;
        const r = 40;
        // Edge case: si un plan tiene el 100% de usuarios el arco es degenerado → dibujamos círculo completo
        if (s.pct >= 0.9999) {
          return (
            <circle
              key={s.plan}
              cx="50" cy="50" r={r}
              fill={s.color ?? "#6b7280"}
              opacity={0.85}
            />
          );
        }
        const s1 = toXY(s.start, r);
        const s2 = toXY(s.end, r);
        const largeArc = s.pct > 0.5 ? 1 : 0;
        const path = [
          `M 50 50`,
          `L ${s1.x} ${s1.y}`,
          `A ${r} ${r} 0 ${largeArc} 1 ${s2.x} ${s2.y}`,
          `Z`,
        ].join(" ");
        return (
          <path
            key={s.plan}
            d={path}
            fill={s.color ?? "#6b7280"}
            opacity={0.85}
          />
        );
      })}
      <circle cx="50" cy="50" r="22" fill="var(--color-zentinel-dark-secondary)" />
      <text x="50" y="47" textAnchor="middle" fontSize="10" fill="var(--color-zentinel-text)" fontWeight="bold">
        {total}
      </text>
      <text x="50" y="57" textAnchor="middle" fontSize="6" fill="var(--color-zentinel-text-muted)">
        usuarios
      </text>
    </svg>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted">
          {label}
        </p>
        <span className="text-zentinel-gold opacity-70">{icon}</span>
      </div>
      <p className="text-4xl font-extrabold text-zentinel-text leading-none">{value}</p>
      <p className="text-xs text-zentinel-text-muted">{sub}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary p-5 space-y-3">
      <div className="h-3 w-2/3 rounded bg-zentinel-gold-dark/20" />
      <div className="h-9 w-1/2 rounded bg-zentinel-gold-dark/15" />
      <div className="h-2 w-3/4 rounded bg-zentinel-gold-dark/10" />
    </div>
  );
}

function MetricasTiempoReal() {
  const { token } = useAuth();
  const [data, setData] = useState<MetricasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(() =>
    new Date().toLocaleString("es-AR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  );

  const refresh = () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchMetricas(token)
      .then((d) => {
        setData(d);
        setUpdatedAt(new Date().toLocaleString("es-AR", {
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        }));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchMetricas(token)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-zentinel-text-muted text-sm">
          Datos al{" "}
          <span className="text-zentinel-gold font-semibold">{updatedAt}</span>
        </p>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl border border-zentinel-gold-dark/30 px-4 py-2 text-sm font-semibold text-zentinel-text-muted transition-colors hover:border-zentinel-gold/50 hover:text-zentinel-gold disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}>
            <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
          </svg>
          Actualizar
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
          Error al cargar métricas: {error}
        </div>
      )}

      {/* Fila 1 — Red y adopción */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zentinel-text-muted">
          Red y adopción
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : data ? (
            <>
              <KpiCard
                label="Usuarios activos"
                value={data.usuarios.activos}
                sub={`de ${data.usuarios.total} registrados`}
                icon={<IconUsers />}
              />
              <KpiCard
                label="Grupos / usuario"
                value={data.grupos.promedio_por_usuario.toFixed(2)}
                sub="promedio de grupos creados"
                icon={<IconGroup />}
              />
              <KpiCard
                label="Integrantes / grupo"
                value={data.grupos.promedio_integrantes.toFixed(2)}
                sub="promedio de miembros por grupo"
                icon={<IconMembers />}
              />
              <KpiCard
                label="Zentinelas / usuario"
                value={data.zentinelas.promedio_por_usuario.toFixed(2)}
                sub="promedio de contactos de confianza"
                icon={<IconShield />}
              />
            </>
          ) : null}
        </div>
      </section>

      {/* Fila 2 — Actividad del producto */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zentinel-text-muted">
          Actividad del producto
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : data ? (
            <>
              <KpiCard
                label="Zonas seguras configuradas"
                value={data.zonas.activas}
                sub="total activas en el sistema"
                icon={<IconZone />}
              />
              <KpiCard
                label="Alertas de zona (mes)"
                value={data.alertas.zona_mes}
                sub="entradas y salidas registradas este mes"
                icon={<IconBell />}
              />
              <KpiCard
                label="Alertas de pánico (mes)"
                value={data.alertas.panico_mes}
                sub="activaciones del botón SOS este mes"
                icon={<IconPanic />}
              />
            </>
          ) : null}
        </div>
      </section>

      {/* Fila 3 — Monetización + Soporte */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Torta de planes */}
        <div className="rounded-xl border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary p-6">
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-zentinel-gold">
            Distribución de planes
          </p>
          {loading ? (
            <div className="flex items-center gap-8">
              <div className="h-40 w-40 animate-pulse rounded-full bg-zentinel-gold-dark/15" />
              <div className="space-y-3 flex-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-zentinel-gold-dark/20 animate-pulse" />
                    <div className="h-3 flex-1 rounded bg-zentinel-gold-dark/15 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : data ? (
            (() => {
              const activePlanes = data.planes.filter((p) => p.activo);
              const inactivePlanes = data.planes.filter((p) => !p.activo);
              const totalActivos = activePlanes.reduce((a, b) => a + b.cantidad, 0);
              const totalInactivos = inactivePlanes.reduce((a, b) => a + b.cantidad, 0);
              const pagos = activePlanes
                .filter((p) => p.plan !== "gratuito")
                .reduce((a, b) => a + b.cantidad, 0);
              const conversionRate = totalActivos > 0 ? ((pagos / totalActivos) * 100).toFixed(1) : "0";
              const pieData = activePlanes.map((p, i) => ({ ...p, color: PIE_PALETTE[i % PIE_PALETTE.length] }));
              return (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <PieChart data={pieData} />
                    <div className="w-full space-y-1">
                      <ul className="space-y-2.5">
                        {pieData.map((p) => {
                          const pct = totalActivos > 0 ? ((p.cantidad / totalActivos) * 100).toFixed(1) : "0";
                          return (
                            <li key={p.plan} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="h-3 w-3 flex-shrink-0 rounded-full"
                                  style={{ backgroundColor: p.color }}
                                />
                                <span className="text-sm text-zentinel-text truncate">
                                  {formatPlanLabel(p.plan)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-sm font-bold text-zentinel-text">{p.cantidad}</span>
                                <span className="text-xs text-zentinel-text-muted">({pct}%)</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      {inactivePlanes.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-zentinel-gold-dark/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="h-3 w-3 flex-shrink-0 rounded-full bg-zinc-600/50" />
                              <span className="text-xs text-zentinel-text-muted/60">
                                Planes inactivos ({inactivePlanes.length})
                              </span>
                            </div>
                            {totalInactivos > 0 && (
                              <span className="text-xs text-zentinel-text-muted/60 flex-shrink-0">
                                {totalInactivos} usuario{totalInactivos !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg border border-zentinel-gold/30 bg-zentinel-gold/5 px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted">Tasa de conversión a pago</p>
                      <p className="text-xs text-zentinel-text-muted mt-0.5">{pagos} de {totalActivos} usuarios en plan pago</p>
                    </div>
                    <p className="text-3xl font-extrabold text-zentinel-gold">{conversionRate}%</p>
                  </div>
                </div>
              );
            })()
          ) : null}
        </div>

        {/* Tickets resueltos */}
        <div className="rounded-xl border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary p-6">
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-zentinel-gold">
            Soporte — resolución de tickets
          </p>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 w-1/3 rounded bg-zentinel-gold-dark/15" />
              <div className="h-3 w-full rounded-full bg-zentinel-gold-dark/20" />
              <div className="h-3 w-1/2 rounded bg-zentinel-gold-dark/10" />
            </div>
          ) : data ? (
            (() => {
              const { total, resueltos } = data.tickets;
              const pct = total > 0 ? Math.round((resueltos / total) * 100) : 0;
              return (
                <div className="space-y-5">
                  <div className="flex items-end gap-3">
                    <p className="text-5xl font-extrabold text-zentinel-text leading-none">{pct}%</p>
                    <p className="text-zentinel-text-muted text-sm pb-1">tasa de resolución</p>
                  </div>
                  <div className="h-3 w-full rounded-full bg-zentinel-gold-dark/15 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-zentinel-gold transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-2xl font-bold text-zentinel-text">{resueltos}</p>
                      <p className="text-xs text-zentinel-text-muted">resueltos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-zentinel-text">{total}</p>
                      <p className="text-xs text-zentinel-text-muted">totales</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-zentinel-text">{total - resueltos}</p>
                      <p className="text-xs text-zentinel-text-muted">pendientes</p>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : null}
        </div>
      </section>
    </div>
  );
}

// ─── Wrapper con tabs ───────────────────────────────────────────────

type TabId = "tiempo-real" | "historico";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "tiempo-real",
    label: "Tiempo Real",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5 9 8.25 13.5 12.75 20.25 6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6h6v6" />
      </svg>
    ),
  },
  {
    id: "historico",
    label: "Análisis Histórico",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
];

export default function Metricas() {
  const [activeTab, setActiveTab] = useState<TabId>("tiempo-real");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-zentinel-gold">Métricas del Sistema</h1>
        <p className="mt-1 text-zentinel-text-muted text-sm">
          Panel de control y análisis de la plataforma
        </p>
      </header>

      {/* Tabs */}
      <div className="border-b border-zentinel-gold-dark/20">
        <nav className="flex gap-1 -mb-px">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                  active
                    ? "border-zentinel-gold text-zentinel-gold"
                    : "border-transparent text-zentinel-text-muted hover:text-zentinel-text hover:border-zentinel-gold-dark/40"
                }`}
                aria-selected={active}
                role="tab"
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de la tab activa */}
      <div role="tabpanel">
        {activeTab === "tiempo-real" ? <MetricasTiempoReal /> : <MetricasHistorico />}
      </div>
    </div>
  );
}
