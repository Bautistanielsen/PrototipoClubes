import type { EstadoSocio, Socio, Reserva, VentaShop, Egreso, Partido, TipoPartido, Torneo, EstadoTorneo, EquipoTorneo, PartidoTorneo } from '../types';
import { formatMoney } from './format';

export const CUOTA = 12000;
export const PRECIO_TURNO = 8000;
export const HOY_ISO = '2026-07-29';

export const estadoMeta: Record<EstadoSocio, { label: string; bg: string; color: string }> = {
  al_dia: { label: 'Al día', bg: '#e5f6ea', color: '#1a7d43' },
  por_vencer: { label: 'Por vencer', bg: '#fdf0dc', color: '#a15c00' },
  moroso: { label: 'Moroso', bg: '#fbe6e9', color: '#c1293c' },
};

export const tipoPartidoMeta: Record<TipoPartido, { bg: string; color: string }> = {
  Liga: { bg: '#eaeefb', color: '#1b3a8a' },
  Amistoso: { bg: '#eef0f5', color: '#4b5468' },
  Copa: { bg: '#fdf0dc', color: '#a15c00' },
  Torneo: { bg: '#e5f6ea', color: '#1a7d43' },
};

export interface CuotasResumen {
  totalSocios: number;
  countAlDia: number;
  countPorVencer: number;
  countMoroso: number;
  esperadoMes: number;
  recaudadoMes: number;
  pendienteMes: number;
  porVencerMonto: number;
  deudaTotal: number;
  pctRecaudado: number;
  pctPorVencer: number;
  pctMoroso: number;
}

export function cuotasResumen(socios: Socio[]): CuotasResumen {
  const totalSocios = socios.length;
  const countAlDia = socios.filter((x) => x.estado === 'al_dia').length;
  const countPorVencer = socios.filter((x) => x.estado === 'por_vencer').length;
  const countMoroso = socios.filter((x) => x.estado === 'moroso').length;
  const esperadoMes = totalSocios * CUOTA;
  const recaudadoMes = countAlDia * CUOTA;
  const pendienteMes = esperadoMes - recaudadoMes;
  const porVencerMonto = countPorVencer * CUOTA;
  const deudaTotal = socios.reduce((a, x) => a + (x.deuda || 0), 0);
  const pctRecaudado = Math.round((recaudadoMes / esperadoMes) * 100);
  const pctPorVencer = Math.round((porVencerMonto / esperadoMes) * 100);
  const pctMoroso = Math.max(0, 100 - pctRecaudado - pctPorVencer);
  return {
    totalSocios,
    countAlDia,
    countPorVencer,
    countMoroso,
    esperadoMes,
    recaudadoMes,
    pendienteMes,
    porVencerMonto,
    deudaTotal,
    pctRecaudado,
    pctPorVencer,
    pctMoroso,
  };
}

export interface IngresosPorFuente {
  ingresoSocios: number;
  ingresoCanchas: number;
  ingresoVentas: number;
  totalIngresos: number;
  pctIngresoSocios: number;
  pctIngresoCanchas: number;
  pctIngresoVentas: number;
  ingresoSociosDetalle: string;
  ingresoCanchasDetalle: string;
  ingresoVentasDetalle: string;
}

export function ingresosPorFuente(recaudadoMes: number, countAlDia: number, reservas: Reserva[], ventasShop: VentaShop[]): IngresosPorFuente {
  const ingresoSocios = recaudadoMes;
  const ingresoCanchas = reservas.length * PRECIO_TURNO;
  const ingresoVentas = ventasShop.reduce((a, v) => a + v.precio, 0);
  const totalFuentes = ingresoSocios + ingresoCanchas + ingresoVentas || 1;
  const totalIngresos = ingresoSocios + ingresoCanchas + ingresoVentas;
  return {
    ingresoSocios,
    ingresoCanchas,
    ingresoVentas,
    totalIngresos,
    pctIngresoSocios: Math.round((ingresoSocios / totalFuentes) * 100),
    pctIngresoCanchas: Math.round((ingresoCanchas / totalFuentes) * 100),
    pctIngresoVentas: Math.round((ingresoVentas / totalFuentes) * 100),
    ingresoSociosDetalle: `${countAlDia} socios x ${formatMoney(CUOTA)}`,
    ingresoCanchasDetalle: `${reservas.length} turnos reservados x ${formatMoney(PRECIO_TURNO)}`,
    ingresoVentasDetalle: `${ventasShop.length} venta${ventasShop.length === 1 ? '' : 's'} registrada${ventasShop.length === 1 ? '' : 's'}`,
  };
}

export function balanceMes(recaudadoMes: number, reservas: Reserva[], ventasShop: VentaShop[], egresos: Egreso[]): number {
  return (
    recaudadoMes +
    reservas.length * PRECIO_TURNO +
    ventasShop.reduce((a, v) => a + v.precio, 0) -
    egresos.reduce((a, e) => a + e.monto, 0)
  );
}

export function totalEgresos(egresos: Egreso[]): number {
  return egresos.reduce((a, e) => a + e.monto, 0);
}

