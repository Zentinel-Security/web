import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { MetricasHistorico } from "../services/metricasHistoricoService";

// ─── Utilidades de formato ───────────────────────────────────────────────────

type RGB = [number, number, number];

const C = {
  // Colores de datos / gráficos (iguales al web para coherencia)
  blue:    [59,  130, 246] as RGB,
  indigo:  [99,  102, 241] as RGB,
  green:   [16,  185, 129] as RGB,
  amber:   [245, 158, 11]  as RGB,
  red:     [239, 68,  68]  as RGB,
  sky:     [14,  165, 233] as RGB,
  violet:  [139, 92,  246] as RGB,
  // Escala de grises para estructura del documento
  ink:     [15,  23,  42]  as RGB,   // slate-900 — títulos / valores
  dark:    [30,  41,  59]  as RGB,   // slate-800 — header principal
  mid:     [71,  85,  105] as RGB,   // slate-600 — subtítulos
  muted:   [100, 116, 139] as RGB,   // slate-500 — etiquetas KPI
  subtle:  [148, 163, 184] as RGB,   // slate-400 — ejes / leyendas
  rule:    [203, 213, 225] as RGB,   // slate-300 — líneas divisorias
  bg:      [248, 250, 252] as RGB,   // slate-50  — fondo tarjetas
  white:   [255, 255, 255] as RGB,
};

const fmtMes = (mes: string) => {
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const [y, m] = mes.split("-").map(Number);
  return `${months[m - 1]} ${String(y).slice(2)}`;
};

const fmtARS = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
};
const fmtARSFull = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(n);
const fmtNum = (n: number) => new Intl.NumberFormat("es-AR").format(n);
const fmtPct = (n: number) => `${n.toFixed(1)}%`;

// ─── Motor de gráficos nativo jsPDF ─────────────────────────────────────────

interface Series {
  label: string;
  color: RGB;
  values: number[];
  type: "bar" | "line";
  opacity?: number;
}

interface ChartConfig {
  x: number; y: number; w: number; h: number;
  title: string;
  xLabels: string[];
  series: Series[];
  yFmt?: (v: number) => string;
  stacked?: boolean;
  noLegend?: boolean;
}

