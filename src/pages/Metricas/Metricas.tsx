// src/pages/Metricas/Metricas.tsx

const kpis = [
  { label: "Usuarios Registrados", value: "2,847", delta: "+8%", deltaUp: true, sub: "vs mes anterior" },
  { label: "Dispositivos Activos", value: "1,245", delta: "+12%", deltaUp: true, sub: "vs mes anterior" },
  { label: "Alertas Hoy", value: "23", delta: "5 pendientes", deltaUp: false, sub: "requieren atención" },
  { label: "Reportes de Robo (mes)", value: "41", delta: "-3%", deltaUp: false, sub: "vs mes anterior" },
  { label: "Grupos Activos", value: "318", delta: "+5%", deltaUp: true, sub: "vs mes anterior" },
  { label: "Uptime Servidor", value: "99.9%", delta: "Estable", deltaUp: true, sub: "sin incidentes" },
];

const recentAlerts = [
  { id: 1, usuario: "lucas.m@gmail.com", tipo: "Dispositivo robado", fecha: "Hoy 14:23", estado: "Pendiente" },
  { id: 2, usuario: "sofia.r@outlook.com", tipo: "SOS activado", fecha: "Hoy 13:05", estado: "Atendido" },
  { id: 3, usuario: "carlos.b@zentinel.app", tipo: "Zona insegura", fecha: "Hoy 11:48", estado: "Atendido" },
  { id: 4, usuario: "maria.g@gmail.com", tipo: "Dispositivo robado", fecha: "Ayer 22:10", estado: "Pendiente" },
  { id: 5, usuario: "juan.p@hotmail.com", tipo: "Batería crítica", fecha: "Ayer 18:33", estado: "Atendido" },
];

const activityByDay = [
  { dia: "Lun", alertas: 12, reportes: 4 },
  { dia: "Mar", alertas: 8, reportes: 2 },
  { dia: "Mié", alertas: 19, reportes: 7 },
  { dia: "Jue", alertas: 5, reportes: 1 },
  { dia: "Vie", alertas: 23, reportes: 8 },
  { dia: "Sáb", alertas: 14, reportes: 3 },
  { dia: "Dom", alertas: 9, reportes: 2 },
];

const maxAlertas = Math.max(...activityByDay.map((d) => d.alertas));

export default function Metricas() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zentinel-gold">Métricas del Sistema</h1>
        <p className="mt-2 text-zentinel-text-muted">
          Panel de control — datos actualizados al{" "}
          <span className="text-zentinel-gold-light">08/04/2026 16:45</span>
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary p-5 shadow-lg shadow-black/20"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted">
              {k.label}
            </p>
            <p className="mt-2 text-4xl font-bold text-zentinel-text">{k.value}</p>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <span className={k.deltaUp ? "text-green-400" : "text-amber-400"}>
                {k.deltaUp ? "↑" : "↓"} {k.delta}
              </span>
              <span className="text-zentinel-text-muted">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Actividad semanal */}
        <div className="lg:col-span-2 rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary p-6 shadow-lg shadow-black/20">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zentinel-gold">
            Actividad — Últimos 7 días
          </h2>
          <div className="flex items-end justify-between gap-2 h-28">
            {activityByDay.map((d) => (
              <div key={d.dia} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-col items-center gap-0.5">
                  <div
                    className="w-full rounded-t bg-zentinel-gold/60"
                    style={{ height: `${(d.alertas / maxAlertas) * 80}px` }}
                    title={`${d.alertas} alertas`}
                  />
                  <div
                    className="w-full rounded-t bg-red-500/50"
                    style={{ height: `${(d.reportes / maxAlertas) * 80}px` }}
                    title={`${d.reportes} reportes`}
                  />
                </div>
                <span className="text-[10px] text-zentinel-text-muted">{d.dia}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-zentinel-text-muted">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-zentinel-gold/60" /> Alertas</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-red-500/50" /> Reportes de robo</span>
          </div>
        </div>

        {/* Alertas recientes */}
        <div className="lg:col-span-3 rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary shadow-lg shadow-black/20">
          <div className="border-b border-zentinel-gold-dark/20 px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zentinel-gold">
              Alertas Recientes
            </h2>
          </div>
          <div className="divide-y divide-zentinel-gold-dark/10">
            {recentAlerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-6 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zentinel-text">{a.usuario}</p>
                  <p className="text-xs text-zentinel-text-muted">{a.tipo} · {a.fecha}</p>
                </div>
                <span
                  className={`ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    a.estado === "Pendiente"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-green-500/15 text-green-400"
                  }`}
                >
                  {a.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
