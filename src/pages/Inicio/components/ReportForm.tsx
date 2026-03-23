// src/pages/Inicio/components/ReportForm.tsx
import React from "react";

export interface ReportDraft {
  phone: string;
  email: string;
  description: string;
}

interface ReportFormProps {
  onCancel: () => void;
  values: ReportDraft;
  onChange: (nextValues: ReportDraft) => void;
  onSubmitReport: (draft: ReportDraft) => void;
}

export default function ReportForm({
  onCancel,
  values,
  onChange,
  onSubmitReport,
}: ReportFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport(values);
  };

  const updateField = (field: keyof ReportDraft, value: string) => {
    onChange({
      ...values,
      [field]: value,
    });
  };

  // Clases reutilizables para los inputs
  const inputClasses =
    "w-full p-3 rounded-md bg-zentinel-dark border border-zentinel-gold-dark/30 focus:border-zentinel-gold focus:ring-1 focus:ring-zentinel-gold/50 focus:outline-none text-zentinel-text placeholder-zentinel-text-muted/50 transition-all";
  const labelClasses =
    "block text-sm font-medium text-zentinel-gold mb-2 uppercase tracking-wider";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zentinel-dark-secondary/60 p-6 sm:p-8 rounded-xl border border-zentinel-gold-dark/30 shadow-2xl shadow-black/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <h3 className="text-2xl font-bold text-white mb-6">
        Detalles del Reporte
      </h3>

      <div className="space-y-5">
        {/* Campo Teléfono */}
        <div>
          <label htmlFor="phone" className={labelClasses}>
            Número de Celular Extraviado
          </label>
          <input
            type="tel"
            id="phone"
            required
            placeholder="+54 9 11 1234-5678"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Campo Email */}
        <div>
          <label htmlFor="email" className={labelClasses}>
            Email de Contacto Alternativo
          </label>
          <input
            type="email"
            id="email"
            required
            placeholder="tu@email.com"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Campo Descripción */}
        <div>
          <label htmlFor="description" className={labelClasses}>
            Información Adicional (Opcional)
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Describe dónde lo viste por última vez o cualquier detalle relevante..."
            value={values.description}
            onChange={(event) => updateField("description", event.target.value)}
            className={`${inputClasses} resize-none`}
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-zentinel-gold hover:bg-zentinel-gold-light text-zentinel-dark font-bold py-3 px-6 rounded-md transition-colors shadow-md shadow-zentinel-gold/20"
          >
            ENVIAR REPORTE
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-transparent hover:bg-white/5 text-zentinel-text-muted font-medium py-3 px-6 rounded-md border border-zentinel-gold-dark/30 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}