function drawChart(pdf: jsPDF, cfg: ChartConfig): void {
  const TITLE_H  = 8;
  const XAXIS_H  = 9;
  const YAXIS_W  = 18;
  const PAD_R    = 4;
  const PAD_TOP  = 2;
  const LEGEND_H = cfg.noLegend ? 0 : 7;

  // Outer card
  pdf.setFillColor(...C.white);
  pdf.setDrawColor(...C.rule);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(cfg.x, cfg.y, cfg.w, cfg.h, 2, 2, "FD");

  // Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...C.mid);
  pdf.text(cfg.title.toUpperCase(), cfg.x + 4, cfg.y + TITLE_H - 1);

  // Inner plot area
  const px = cfg.x + YAXIS_W;
  const py = cfg.y + TITLE_H + PAD_TOP;
  const pw = cfg.w - YAXIS_W - PAD_R;
  const ph = cfg.h - TITLE_H - PAD_TOP - XAXIS_H - LEGEND_H;

  // ── Compute Y range ──────────────────────────────────────────────────────
  let allVals: number[] = [];
  if (cfg.stacked) {
    // For stacked: sum each bucket
    const n = cfg.xLabels.length;
    for (let i = 0; i < n; i++) {
      const sum = cfg.series.reduce((acc, s) => acc + (s.values[i] ?? 0), 0);
      allVals.push(sum);
    }
  } else {
    cfg.series.forEach((s) => allVals.push(...s.values));
  }
  allVals = allVals.filter(isFinite);
  const rawMax = Math.max(...allVals, 1);
  const rawMin = 0;

  // Nice ceiling for Y axis
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const niceMax = Math.ceil(rawMax / magnitude) * magnitude;
  const yTicks = 4;
  const tickStep = niceMax / yTicks;

  const toPlotY = (v: number) => py + ph - (v / niceMax) * ph;
  const barWidth = (total: number) => pw / total * 0.75;

  // ── Grid lines + Y labels ────────────────────────────────────────────────
  for (let t = 0; t <= yTicks; t++) {
    const val = t * tickStep;
    const gy = toPlotY(val);

    // Gridline (dashed: series of small segments)
    pdf.setDrawColor(...C.rule);
    pdf.setLineWidth(0.2);
    const segLen = 2, gap = 1.5;
    let sx = px;
    while (sx < px + pw) {
      pdf.line(sx, gy, Math.min(sx + segLen, px + pw), gy);
      sx += segLen + gap;
    }

    // Y label
    const yFmt = cfg.yFmt ?? ((v) => fmtNum(Math.round(v)));
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(5.5);
    pdf.setTextColor(...C.subtle);
    pdf.text(yFmt(val), px - 1, gy + 1.2, { align: "right" });
  }

  // ── X labels ─────────────────────────────────────────────────────────────
  const n = cfg.xLabels.length;
  const slotW = pw / n;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.5);
  pdf.setTextColor(...C.subtle);
  cfg.xLabels.forEach((lbl, i) => {
    const cx = px + i * slotW + slotW / 2;
    pdf.text(lbl, cx, py + ph + 6, { align: "center" });
  });

  // ── Clip drawing to inner area (approximate by careful math) ─────────────

  // ── Draw series ──────────────────────────────────────────────────────────
  if (cfg.stacked) {
    // Stacked bars
    const bw = barWidth(n) * 0.85;
    for (let i = 0; i < n; i++) {
      const cx = px + i * slotW + slotW / 2;
      let base = py + ph;
      cfg.series.forEach((s) => {
        const v = s.values[i] ?? 0;
        if (v <= 0) return;
        const barH = (v / niceMax) * ph;
        const bx = cx - bw / 2;
        const by = base - barH;
        pdf.setFillColor(...s.color);
        pdf.rect(bx, by, bw, barH, "F");
        base -= barH;
      });
    }
  } else {
    // Bars first (so lines render on top)
    const barSeries = cfg.series.filter((s) => s.type === "bar");
    const bw = barWidth(n) / (barSeries.length || 1) * 0.88;

    barSeries.forEach((s, si) => {
      const totalBars = barSeries.length;
      const totalW = bw * totalBars;
      for (let i = 0; i < n; i++) {
        const v = s.values[i] ?? 0;
        const barH = ((v - rawMin) / (niceMax - rawMin || 1)) * ph;
        const cx = px + i * slotW + slotW / 2;
        const bx = cx - totalW / 2 + si * bw;
        const by = py + ph - barH;
        const alpha = s.opacity ?? 1;
        // Simulate alpha by mixing with white
        const blended: RGB = [
          Math.round(s.color[0] * alpha + 255 * (1 - alpha)),
          Math.round(s.color[1] * alpha + 255 * (1 - alpha)),
          Math.round(s.color[2] * alpha + 255 * (1 - alpha)),
        ];
        pdf.setFillColor(...blended);
        if (barH > 0) pdf.rect(bx, by, bw, barH, "F");
      }
    });

    // Lines on top
    cfg.series.filter((s) => s.type === "line").forEach((s) => {
      pdf.setDrawColor(...s.color);
      pdf.setLineWidth(0.7);
      const pts: [number, number][] = s.values.map((v, i) => [
        px + i * slotW + slotW / 2,
        toPlotY(v ?? 0),
      ]);
      for (let i = 0; i < pts.length - 1; i++) {
        pdf.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
      }
      // Dots
      pts.forEach(([dx, dy]) => {
        pdf.setFillColor(...s.color);
        pdf.circle(dx, dy, 0.8, "F");
      });
    });
  }

  // Baseline
  pdf.setDrawColor(...C.rule);
  pdf.setLineWidth(0.3);
  pdf.line(px, py + ph, px + pw, py + ph);

  // ── Legend ────────────────────────────────────────────────────────────────
  if (!cfg.noLegend) {
    let lx = cfg.x + 4;
    const ly = cfg.y + cfg.h - 3.5;
    cfg.series.forEach((s) => {
      pdf.setFillColor(...s.color);
      pdf.rect(lx, ly - 2.5, 3, 2.5, "F");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(5.5);
      pdf.setTextColor(...C.muted);
      pdf.text(s.label, lx + 4, ly - 0.3);
      lx += 4 + pdf.getTextWidth(s.label) + 5;
    });
  }
}

// ─── Función pública principal ────────────────────────────────────────────────

