import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../../components/auth/LoginModal";
import TicketForm from "./components/TicketForm";
import TicketDetail from "./components/TicketDetail";
import {
  getMisTickets,
  createTicket,
  type Ticket,
  type TicketTipo,
} from "../../services/ticketService";
import { TIPO_LABELS, ESTADO_BADGE, ESTADO_LABELS } from "./soporteConstants";

export default function Soporte() {
  const { isAuthenticated, token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setTickets([]);
      return;
    }
    void loadTickets();
  }, [isAuthenticated, token]);

  const loadTickets = async () => {
    if (!token) return;
    setIsLoadingTickets(true);
    setLoadError("");
    try {
      const data = await getMisTickets(token);
      setTickets(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "No se pudieron cargar los tickets.");
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleCreateTicket = async (data: {
    tipo: TicketTipo;
    asunto: string;
    descripcion: string;
  }) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const { ticket } = await createTicket(token, data);
      setTickets((prev) => [ticket, ...prev]);
      setShowForm(false);
      setSuccessMessage("¡Ticket creado correctamente! Te responderemos a la brevedad.");
      setTimeout(() => setSuccessMessage(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-zentinel-gold sm:text-5xl mb-4 tracking-tight">
            Soporte
          </h1>
          <p className="text-lg text-zentinel-text-muted max-w-2xl">
            ¿Tenés alguna consulta, reclamo o problema técnico? Abrí un ticket y
            nuestro equipo te responderá a la brevedad.
          </p>
        </div>

        <button
          onClick={() => setIsLoginOpen(true)}
          className="group w-full sm:w-auto flex flex-col items-center sm:flex-row gap-6 bg-zentinel-dark-secondary hover:bg-zentinel-dark-secondary/80 border-2 border-zentinel-gold p-8 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(212,175,55,0.3)] hover:scale-[1.02] cursor-pointer text-left"
        >
          <div className="bg-zentinel-gold/10 p-4 rounded-full border border-zentinel-gold/30 group-hover:bg-zentinel-gold/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-zentinel-gold">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-zentinel-gold transition-colors">
              Iniciar sesión para abrir un ticket
            </h2>
            <p className="text-zentinel-text-muted">
              Iniciá sesión con tu cuenta de Zentinel para crear y seguir el estado de tus consultas.
            </p>
          </div>
        </button>

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          title="Iniciar sesión para continuar"
          subtitle="Necesitás autenticarte para acceder al canal de soporte."
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zentinel-gold tracking-tight">Soporte</h1>
          <p className="mt-1 text-zentinel-text-muted">
            Tus tickets de consulta y soporte con el equipo de Zentinel.
          </p>
        </div>
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="shrink-0 rounded-lg bg-zentinel-gold px-4 py-2.5 text-sm font-bold text-zentinel-dark transition-colors hover:bg-zentinel-gold-light"
          >
            + Nuevo ticket
          </button>
        ) : null}
      </div>

      {successMessage ? (
        <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-4 text-sm text-emerald-200">
          {successMessage}
        </div>
      ) : null}

      {showForm ? (
        <div className="mb-8">
          <TicketForm
            onSubmit={handleCreateTicket}
            onCancel={() => setShowForm(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : null}

      {isLoadingTickets ? (
        <div className="rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary p-8 text-center text-zentinel-text-muted">
          Cargando tickets...
        </div>
      ) : loadError ? (
        <div className="rounded-lg border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-300">
          {loadError}
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary p-10 text-center">
          <p className="text-zentinel-text-muted">
            No tenés tickets aún.{" "}
            <button
              onClick={() => setShowForm(true)}
              className="text-zentinel-gold underline hover:text-zentinel-gold-light"
            >
              Abrí uno ahora
            </button>
            .
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary shadow-lg shadow-black/20">
          <div className="flex items-center justify-between border-b border-zentinel-gold-dark/20 px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zentinel-gold">
              Mis tickets
            </h2>
            <span className="rounded-full bg-zentinel-gold/10 px-3 py-0.5 text-xs text-zentinel-gold">
              {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
            </span>
          </div>
          <div className="divide-y divide-zentinel-gold-dark/10">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors text-left"
              >
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-zentinel-text-muted">
                      #{t.id}
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zentinel-text-muted">
                      {TIPO_LABELS[t.tipo]}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-zentinel-text truncate">{t.asunto}</p>
                  <p className="text-xs text-zentinel-text-muted mt-0.5">
                    {new Date(t.fecha_creacion).toLocaleDateString("es-AR", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                    })}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_BADGE[t.estado]}`}>
                  {ESTADO_LABELS[t.estado]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTicketId !== null && token ? (
        <TicketDetail
          ticketId={selectedTicketId}
          token={token}
          onClose={() => setSelectedTicketId(null)}
        />
      ) : null}
    </div>
  );
}
