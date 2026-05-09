import { useState, type FormEvent } from "react";
import type { TicketTipo } from "../../../services/ticketService";

interface TicketFormProps {
  onSubmit: (data: { tipo: TicketTipo; asunto: string; descripcion: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const TIPOS: { value: TicketTipo; label: string }[] = [
  { value: "consulta",       label: "Consulta" },
  { value: "reclamo",        label: "Reclamo" },
  { value: "soporte_tecnico",label: "Soporte Técnico" },
  { value: "facturacion",    label: "Facturación" },
  { value: "reporte",        label: "Reporte" },
];

const inputClasses =
  "w-full p-3 rounded-md bg-zentinel-dark border border-zentinel-gold-dark/30 focus:border-zentinel-gold focus:ring-1 focus:ring-zentinel-gold/50 focus:outline-none text-zentinel-text placeholder-zentinel-text-muted/50 transition-all";
const labelClasses =
  "block text-sm font-medium text-zentinel-gold mb-2 uppercase tracking-wider";

export default function TicketForm({ onSubmit, onCancel, isSubmitting }: TicketFormProps) {
  const [tipo, setTipo] = useState<TicketTipo>("consulta");
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await onSubmit({ tipo, asunto: asunto.trim(), descripcion: descripcion.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el ticket.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zentinel-dark-secondary/60 p-6 sm:p-8 rounded-xl border border-zentinel-gold-dark/30 shadow-2xl shadow-black/50 backdrop-blur-sm"
    >
      <h3 className="text-2xl font-bold text-zentinel-text mb-6">Nuevo Ticket de Soporte</h3>

      <div className="space-y-5">
        <div>
          <label htmlFor="ticket-tipo" className={labelClasses}>
            Tipo de consulta
          </label>
          <select
            id="ticket-tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TicketTipo)}
            className={inputClasses}
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ticket-asunto" className={labelClasses}>
            Asunto
          </label>
          <input
            id="ticket-asunto"
            type="text"
            required
            maxLength={150}
            placeholder="Describe brevemente tu consulta"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="ticket-descripcion" className={labelClasses}>
            Descripción
          </label>
          <textarea
            id="ticket-descripcion"
            rows={5}
            required
            placeholder="Explica con detalle tu consulta o problema..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={`${inputClasses} resize-none`}
          />
        </div>

        {error ? (
          <p className="rounded-md border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-zentinel-gold hover:bg-zentinel-gold-light text-zentinel-dark font-bold py-3 px-6 rounded-md transition-colors shadow-md shadow-zentinel-gold/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Enviando..." : "ENVIAR TICKET"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 bg-transparent hover:bg-zentinel-text/5 text-zentinel-text-muted font-medium py-3 px-6 rounded-md border border-zentinel-gold-dark/30 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}
