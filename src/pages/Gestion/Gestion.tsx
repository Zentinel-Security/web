const mockUsuarios = [
  { id: 1, nombre: "Lucas Martínez", email: "lucas.m@gmail.com", estado: "activa", rol: "usuario", dispositivos: 2, alertas: 4 },
  { id: 2, nombre: "Sofía Rodríguez", email: "sofia.r@outlook.com", estado: "activa", rol: "usuario", dispositivos: 1, alertas: 1 },
  { id: 3, nombre: "Carlos Benítez", email: "carlos.b@zentinel.app", estado: "suspendida", rol: "usuario", dispositivos: 3, alertas: 0 },
  { id: 4, nombre: "María García", email: "maria.g@gmail.com", estado: "activa", rol: "usuario", dispositivos: 1, alertas: 2 },
  { id: 5, nombre: "Juan Perez", email: "juan.p@hotmail.com", estado: "activa", rol: "usuario", dispositivos: 2, alertas: 1 },
  { id: 6, nombre: "Admin Principal", email: "admin@zentinel.app", estado: "activa", rol: "admin", dispositivos: 0, alertas: 0 },
];

const mockReportes = [
  { id: 101, usuario: "lucas.m@gmail.com", dispositivo: "Samsung Galaxy A54", fecha: "08/04/2026 14:23", estado: "En revisión" },
  { id: 102, usuario: "maria.g@gmail.com", dispositivo: "iPhone 14", fecha: "07/04/2026 22:10", estado: "Pendiente" },
  { id: 103, usuario: "sofia.r@outlook.com", dispositivo: "Motorola Edge 30", fecha: "06/04/2026 09:45", estado: "Resuelto" },
  { id: 104, usuario: "juan.p@hotmail.com", dispositivo: "Xiaomi 12", fecha: "05/04/2026 17:02", estado: "Resuelto" },
];

const estadoReporteStyle: Record<string, string> = {
  "Pendiente": "bg-amber-500/15 text-amber-400",
  "En revisión": "bg-blue-500/15 text-blue-400",
  "Resuelto": "bg-green-500/15 text-green-400",
};

const estadoCuentaStyle: Record<string, string> = {
  "activa": "bg-green-500/15 text-green-400",
  "suspendida": "bg-red-500/15 text-red-400",
};

export default function Gestion() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zentinel-gold">Gestión de Backoffice</h1>
        <p className="mt-2 text-zentinel-text-muted">
          Administración centralizada de usuarios y reportes de la plataforma Zentinel.
        </p>
      </header>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Usuarios totales", value: "2,847", color: "text-white" },
          { label: "Cuentas suspendidas", value: "34", color: "text-red-400" },
          { label: "Reportes activos", value: "12", color: "text-amber-400" },
          { label: "Grupos registrados", value: "318", color: "text-zentinel-gold" },
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

      {/* Tabla de usuarios */}
      <div className="rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary shadow-lg shadow-black/20">
        <div className="flex items-center justify-between border-b border-zentinel-gold-dark/20 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zentinel-gold">
            Usuarios recientes
          </h2>
          <span className="rounded-full bg-zentinel-gold/10 px-3 py-0.5 text-xs text-zentinel-gold">
            {mockUsuarios.length} mostrados
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zentinel-gold-dark/10 text-left text-xs uppercase tracking-wider text-zentinel-text-muted">
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3 text-center">Rol</th>
                <th className="px-6 py-3 text-center">Estado</th>
                <th className="px-6 py-3 text-center">Dispositivos</th>
                <th className="px-6 py-3 text-center">Alertas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zentinel-gold-dark/10">
              {mockUsuarios.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3 font-medium text-zentinel-text">{u.nombre}</td>
                  <td className="px-6 py-3 text-zentinel-text-muted">{u.email}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.rol === "admin" ? "bg-zentinel-gold/15 text-zentinel-gold" : "bg-white/5 text-zentinel-text-muted"}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoCuentaStyle[u.estado]}`}>
                      {u.estado}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center text-zentinel-text-muted">{u.dispositivos}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={u.alertas > 0 ? "text-amber-400 font-semibold" : "text-zentinel-text-muted"}>
                      {u.alertas}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reportes de robo */}
      <div className="rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary shadow-lg shadow-black/20">
        <div className="flex items-center justify-between border-b border-zentinel-gold-dark/20 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zentinel-gold">
            Reportes de robo recientes
          </h2>
          <span className="rounded-full bg-red-500/10 px-3 py-0.5 text-xs text-red-400">
            2 sin resolver
          </span>
        </div>
        <div className="divide-y divide-zentinel-gold-dark/10">
          {mockReportes.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zentinel-text">{r.dispositivo}</p>
                <p className="text-xs text-zentinel-text-muted">{r.usuario} · {r.fecha}</p>
              </div>
              <span className={`ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoReporteStyle[r.estado]}`}>
                {r.estado}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
