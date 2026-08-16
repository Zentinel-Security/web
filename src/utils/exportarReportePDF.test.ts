import type { jsPDF } from "jspdf";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { exportarReportePDF } from "./exportarReportePDF";
import type {
  MetricaMensual,
  MetricasHistorico,
  MetricasHistoricoResumen,
} from "../services/metricasHistoricoService";

const mes = (overrides: Partial<MetricaMensual> = {}): MetricaMensual => ({
  mes: "2026-03",
  usuarios_nuevos: 12,
  usuarios_activos: 80,
  ingresos_reales: 45000,
  suscriptores_pago: 20,
  total_suscriptores: 100,
  tasa_conversion: 20,
  alertas_panico: 2,
  alertas_zona: 4,
  alertas_personal: 1,
  tickets_abiertos: 6,
  tickets_resueltos: 5,
  tiempo_resolucion_dias: 1.5,
  total_usuarios_registrados: 200,
  nuevas_suscripciones: 3,
  usuarios_recurrentes: 55,
  tasa_retencion: 68,
  ...overrides,
});

const resumen = (
  overrides: Partial<MetricasHistoricoResumen> = {},
): MetricasHistoricoResumen => ({
  total_usuarios_nuevos: 34,
  mau_promedio: 80,
  ingresos_periodo: 1_450_000,
  tasa_conversion_actual: 20,
  total_alertas: 7,
  tickets_pendientes_hoy: 1,
  tasa_conversion_promedio: 18.55,
  tickets_abiertos_periodo: 6,
  nuevas_suscripciones_periodo: 3,
  tasa_retencion_promedio: 68.4,
  usuarios_perdidos: 2,
  delta_usuarios_nuevos: 12.5,
  delta_mau: -4.2,
  delta_ingresos: 0,
  delta_conversion: null,
  delta_tickets_abiertos: 1.1,
  delta_nuevas_suscripciones: null,
  prev_usuarios_nuevos: 30,
  prev_mau: 84,
  prev_ingresos: 1_450_000,
  prev_conversion: 18,
  prev_tickets_abiertos: 5,
  prev_nuevas_suscripciones: 3,
  ...overrides,
});

const datos = (overrides: Partial<MetricasHistorico> = {}): MetricasHistorico => ({
  rango: { desde: "2026-01", hasta: "2026-03" },
  series: [mes({ mes: "2026-01" }), mes({ mes: "2026-02" }), mes()],
  resumen: resumen(),
  ...overrides,
});

// jsPDF define `save` como propiedad de instancia, así que se intercepta en el constructor
// para no disparar la descarga real durante los tests.
const { archivosGuardados } = vi.hoisted(() => ({ archivosGuardados: [] as string[] }));

vi.mock("jspdf", async () => {
  const actual = await vi.importActual<typeof import("jspdf")>("jspdf");
  class JsPDFEspiado extends actual.jsPDF {
    constructor(...args: ConstructorParameters<typeof actual.jsPDF>) {
      super(...args);
      const espia = (
        filename?: string,
        options?: { returnPromise: true },
      ): jsPDF | Promise<void> => {
        archivosGuardados.push(filename ?? "");
        return options?.returnPromise ? Promise.resolve() : this;
      };
      this.save = espia as jsPDF["save"];
    }
  }
  return { ...actual, jsPDF: JsPDFEspiado, default: JsPDFEspiado };
});

describe("exportarReportePDF", () => {
  beforeEach(() => {
    archivosGuardados.length = 0;
  });

  it("genera y descarga el reporte con el nombre del período", () => {

    exportarReportePDF(datos());

    expect(archivosGuardados).toEqual(["zentinel-reporte-2026-01-a-2026-03.pdf"]);
  });

  it("excluye del gráfico los meses fuera del rango", () => {

    exportarReportePDF(
      datos({
        series: [
          mes({ mes: "2025-12", in_range: false }),
          mes({ mes: "2026-01" }),
          mes({ mes: "2026-02" }),
        ],
      }),
    );

    expect(archivosGuardados).toHaveLength(1);
  });

  it("soporta series vacías, retención nula y montos chicos", () => {

    exportarReportePDF(
      datos({
        series: [
          mes({
            mes: "2026-01",
            usuarios_nuevos: 0,
            usuarios_activos: 0,
            ingresos_reales: 500,
            alertas_panico: 0,
            alertas_zona: 0,
            alertas_personal: 0,
            tickets_abiertos: 0,
            tickets_resueltos: 0,
            tiempo_resolucion_dias: null,
          }),
        ],
        resumen: resumen({
          tasa_retencion_promedio: null,
          ingresos_periodo: 900,
          delta_usuarios_nuevos: null,
          delta_mau: null,
          delta_ingresos: null,
        }),
      }),
    );

    expect(archivosGuardados).toHaveLength(1);
  });

  it("genera el reporte para un período largo de doce meses", () => {

    exportarReportePDF(
      datos({
        rango: { desde: "2025-04", hasta: "2026-03" },
        series: Array.from({ length: 12 }, (_, i) =>
          mes({
            mes: `2025-${String(i + 1).padStart(2, "0")}`,
            ingresos_reales: 1000 * (i + 1) * 1000,
          }),
        ),
      }),
    );

    expect(archivosGuardados).toEqual(["zentinel-reporte-2025-04-a-2026-03.pdf"]);
  });
});