export function exportarReportePDF(
  data: MetricasHistorico,
): void {
  const pdf    = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW     = pdf.internal.pageSize.getWidth();   // 210
  const PH     = pdf.internal.pageSize.getHeight();  // 297
  const M      = 14;
  const CW     = PW - M * 2;  // 182

  const addFooter = () => {
    const pg  = pdf.getNumberOfPages();
    pdf.setPage(pg);
    const fpw = pdf.internal.pageSize.getWidth();
    const fph = pdf.internal.pageSize.getHeight();
    pdf.setDrawColor(...C.rule);
    pdf.setLineWidth(0.3);
    pdf.line(M, fph - 11, fpw - M, fph - 11);
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...C.subtle);
    pdf.text("Usuarios activos = MAU (usuarios con al menos una sesion activa en el mes). Ingresos = pagos cobrados via Mercado Pago.", M, fph - 8);
    pdf.text("\u2191 1er per. indica primer per\u00edodo con datos (sin per\u00edodo anterior para comparar).", M, fph - 5);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${pg}`, fpw - M, fph - 5, { align: "right" });
  };

  // ═══════════════════════════════ PÁGINA 1 ════════════════════════════════

  // ── Header ────────────────────────────────────────────────────────────────
  pdf.setFillColor(...C.dark);
  pdf.rect(0, 0, PW, 32, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(...C.white);
  pdf.text("Zentinel", M, 12);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(148, 163, 184);
  pdf.text("Reporte de Metricas Historicas", M, 20);

  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Periodo: ${data.rango.desde}  a  ${data.rango.hasta}`, M, 27);
  pdf.text(
    `Generado: ${new Date().toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
    PW - M, 27, { align: "right" },
  );

  let y = 40;

  // ── KPIs 3×2 ─────────────────────────────────────────────────────────────
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(...C.muted);
  pdf.text("RESUMEN DEL PERIODO", M, y);
  pdf.setDrawColor(...C.rule);
  pdf.setLineWidth(0.2);
  pdf.line(M, y + 1.5, PW - M, y + 1.5);
  y += 5;

  const kpis = [
    { label: "Usuarios nuevos",      value: `+${fmtNum(data.resumen.total_usuarios_nuevos)}`,                                                delta: data.resumen.delta_usuarios_nuevos },
    { label: "Usuarios activos/mes", value: `${fmtNum(data.resumen.mau_promedio)}/mes`,                                                      delta: data.resumen.delta_mau },
    { label: "Ingresos del periodo", value: fmtARSFull(data.resumen.ingresos_periodo),                                                        delta: data.resumen.delta_ingresos },
    { label: "Usuarios de pago",     value: fmtPct(data.resumen.tasa_conversion_promedio),                                                   delta: data.resumen.delta_conversion },
    { label: "Suscripciones nuevas", value: `+${fmtNum(data.resumen.nuevas_suscripciones_periodo)}`,                                         delta: data.resumen.delta_nuevas_suscripciones },
    { label: "Retencion mensual",    value: data.resumen.tasa_retencion_promedio !== null ? fmtPct(data.resumen.tasa_retencion_promedio) : "\u2014", delta: null },
  ];

  const KCW = (CW - 6) / 3;   // 3 cols, 2 gaps of 3mm
  const KCH = 20;

  kpis.forEach((kpi, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const kx  = M + col * (KCW + 3);
    const ky  = y + row * (KCH + 3);

    // Card: fondo blanco, borde gris sutil, sin acento de color
    pdf.setFillColor(...C.white);
    pdf.setDrawColor(...C.rule);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(kx, ky, KCW, KCH, 1.5, 1.5, "FD");
    // Thin left accent line (neutral slate)
    pdf.setFillColor(...C.mid);
    pdf.rect(kx, ky, 1.2, KCH, "F");

    // Label
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.setTextColor(...C.muted);
    pdf.text(kpi.label, kx + 4, ky + 7);

    // Value
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...C.ink);
    // Truncate long monetary strings
    let valStr = kpi.value;
    while (pdf.getTextWidth(valStr) > KCW - 7 && valStr.length > 3) {
      valStr = valStr.slice(0, -1);
    }
    pdf.text(valStr, kx + 4, ky + 14);

    // Delta
    pdf.setFontSize(6.5);
    pdf.setFont("helvetica", "normal");
    if (kpi.delta !== null && kpi.delta !== undefined) {
      const d = kpi.delta;
      const sign = d > 0 ? "+" : d < 0 ? "-" : "=";
      if (d > 0) pdf.setTextColor(...C.green);
      else if (d < 0) pdf.setTextColor(...C.red);
      else pdf.setTextColor(...C.subtle);
      pdf.text(`${sign}${Math.abs(d).toFixed(1)}%`, kx + 4, ky + 19);
    } else {
      pdf.setTextColor(...C.subtle);
      pdf.text("1er per.", kx + 4, ky + 19);
    }
  });

  y += 2 * (KCH + 3) + 6;

  // ── Gráficos 2×2 ─────────────────────────────────────────────────────────
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(...C.muted);
  pdf.text("ANALISIS GRAFICO POR MES", M, y);
  pdf.setDrawColor(...C.rule);
  pdf.setLineWidth(0.2);
  pdf.line(M, y + 1.5, PW - M, y + 1.5);
  y += 5;

  const series = data.series.filter((s) => s.in_range !== false);
  const xLbls  = series.map((s) => fmtMes(s.mes));
  const GAP    = 4;
  const CHW    = (CW - GAP) / 2;   // ~89mm
  const CHH    = 56;                // chart height

  // Check page space for charts (2 rows × 56mm + gaps)
  if (y + 2 * (CHH + GAP) > PH - 20) {
    addFooter();
    pdf.addPage();
    y = M;
  }

  // Chart 1 — Usuarios nuevos (bar) + MAU (line)
  drawChart(pdf, {
    x: M, y, w: CHW, h: CHH,
    title: "Usuarios nuevos vs. MAU",
    xLabels: xLbls,
    series: [
      { label: "Nuevos",  color: C.blue,  type: "bar",  values: series.map((s) => s.usuarios_nuevos), opacity: 0.85 },
      { label: "MAU",     color: C.green, type: "line", values: series.map((s) => s.usuarios_activos) },
    ],
    yFmt: (v) => fmtNum(Math.round(v)),
  });

  // Chart 2 — Ingresos cobrados (Mercado Pago)
  drawChart(pdf, {
    x: M + CHW + GAP, y, w: CHW, h: CHH,
    title: "Ingresos cobrados (Mercado Pago)",
    xLabels: xLbls,
    series: [
      { label: "Cobrado", color: C.amber, type: "bar", values: series.map((s) => s.ingresos_reales), opacity: 0.85 },
    ],
    noLegend: true,
    yFmt: fmtARS,
  });

  y += CHH + GAP;

  // Check page
  if (y + CHH > PH - 20) {
    addFooter();
    pdf.addPage();
    y = M;
  }

  // Chart 3 — Alertas apiladas
  drawChart(pdf, {
    x: M, y, w: CHW, h: CHH,
    title: "Alertas por tipo",
    xLabels: xLbls,
    series: [
      { label: "Panico",    color: C.red,   type: "bar", values: series.map((s) => s.alertas_panico) },
      { label: "Zona",      color: C.amber, type: "bar", values: series.map((s) => s.alertas_zona) },
      { label: "Personal",  color: C.sky,   type: "bar", values: series.map((s) => s.alertas_personal) },
    ],
    stacked: true,
    yFmt: (v) => fmtNum(Math.round(v)),
  });

  // Chart 4 — Tickets
  drawChart(pdf, {
    x: M + CHW + GAP, y, w: CHW, h: CHH,
    title: "Tickets abiertos vs. resueltos",
    xLabels: xLbls,
    series: [
      { label: "Abiertos",  color: C.amber, type: "bar",  values: series.map((s) => s.tickets_abiertos), opacity: 0.85 },
      { label: "Resueltos", color: C.green, type: "bar",  values: series.map((s) => s.tickets_resueltos), opacity: 0.85 },
    ],
    yFmt: (v) => fmtNum(Math.round(v)),
  });

  y += CHH + GAP;

  addFooter();

  // ═══════════════════════════════ PÁGINA 2 ════════════════════════════════
  pdf.addPage("a4", "landscape");   // landscape para que la tabla no quede apretada
  const PW2 = pdf.internal.pageSize.getWidth();   // 297 en landscape
  const M2  = 14;
  y = M2;

  // ── Header compacto (sin azul) ─────────────────────────────────────────
  pdf.setFillColor(...C.ink);
  pdf.rect(0, 0, PW2, 14, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...C.white);
  pdf.text("Zentinel \u2014 Detalle mensual", M2, 9);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...C.subtle);
  pdf.text(`Per\u00edodo: ${data.rango.desde}  \u2014  ${data.rango.hasta}`, PW2 - M2, 9, { align: "right" });

  y = 20;

  // ── Tabla ─────────────────────────────────────────────────────────────────
  autoTable(pdf, {
    startY: y,
    head: [[
      "Mes", "Nuevos", "Activos/mes", "Ingresos", "De pago %",
      "Al. Pánico", "Al. Zona", "Al. Personal",
      "Tickets Ab.", "Tickets Res.", "Resolución (d)",
    ]],
    body: [...series].reverse().map((s) => [
      fmtMes(s.mes),
      fmtNum(s.usuarios_nuevos),
      fmtNum(s.usuarios_activos),
      fmtARSFull(s.ingresos_reales),
      fmtPct(s.tasa_conversion),
      fmtNum(s.alertas_panico),
      fmtNum(s.alertas_zona),
      fmtNum(s.alertas_personal),
      fmtNum(s.tickets_abiertos),
      fmtNum(s.tickets_resueltos),
      s.tiempo_resolucion_dias != null ? `${s.tiempo_resolucion_dias.toFixed(1)}d` : "-",
    ]),
    headStyles: {
      fillColor: C.ink,
      textColor: C.white,
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles:          { fontSize: 8, textColor: C.ink, halign: "right" },
    alternateRowStyles:  { fillColor: C.bg },
    margin:              { left: M2, right: M2 },
    styles:              { cellPadding: 2.5, overflow: "ellipsize" },
    columnStyles:        { 0: { halign: "left", fontStyle: "bold", cellWidth: 16 } },
    didDrawPage: () => addFooter(),
  });

  // Footer última página
  addFooter();

  pdf.save(`zentinel-reporte-${data.rango.desde}-a-${data.rango.hasta}.pdf`);
}