export interface EgresoConPct extends Egreso {
  montoLabel: string;
  pct: number;
}

export function egresosOrdenadosPorMonto(egresos: Egreso[]): EgresoConPct[] {
  const maxEgreso = Math.max(...egresos.map((e) => e.monto), 1);
  return [...egresos]
    .sort((a, b) => b.monto - a.monto)
    .map((e) => ({ ...e, montoLabel: formatMoney(e.monto), pct: Math.round((e.monto / maxEgreso) * 100) }));
}

export function topEgreso(egresos: Egreso[]): { categoria: string; montoLabel: string; pct: number } | null {
  if (!egresos.length) return null;
  const top = egresos.reduce((a, b) => (b.monto > a.monto ? b : a));
  const total = totalEgresos(egresos);
  return { categoria: top.categoria, montoLabel: formatMoney(top.monto), pct: total ? Math.round((top.monto / total) * 100) : 0 };
}

const CREST_PALETTE = [
  { from: '#233b73', to: '#4a5fa0', emblem: '#d4a72c', diamond: true },
  { from: '#7a1f2b', to: '#a83a48', emblem: '#f2d675', diamond: false },
  { from: '#1f5c3a', to: '#3d8a5e', emblem: '#ffffff', diamond: true },
  { from: '#4b2e6b', to: '#7a55a3', emblem: '#c7cede', diamond: false },
  { from: '#0f5c66', to: '#2f8b96', emblem: '#f4923a', diamond: true },
];

export function crestForRival(rival: string) {
  let hash = 0;
  for (let i = 0; i < rival.length; i++) hash += rival.charCodeAt(i);
  return CREST_PALETTE[hash % CREST_PALETTE.length];
}

export interface CalendarCellBlank {
  blank: true;
}
export interface CalendarCellDay {
  blank: false;
  day: number;
  iso: string;
  isToday: boolean;
  match: Partido | null;
}
export type CalendarCell = CalendarCellBlank | CalendarCellDay;

export function buildCalendarCells(year: number, month: number, partidos: Partido[]): CalendarCell[] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({ blank: true });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const match = partidos.find((p) => p.fecha === iso) || null;
    cells.push({ blank: false, day: d, iso, isToday: iso === HOY_ISO, match });
  }
  while (cells.length % 7 !== 0) cells.push({ blank: true });
  return cells;
}

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const CALENDAR_WEEK_DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export const TIPO_LEGEND: { tipo: TipoPartido; bg: string }[] = [
  { tipo: 'Liga', bg: '#1b3a8a' },
  { tipo: 'Amistoso', bg: '#8b93a5' },
  { tipo: 'Copa', bg: '#a15c00' },
  { tipo: 'Torneo', bg: '#1a7d43' },
];

export const TENDENCIA_BASE = [
  { mes: 'Feb', monto: 198000 },
  { mes: 'Mar', monto: 205000 },
  { mes: 'Abr', monto: 210000 },
  { mes: 'May', monto: 192000 },
  { mes: 'Jun', monto: 216000 },
];
export const TENDENCIA_MAX = 216000;

export function estadoTorneo(t: Torneo, hoyIso: string): EstadoTorneo {
  if (hoyIso < t.fechaInicio) return 'Próximo';
  if (hoyIso > t.fechaFin) return 'Finalizado';
  return 'En curso';
}

export const estadoTorneoMeta: Record<EstadoTorneo, { bg: string; color: string }> = {
  'Próximo': { bg: '#eaeefb', color: '#1b3a8a' },
  'En curso': { bg: '#e5f6ea', color: '#1a7d43' },
  'Finalizado': { bg: '#eef0f5', color: '#6b7488' },
};

export interface FilaTabla {
  equipoId: number;
  nombre: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

export function tablaPosiciones(torneoId: number, equipos: EquipoTorneo[], partidos: PartidoTorneo[]): FilaTabla[] {
  const equiposDelTorneo = equipos.filter((eq) => eq.torneoId === torneoId);
  const filas: Record<number, FilaTabla> = {};
  equiposDelTorneo.forEach((eq) => {
    filas[eq.id] = { equipoId: eq.id, nombre: eq.nombre, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
  });
  partidos
    .filter((p) => p.torneoId === torneoId && p.golesLocal !== null && p.golesVisitante !== null)
    .forEach((p) => {
      const local = filas[p.equipoLocalId];
      const visitante = filas[p.equipoVisitanteId];
      if (!local || !visitante) return;
      const gl = p.golesLocal as number;
      const gv = p.golesVisitante as number;
      local.pj++;
      visitante.pj++;
      local.gf += gl;
      local.gc += gv;
      visitante.gf += gv;
      visitante.gc += gl;
      if (gl > gv) {
        local.g++;
        local.pts += 3;
        visitante.p++;
      } else if (gl < gv) {
        visitante.g++;
        visitante.pts += 3;
        local.p++;
      } else {
        local.e++;
        visitante.e++;
        local.pts += 1;
        visitante.pts += 1;
      }
    });
  Object.values(filas).forEach((f) => (f.dg = f.gf - f.gc));
  return Object.values(filas).sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
}

export const TURNO_HORAS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
];
