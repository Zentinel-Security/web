import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import {
  fetchMetricasHistorico,
  rangoUltimosMeses,
  type MetricasHistorico as MetricasHistoricoData,
  type MetricaMensual,
} from "../../services/metricasHistoricoService";
import { exportarReportePDF } from "../../utils/exportarReportePDF";

// ─── Helpers ───────────────────────────────────────────────────────────

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

/** "2026-04" → "Abr 26" */
const formatMesCorto = (mes: string) => {
  const [y, m] = mes.split("-").map(Number);
  return `${MONTH_LABELS[m - 1]} ${String(y).slice(2)}`;
};

const formatMoneda = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(n);

const formatNumero = (n: number) => new Intl.NumberFormat("es-AR").format(n);

// ─── Iconos ────────────────────────────────────────────────────────────

const IconArrowUp = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
    <path d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.51a.75.75 0 0 1-1.08 0l-5.25-5.51a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" transform="rotate(180 10 10)" />
  </svg>
);
const IconArrowDown = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
    <path d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.51a.75.75 0 0 1-1.08 0l-5.25-5.51a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" />
  </svg>
);
const IconDownload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

// ─── Subcomponentes ────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  delta?: number | null;
  hint?: string;
}

function KpiCard({ label, value, sub, delta, hint }: KpiCardProps) {
  const showDelta = delta !== undefined;
  const positive = (delta ?? 0) > 0;
  const negative = (delta ?? 0) < 0;
  const neutral = delta === 0;

  return (
    <div className="zentinel-card p-5 flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted">
          {label}
        </p>
        {hint && (
          <span
            title={hint}
            className="text-zentinel-text-muted/60 cursor-help text-xs select-none"
          >
            ⓘ
          </span>
        )}
      </div>
      <p className="text-3xl font-extrabold text-zentinel-text leading-none">{value}</p>
      <div className="flex items-center justify-between gap-2 mt-1">
        {sub && <p className="text-xs text-zentinel-text-muted">{sub}</p>}
        {showDelta && delta !== null && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              positive
                ? "bg-emerald-500/15 text-emerald-500"
                : negative
                ? "bg-red-500/15 text-red-500"
                : "bg-zentinel-text-muted/15 text-zentinel-text-muted"
            }`}
          >
            {positive ? <IconArrowUp /> : negative ? <IconArrowDown /> : <span className="w-3.5">—</span>}
            {neutral ? "0%" : `${Math.abs(delta!).toFixed(1)}%`}
          </span>
        )}
        {showDelta && delta === null && (
          <span
            className="text-xs text-zentinel-text-muted/60 italic"
            title="Sin datos en el período anterior — primera comparativa disponible"
          >
            1er per.
          </span>
        )}
      </div>
    </div>
  );
}

function SkeletonKpi() {
  return (
    <div className="zentinel-card p-5 animate-pulse space-y-3">
      <div className="h-3 w-2/3 rounded bg-zentinel-gold-dark/20" />
      <div className="h-8 w-1/2 rounded bg-zentinel-gold-dark/15" />
      <div className="h-3 w-3/4 rounded bg-zentinel-gold-dark/10" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="zentinel-card p-6 animate-pulse">
      <div className="h-4 w-1/3 rounded bg-zentinel-gold-dark/20 mb-4" />
      <div className="h-64 w-full rounded bg-zentinel-gold-dark/10" />
    </div>
  );
}

// ─── Filtros ───────────────────────────────────────────────────────────

const PRESETS = [
  { label: "1 mes",   meses: 1  },
  { label: "3 meses", meses: 3  },
  { label: "6 meses", meses: 6  },
  { label: "12 meses", meses: 12 },
];

/** Devuelve el mes actual en formato YYYY-MM */
const mesActual = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

interface FiltrosBarraProps {
  presetActivo: number;
  onPreset: (m: number) => void;
  onCustom: (desde: string, hasta: string) => void;
  onExport: () => void;
  exporting: boolean;
  rango: { desde: string; hasta: string } | null;
  exportDisabled: boolean;
}

function FiltrosBarra({
  presetActivo,
  onPreset,
  onCustom,
  onExport,
  exporting,
  rango,
  exportDisabled,
}: FiltrosBarraProps) {
  const [customDesde, setCustomDesde] = useState("");
  const [customHasta, setCustomHasta] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handlePreset = (m: number) => {
    setShowCustom(false);
    onPreset(m);
  };

  const handleCustomToggle = () => {
    setShowCustom((v) => !v);
  };

  const customValid = customDesde && customHasta && customDesde <= customHasta;

  const handleApplyCustom = () => {
    if (!customValid) return;
    onCustom(customDesde, customHasta);
    setShowCustom(false);
  };

  return (
    <div className="zentinel-card p-4 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zentinel-text-muted">
            <IconCalendar /> Período
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.meses}
              onClick={() => handlePreset(p.meses)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                presetActivo === p.meses && !showCustom
                  ? "bg-zentinel-gold text-zentinel-dark border-zentinel-gold shadow-sm"
                  : "border-zentinel-gold-dark/30 text-zentinel-text-muted hover:border-zentinel-gold/50 hover:text-zentinel-gold"
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={handleCustomToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
              showCustom || presetActivo === 0
                ? "bg-zentinel-gold text-zentinel-dark border-zentinel-gold shadow-sm"
                : "border-zentinel-gold-dark/30 text-zentinel-text-muted hover:border-zentinel-gold/50 hover:text-zentinel-gold"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Personalizado
          </button>
          {rango && (
            <span className="text-xs text-zentinel-text-muted/80 border-l border-zentinel-gold-dark/20 pl-3 ml-1">
              {rango.desde} → {rango.hasta}
            </span>
          )}
        </div>
        <button
          onClick={onExport}
          disabled={exporting || exportDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zentinel-gold px-4 py-2 text-sm font-bold text-zentinel-dark transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <IconDownload />
          {exporting ? "Generando PDF…" : "Exportar PDF"}
        </button>
      </div>

      {/* Panel de rango personalizado */}
      {showCustom && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-zentinel-gold-dark/20 bg-zentinel-dark/30 px-4 py-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted">Desde</label>
            <input
              type="month"
              value={customDesde}
              max={mesActual()}
              onChange={(e) => setCustomDesde(e.target.value)}
              className="zentinel-input py-1.5 text-sm w-40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zentinel-text-muted">Hasta</label>
            <input
              type="month"
              value={customHasta}
              max={mesActual()}
              min={customDesde || undefined}
              onChange={(e) => setCustomHasta(e.target.value)}
              className="zentinel-input py-1.5 text-sm w-40"
            />
          </div>
          <button
            onClick={handleApplyCustom}
            disabled={!customValid}
            className="px-4 py-1.5 rounded-lg bg-zentinel-gold text-zentinel-dark text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Aplicar
          </button>
          {customDesde && customHasta && customDesde > customHasta && (
            <p className="text-xs text-red-400">"Desde" no puede ser posterior a "Hasta"</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Paleta de colores de series (hardcoded — no CSS vars en atributos SVG) ───

const CLR = {
  blue:    "#3b82f6",
  emerald: "#10b981",
  amber:   "#f59e0b",
  red:     "#ef4444",
  sky:     "#0ea5e9",
  violet:  "#8b5cf6",
};

// Colores de cuadrícula / ejes — CSS vars siguen funcionando (no hay html2canvas)
const GRID_STROKE = "var(--color-zentinel-gold-dark)";
const AXIS_STROKE = "var(--color-zentinel-text-muted)";

// ─── Tooltip de gráfico ─────────────────────────────────────────────────────

interface TooltipEntry { name?: string; value?: number | string; color?: string }
interface ChartTipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  fmt?: (v: number) => string;
}

function ChartTip({ active, payload, label, fmt }: ChartTipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zentinel-gold-dark/20 bg-zentinel-card shadow-lg px-3.5 py-2.5 text-xs min-w-[130px]">
      <p className="font-semibold text-zentinel-text mb-2">{label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mt-0.5">
          <span className="flex items-center gap-1.5 text-zentinel-text-muted">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
            {e.name}
          </span>
          <span className="font-semibold text-zentinel-text tabular-nums">
            {fmt ? fmt(Number(e.value)) : e.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── ChartCard con leyenda interactiva ──────────────────────────────────────

interface LegendItem { key: string; label: string; color: string }

interface ChartCardProps {
  title: string;
  subtitle?: string;
  className?: string;
  legend?: LegendItem[];
  selected?: string | null;
  onSelect?: (k: string) => void;
  children: React.ReactNode;
  chartId?: string;
}

function ChartCard({ title, subtitle, className, legend = [], selected = null, onSelect = () => {}, children, chartId }: ChartCardProps) {
  return (
    <div className={`zentinel-card p-5 flex flex-col gap-0${className ? ` ${className}` : ""}`} data-chart-id={chartId}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-zentinel-text">{title}</h3>
        {subtitle && (
          <p className="text-xs text-zentinel-text-muted mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="h-56 w-full">{children}</div>

      {/* Leyenda interactiva */}
      {legend.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-zentinel-gold-dark/10">
        {legend.map((item) => {
          const isActive  = selected === item.key;
          const isDimmed  = selected !== null && !isActive;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              title={isActive ? "Clic para mostrar todo" : "Clic para ver solo esta serie"}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 select-none ${
                isDimmed
                  ? "opacity-30"
                  : isActive
                  ? "ring-1 ring-offset-1"
                  : "hover:opacity-80"
              }`}
              style={{
                color: item.color,
                backgroundColor: `${item.color}18`,
                outline: isActive ? `2px solid ${item.color}` : "none",
                outlineOffset: "1px",
              }}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </button>
          );
        })}
        {selected !== null && (
          <button
            onClick={() => onSelect(selected)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-zentinel-text-muted hover:text-zentinel-text bg-zentinel-gold-dark/10 transition-all"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/>
            </svg>
            Ver todo
          </button>
        )}
      </div>
      )}
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────

