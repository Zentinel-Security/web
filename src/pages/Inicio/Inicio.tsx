// src/pages/Inicio/Inicio.tsx
import { useState } from "react";
import ReportForm from "./components/ReportForm";

export default function Inicio() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-zentinel-gold sm:text-5xl mb-4 tracking-tight">
          Centro de Reportes
        </h1>
        <p className="text-lg text-zentinel-text-muted max-w-2xl">
          Si has perdido tu dispositivo con Zentinel instalado, es vital actuar
          rápido. Reporta el incidente para iniciar inmediatamente los
          protocolos de seguridad y rastreo.
        </p>
      </div>

      <div className="mt-8">
        {!showForm ? (
          /* Estado inicial: Botón grande de llamada a la acción */
          <button
            onClick={() => setShowForm(true)}
            className="group w-full sm:w-auto flex flex-col items-center sm:flex-row gap-6 bg-zentinel-dark-secondary hover:bg-zentinel-dark-secondary/80 border-2 border-zentinel-gold p-8 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(212,175,55,0.3)] hover:scale-[1.02] cursor-pointer text-left"
          >
            <div className="bg-zentinel-gold/10 p-4 rounded-full border border-zentinel-gold/30 group-hover:bg-zentinel-gold/20 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 text-zentinel-gold"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-zentinel-gold transition-colors">
                Denunciar Dispositivo Extraviado
              </h2>
              <p className="text-zentinel-text-muted">
                Haz clic aquí para comenzar el proceso de reporte y bloqueo
                preventivo.
              </p>
            </div>
          </button>
        ) : (
          /* Estado secundario: El formulario */
          <ReportForm onCancel={() => setShowForm(false)} />
        )}
      </div>
    </div>
  );
}
