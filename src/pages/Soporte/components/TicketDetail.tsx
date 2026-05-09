import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { TicketDetalle } from "../../../services/ticketService";
import { agregarRespuesta, getTicketDetalle } from "../../../services/ticketService";
import { TIPO_LABELS, ESTADO_BADGE } from "../soporteConstants";

interface TicketDetailProps {
  ticketId: number;
  token: string;
  onClose: () => void;
}

export default function TicketDetail({ ticketId, token, onClose }: TicketDetailProps) {
  const [detalle, setDetalle] = useState<TicketDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadDetalle();
  }, [ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detalle?.respuestas]);

  const loadDetalle = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getTicketDetalle(token, ticketId);
      setDetalle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el ticket.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!mensaje.trim()) return;
    setSendError("");
    setIsSending(true);
    try {
      const { respuesta } = await agregarRespuesta(token, ticketId, mensaje);
      setMensaje("");
      setDetalle((prev) =>
        prev
          ? { ...prev, respuestas: [...prev.respuestas, respuesta] }
          : prev,
      );
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "No se pudo enviar el mensaje.");
    } finally {
      setIsSending(false);
    }
  };

  const ticket = detalle?.ticket;
  const respuestas = detalle?.respuestas ?? [];
  const isClosed = ticket?.estado === "cerrado" || ticket?.estado === "resuelto";

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const content = (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zentinel-text/20 backdrop-blur-md dark:bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl rounded-2xl border border-zentinel-gold/30 bg-zentinel-dark-secondary flex flex-col max-h-[90vh]" style={{boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px color-mix(in srgb, var(--color-zentinel-gold) 20%, transparent)'}}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zentinel-gold-dark/20 px-6 py-4 shrink-0">
          <div className="min-w-0 pr-4">
            {ticket ? (
              <>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted">
                    #{ticket.id} · {TIPO_LABELS[ticket.tipo]}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_BADGE[ticket.estado]}`}>
                    {ticket.estado.replace("_", " ")}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-zentinel-text truncate">{ticket.asunto}</h2>
                <p className="text-xs text-zentinel-text-muted mt-0.5">
                  {new Date(ticket.fecha_creacion).toLocaleDateString("es-AR", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-zentinel-text-muted hover:bg-zentinel-text/10 hover:text-zentinel-text transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
          {isLoading ? (
            <p className="text-zentinel-text-muted text-sm text-center py-8">Cargando...</p>
          ) : error ? (
            <p className="text-red-400 text-sm text-center py-8">{error}</p>
          ) : (
            <>
              {/* Mensaje original */}
              {ticket ? (
                <MessageBubble
                  mensaje={ticket.descripcion}
                  esAdmin={false}
                  nombre="Tú"
                  fecha={ticket.fecha_creacion}
                  isOriginal
                />
              ) : null}

              {/* Hilo de respuestas */}
              {respuestas.map((r) => (
                <MessageBubble
                  key={r.id}
                  mensaje={r.mensaje}
                  esAdmin={r.es_admin}
                  nombre={r.es_admin ? `Soporte · ${r.nombre}` : "Tú"}
                  fecha={r.fecha_creacion}
                />
              ))}

              {respuestas.length === 0 && (
                <p className="text-zentinel-text-muted text-sm text-center py-4">
                  Sin respuestas aún. El equipo de soporte te responderá a la brevedad.
                </p>
              )}

              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Reply area */}
        {!isLoading && !error && !isClosed ? (
          <div className="border-t border-zentinel-gold-dark/20 px-6 py-4 shrink-0">
            {sendError ? (
              <p className="mb-2 rounded-md border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                {sendError}
              </p>
            ) : null}
            <div className="flex gap-3">
              <textarea
                rows={2}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="flex-1 resize-none rounded-md border border-zentinel-gold-dark/30 bg-zentinel-dark p-3 text-sm text-zentinel-text placeholder-zentinel-text-muted/50 focus:border-zentinel-gold focus:outline-none focus:ring-1 focus:ring-zentinel-gold/40"
              />
              <button
                onClick={handleSend}
                disabled={isSending || !mensaje.trim()}
                className="self-end rounded-md bg-zentinel-gold px-4 py-2 text-sm font-bold text-zentinel-dark transition-colors hover:bg-zentinel-gold-light disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSending ? "..." : "Enviar"}
              </button>
            </div>
          </div>
        ) : !isLoading && !error && isClosed ? (
          <div className="border-t border-zentinel-gold-dark/20 px-6 py-3 shrink-0">
            <p className="text-xs text-zentinel-text-muted text-center">
              Este ticket está {ticket?.estado}. No es posible agregar más respuestas.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

interface MessageBubbleProps {
  mensaje: string;
  esAdmin: boolean;
  nombre: string;
  fecha: string;
  isOriginal?: boolean;
}

function MessageBubble({ mensaje, esAdmin, nombre, fecha, isOriginal }: MessageBubbleProps) {
  return (
    <div className={`flex flex-col gap-1 ${esAdmin ? "items-start" : "items-end"}`}>
      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
          esAdmin
            ? "bg-zentinel-gold/10 border border-zentinel-gold/20 text-zentinel-text"
            : isOriginal
            ? "bg-zentinel-text/5 border border-zentinel-gold-dark/20 text-zentinel-text"
            : "bg-zentinel-gold/15 border border-zentinel-gold/30 text-zentinel-text"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{mensaje}</p>
      </div>
      <span className="text-[10px] text-zentinel-text-muted px-1">
        {nombre} ·{" "}
        {new Date(fecha).toLocaleDateString("es-AR", {
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })}
      </span>
    </div>
  );
}