export default function MetricasHistorico() {
  const { token } = useAuth();
  const [data, setData] = useState<MetricasHistoricoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presetMeses, setPresetMeses] = useState(6);
  const [activeRango, setActiveRango] = useState<{ desde: string; hasta: string }>(
    () => rangoUltimosMeses(6),
  );
  const [exporting, setExporting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Estado de leyenda interactiva por gráfico ─────────────────────────────
  const [selUsuarios, setSelUsuarios] = useState<string | null>(null);

  const [selAlertas, setSelAlertas]   = useState<string | null>(null);
  const [selTickets, setSelTickets]         = useState<string | null>(null);
  const [selFidelizacion, setSelFidelizacion] = useState<string | null>(null);

  const makeToggle = (set: React.Dispatch<React.SetStateAction<string | null>>) =>
    (key: string) => set((prev) => (prev === key ? null : key));

  const handlePreset = (m: number) => {
    setPresetMeses(m);
    setActiveRango(rangoUltimosMeses(m));
  };

  const handleCustom = (desde: string, hasta: string) => {
    setPresetMeses(0);
    setActiveRango({ desde, hasta });
  };

  // ─── Cargar datos al cambiar el rango activo ─────────────────────────────
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchMetricasHistorico(token, activeRango.desde, activeRango.hasta)
      .then((d) => setData(d))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, activeRango]);

  // ─── Datos derivados para los gráficos ─────────────────────────────
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.series.map((s: MetricaMensual) => ({
      ...s,
      mesLabel: s.in_range === false
        ? `${formatMesCorto(s.mes)} (ant.)`
        : formatMesCorto(s.mes),
    }));
  }, [data]);

  const sinDatos = !loading && data && data.series.filter(s => s.in_range !== false).every((s) =>
    s.usuarios_nuevos === 0 &&
    s.usuarios_activos === 0 &&
    s.alertas_panico + s.alertas_zona + s.alertas_personal === 0 &&
    s.tickets_abiertos === 0 && s.tickets_resueltos === 0,
  );

  const handleExport = () => {
    if (!data) return;
    setExporting(true);
    try {
      exportarReportePDF(data);
    } catch (e) {
      console.error("Error exportando PDF:", e);
      alert("No se pudo generar el PDF. Intentá de nuevo.");
    } finally {
      setExporting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="space-y-6">
      <FiltrosBarra
        presetActivo={presetMeses}
        onPreset={handlePreset}
        onCustom={handleCustom}
        onExport={handleExport}
        exporting={exporting}
        rango={data?.rango ?? null}
        exportDisabled={loading || !data}
      />

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
          Error al cargar histórico: {error}
        </div>
      )}

      {/* KPIs del período */}
      <section data-pdf-section="kpis">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zentinel-text-muted">
          KPIs del período
        </p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonKpi key={i} />)
          ) : data ? (
            <>
              <KpiCard
                label="Usuarios nuevos"
                value={`+${formatNumero(data.resumen.total_usuarios_nuevos)}`}
                sub="registros en el período"
                hint="vs período anterior de igual duración"
                delta={data.resumen.delta_usuarios_nuevos}
              />
              <KpiCard
                label="Usuarios activos"
                value={`${formatNumero(data.resumen.mau_promedio)} /mes`}
                sub="promedio de sesiones activas por mes"
                delta={data.resumen.delta_mau}
                hint="vs período anterior de igual duración"
              />
              <KpiCard
                label="Ingresos del período"
                value={formatMoneda(data.resumen.ingresos_periodo)}
                sub="pagos cobrados (Mercado Pago)"
                hint="vs período anterior de igual duración"
                delta={data.resumen.delta_ingresos}
              />
              <KpiCard
                label="Usuarios de pago"
                value={`${data.resumen.tasa_conversion_promedio.toFixed(1)}%`}
                sub="del total de registrados con plan pago activo"
                hint="Último mes del período vs mes anterior"
                delta={data.resumen.delta_conversion}
              />
              <KpiCard
                label="Tickets abiertos"
                value={formatNumero(data.resumen.tickets_abiertos_periodo)}
                sub="creados en el período"
                hint="vs período anterior de igual duración"
                delta={data.resumen.delta_tickets_abiertos}
              />
              <KpiCard
                label="Suscripciones nuevas"
                value={`+${formatNumero(data.resumen.nuevas_suscripciones_periodo)}`}
                sub="planes pagos iniciados en el período"
                hint="vs período anterior de igual duración"
                delta={data.resumen.delta_nuevas_suscripciones}
              />
              <KpiCard
                label="Retención mensual"
                value={
                  data.resumen.tasa_retencion_promedio !== null
                    ? `${data.resumen.tasa_retencion_promedio.toFixed(1)}%`
                    : `—`
                }
                sub="usuarios activos que vuelven mes a mes"
                hint="promedio del período · activos este mes que también lo fueron el anterior"
              />
              <KpiCard
                label="Usuarios perdidos"
                value={formatNumero(data.resumen.usuarios_perdidos)}
                sub="activos el período anterior que no volvieron en este"
                hint="indica abandono: cuantos dejaron de usar la app en el período actual"
              />
            </>
          ) : null}
        </div>
      </section>

      {sinDatos && (
        <div className="rounded-xl border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary p-10 text-center">
          <p className="text-zentinel-text-muted text-sm">
            Sin actividad registrada en el período seleccionado.
          </p>
        </div>
      )}

      {/* Gráficos en grid 2x2 */}
      {!loading && data && !sinDatos && (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* Gráfico 1 — Usuarios nuevos (barras) + MAU (área) */}
          <ChartCard
            title="Crecimiento de usuarios"
            subtitle="Registros nuevos por mes y usuarios activos (MAU)"
            chartId="usuarios"
            legend={[
              { key: "usuarios_nuevos", label: "Nuevos registros", color: CLR.blue },
              { key: "usuarios_activos", label: "Usuarios activos (MAU)", color: CLR.emerald },
            ]}
            selected={selUsuarios}
            onSelect={makeToggle(setSelUsuarios)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={GRID_STROKE} strokeOpacity={0.12} vertical={false} />
                <XAxis dataKey="mesLabel" stroke={AXIS_STROKE} strokeOpacity={0.4} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={AXIS_STROKE} strokeOpacity={0} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "transparent" }} content={<ChartTip fmt={formatNumero} />} />
                <Area
                  type="monotone"
                  dataKey="usuarios_activos"
                  name="Usuarios activos (MAU)"
                  stroke={CLR.emerald}
                  strokeWidth={2}
                  fill={CLR.emerald}
                  fillOpacity={0.08}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  hide={selUsuarios !== null && selUsuarios !== "usuarios_activos"}
                />
                <Bar
                  dataKey="usuarios_nuevos"
                  name="Nuevos registros"
                  fill={CLR.blue}
                  fillOpacity={0.85}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                  hide={selUsuarios !== null && selUsuarios !== "usuarios_nuevos"}
                >
                  {chartData.map((e) => (
                    <Cell key={e.mes} fill={CLR.blue} fillOpacity={e.in_range === false ? 0.3 : 0.85} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Gráfico 2 — Ingresos cobrados (Mercado Pago) */}
          <ChartCard
            title="Ingresos cobrados"
            subtitle="Pagos aprobados via Mercado Pago por mes"
            chartId="ingresos"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={GRID_STROKE} strokeOpacity={0.12} vertical={false} />
                <XAxis dataKey="mesLabel" stroke={AXIS_STROKE} strokeOpacity={0.4} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={AXIS_STROKE} strokeOpacity={0} fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
                <Tooltip cursor={{ fill: "transparent" }} content={<ChartTip fmt={(v) => formatMoneda(v)} />} />
                <Bar
                  dataKey="ingresos_reales"
                  name="Ingresos"
                  fill={CLR.amber}
                  fillOpacity={0.85}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                >
                  {chartData.map((e) => (
                    <Cell key={e.mes} fill={CLR.amber} fillOpacity={e.in_range === false ? 0.25 : 0.85} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Gráfico 3 — Alertas apiladas */}
          <ChartCard
            title="Alertas por tipo"
            subtitle="Distribución mensual de alertas emitidas"
            chartId="alertas"
            legend={[
              { key: "alertas_panico", label: "Pánico", color: CLR.red },
              { key: "alertas_zona", label: "Zona compartida", color: CLR.amber },
              { key: "alertas_personal", label: "Zona personal", color: CLR.sky },
            ]}
            selected={selAlertas}
            onSelect={makeToggle(setSelAlertas)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={GRID_STROKE} strokeOpacity={0.12} vertical={false} />
                <XAxis dataKey="mesLabel" stroke={AXIS_STROKE} strokeOpacity={0.4} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={AXIS_STROKE} strokeOpacity={0} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "transparent" }} content={<ChartTip fmt={formatNumero} />} />
                <Bar dataKey="alertas_panico"   name="Pánico"          stackId="a" fill={CLR.red}   fillOpacity={0.85} maxBarSize={32}
                  hide={selAlertas !== null && selAlertas !== "alertas_panico"}>
                  {chartData.map((e) => <Cell key={e.mes} fill={CLR.red}   fillOpacity={e.in_range === false ? 0.25 : 0.85} />)}
                </Bar>
                <Bar dataKey="alertas_zona"     name="Zona compartida" stackId="a" fill={CLR.amber} fillOpacity={0.85} maxBarSize={32}
                  hide={selAlertas !== null && selAlertas !== "alertas_zona"}>
                  {chartData.map((e) => <Cell key={e.mes} fill={CLR.amber} fillOpacity={e.in_range === false ? 0.25 : 0.85} />)}
                </Bar>
                <Bar dataKey="alertas_personal" name="Zona personal"   stackId="a" fill={CLR.sky}   fillOpacity={0.85} maxBarSize={32} radius={[3, 3, 0, 0]}
                  hide={selAlertas !== null && selAlertas !== "alertas_personal"}>
                  {chartData.map((e) => <Cell key={e.mes} fill={CLR.sky}   fillOpacity={e.in_range === false ? 0.25 : 0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Gráfico 4 — Tickets abiertos vs resueltos */}
          <ChartCard
            title="Tickets de soporte"
            subtitle="Tickets abiertos y resueltos por mes"
            chartId="tickets"
            legend={[
              { key: "tickets_abiertos",  label: "Abiertos",  color: CLR.amber },
              { key: "tickets_resueltos", label: "Resueltos", color: CLR.emerald },
            ]}
            selected={selTickets}
            onSelect={makeToggle(setSelTickets)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={GRID_STROKE} strokeOpacity={0.12} vertical={false} />
                <XAxis dataKey="mesLabel" stroke={AXIS_STROKE} strokeOpacity={0.4} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={AXIS_STROKE} strokeOpacity={0} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "transparent" }} content={<ChartTip fmt={formatNumero} />} />
                <Bar dataKey="tickets_abiertos"  name="Abiertos"  fill={CLR.amber}   fillOpacity={0.8} radius={[3, 3, 0, 0]} maxBarSize={22}
                  hide={selTickets !== null && selTickets !== "tickets_abiertos"}>
                  {chartData.map((e) => <Cell key={e.mes} fill={CLR.amber}   fillOpacity={e.in_range === false ? 0.25 : 0.8} />)}
                </Bar>
                <Bar dataKey="tickets_resueltos" name="Resueltos" fill={CLR.emerald} fillOpacity={0.8} radius={[3, 3, 0, 0]} maxBarSize={22}
                  hide={selTickets !== null && selTickets !== "tickets_resueltos"}>
                  {chartData.map((e) => <Cell key={e.mes} fill={CLR.emerald} fillOpacity={e.in_range === false ? 0.25 : 0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Gráfico 5 — Fidelización: nuevas suscripciones + usuarios recurrentes (full-width) */}
          <ChartCard
            title="Fidelización"
            subtitle="Suscripciones nuevas por mes y usuarios que regresan cada mes"
            chartId="fidelizacion"
            className="lg:col-span-2"
            legend={[
              { key: "nuevas_suscripciones",  label: "Nuevas suscripciones", color: CLR.violet },
              { key: "usuarios_recurrentes",  label: "Usuarios recurrentes",  color: CLR.emerald },
            ]}
            selected={selFidelizacion}
            onSelect={makeToggle(setSelFidelizacion)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={GRID_STROKE} strokeOpacity={0.12} vertical={false} />
                <XAxis dataKey="mesLabel" stroke={AXIS_STROKE} strokeOpacity={0.4} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={AXIS_STROKE} strokeOpacity={0} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "transparent" }} content={<ChartTip fmt={formatNumero} />} />
                <Bar
                  dataKey="nuevas_suscripciones"
                  name="Nuevas suscripciones"
                  fill={CLR.violet}
                  fillOpacity={0.8}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                  hide={selFidelizacion !== null && selFidelizacion !== "nuevas_suscripciones"}
                >
                  {chartData.map((e) => (
                    <Cell key={e.mes} fill={CLR.violet} fillOpacity={e.in_range === false ? 0.25 : 0.8} />
                  ))}
                </Bar>
                <Area
                  type="monotone"
                  dataKey="usuarios_recurrentes"
                  name="Usuarios recurrentes"
                  stroke={CLR.emerald}
                  strokeWidth={2}
                  fill={CLR.emerald}
                  fillOpacity={0.08}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  hide={selFidelizacion !== null && selFidelizacion !== "usuarios_recurrentes"}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

        </section>
      )}

      {loading && (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonChart key={i} />)}
        </section>
      )}

      {/* Tabla resumen */}
      {!loading && data && !sinDatos && (
        <section className="zentinel-card p-5" data-pdf-section="tabla">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zentinel-gold mb-4">
            Detalle mensual
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zentinel-gold-dark/20 text-xs uppercase tracking-wider text-zentinel-text-muted">
                  <th className="text-left py-2 px-2 font-semibold">Mes</th>
                  <th className="text-right py-2 px-2 font-semibold">Nuevos</th>
                  <th className="text-right py-2 px-2 font-semibold">MAU</th>
                  <th className="text-right py-2 px-2 font-semibold">Ingresos</th>
                  <th className="text-right py-2 px-2 font-semibold">Conv.</th>
                  <th className="text-right py-2 px-2 font-semibold">Pánico</th>
                  <th className="text-right py-2 px-2 font-semibold">Zona</th>
                  <th className="text-right py-2 px-2 font-semibold">Personal</th>
                  <th className="text-right py-2 px-2 font-semibold">Abiertos</th>
                  <th className="text-right py-2 px-2 font-semibold">Resueltos</th>
                  <th className="text-right py-2 px-2 font-semibold">Días res.</th>
                </tr>
              </thead>
              <tbody>
                {[...data.series].filter(s => s.in_range !== false).reverse().map((s) => (
                  <tr key={s.mes} className="border-b border-zentinel-gold-dark/10 hover:bg-zentinel-gold/5 transition-colors">
                    <td className="py-2 px-2 font-semibold text-zentinel-text">{formatMesCorto(s.mes)}</td>
                    <td className="py-2 px-2 text-right text-zentinel-text">{s.usuarios_nuevos}</td>
                    <td className="py-2 px-2 text-right text-zentinel-text">{s.usuarios_activos}</td>
                    <td className="py-2 px-2 text-right text-zentinel-text">{formatMoneda(s.ingresos_reales)}</td>
                    <td className="py-2 px-2 text-right text-zentinel-text">{s.tasa_conversion.toFixed(1)}%</td>
                    <td className="py-2 px-2 text-right text-zentinel-text">{s.alertas_panico}</td>
                    <td className="py-2 px-2 text-right text-zentinel-text">{s.alertas_zona}</td>
                    <td className="py-2 px-2 text-right text-zentinel-text">{s.alertas_personal}</td>
                    <td className="py-2 px-2 text-right text-zentinel-text">{s.tickets_abiertos}</td>
                    <td className="py-2 px-2 text-right text-zentinel-text">{s.tickets_resueltos}</td>
                    <td className="py-2 px-2 text-right text-zentinel-text">
                      {s.tiempo_resolucion_dias != null ? `${s.tiempo_resolucion_dias.toFixed(1)}d` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
