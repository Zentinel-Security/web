// src/pages/NotFound/NotFound.tsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      {/* Reutilizamos el ícono de alerta de la página de inicio para consistencia */}
      <div className="bg-zentinel-gold/10 p-4 rounded-full border border-zentinel-gold/30 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-12 h-12 text-zentinel-gold"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>

      <h1 className="text-5xl font-bold text-zentinel-gold mb-4">404</h1>
      <h2 className="text-3xl font-bold text-white mb-6">
        Página No Encontrada
      </h2>
      <p className="text-lg text-zentinel-text-muted mb-8 max-w-md">
        Lo sentimos, la página que buscas no existe o fue movida. Verifica la
        URL e inténtalo de nuevo.
      </p>

      {/* Botón para volver al inicio */}
      <Link
        to="/"
        className="bg-zentinel-gold hover:bg-zentinel-gold-light text-zentinel-dark font-bold py-3 px-6 rounded-md transition-colors shadow-md shadow-zentinel-gold/20"
      >
        VOLVER AL INICIO
      </Link>
    </div>
  );
}
