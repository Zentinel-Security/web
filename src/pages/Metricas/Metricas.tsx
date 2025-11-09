// src/pages/Metricas/Metricas.tsx
export default function Metricas() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-zentinel-gold">
          Métricas del Sistema
        </h1>
        <p className="text-zentinel-text-muted mt-2">
          Visualización en tiempo real del estado de los servicios de Zentinel.
        </p>
      </header>

      {/* Grid de ejemplo para métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta de métrica 1 */}
        <div className="bg-zentinel-dark-secondary p-6 rounded-lg border border-zentinel-gold-dark/20 shadow-lg shadow-black/20">
          <h3 className="text-zentinel-text-muted text-sm font-medium uppercase tracking-wider">
            Dispositivos Activos
          </h3>
          <p className="text-4xl font-bold text-white mt-2">1,245</p>
          <div className="mt-4 text-sm text-green-400 flex items-center gap-1">
            <span>↑ 12%</span>
            <span className="text-zentinel-text-muted">vs mes anterior</span>
          </div>
        </div>

        {/* Tarjeta de métrica 2 */}
        <div className="bg-zentinel-dark-secondary p-6 rounded-lg border border-zentinel-gold-dark/20 shadow-lg shadow-black/20">
          <h3 className="text-zentinel-text-muted text-sm font-medium uppercase tracking-wider">
            Alertas Hoy
          </h3>
          <p className="text-4xl font-bold text-zentinel-gold mt-2">23</p>
          <div className="mt-4 text-sm text-zentinel-text-muted">
            5 requieren atención
          </div>
        </div>

        {/* Tarjeta de métrica 3 */}
        <div className="bg-zentinel-dark-secondary p-6 rounded-lg borderZG border-zentinel-gold-dark/20 shadow-lg shadow-black/20">
          <h3 className="text-zentinel-text-muted text-sm font-medium uppercase tracking-wider">
            Uptime Servidor
          </h3>
          <p className="text-4xl font-bold text-white mt-2">99.9%</p>
          <div className="mt-4 text-sm text-zentinel-text-muted">
            Sin incidentes reportados
          </div>
        </div>
      </div>
    </div>
  );
}
