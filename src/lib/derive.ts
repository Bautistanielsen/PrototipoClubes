import type { EstadoSocio, Socio, Reserva, VentaShop, VentaBuffet, Egreso, Partido, TipoPartido, Torneo, EstadoTorneo, EquipoTorneo, PartidoTorneo, MedioPago, Categoria, Cancha, Pago, InscripcionTorneo, Comunicado, Sponsor } from '../types';
import { formatMoney } from './format';

const DESTINATARIO_ESTADO: Record<string, EstadoSocio> = {
  'Socios al día': 'al_dia',
  'Socios por vencer': 'por_vencer',
  'Socios morosos': 'moroso',
};

/** Un comunicado le llega a un socio si se envió por la app (o ambos canales) y fue dirigido a "Todos" o a su segmento de estado de cuota. */
export function comunicadoAlcanzaSocio(comunicado: Comunicado, socio: Socio): boolean {
  if (comunicado.canal === 'whatsapp') return false;
  const estadoObjetivo = DESTINATARIO_ESTADO[comunicado.destinatario];
  return !estadoObjetivo || estadoObjetivo === socio.estado;
}

function fechaHoraOrdenable(c: Comunicado): string {
  const [dia, mes, anio] = c.fecha.split('/');
  return `${anio}-${mes}-${dia} ${c.hora}`;
}

/** Comunicados que le corresponden a un socio según a quién fueron dirigidos, sin los que archivó, del más reciente al más viejo. */
export function comunicadosParaSocio(comunicados: Comunicado[], socio: Socio, ocultos: number[] = []): Comunicado[] {
  return comunicados
    .filter((c) => comunicadoAlcanzaSocio(c, socio) && !ocultos.includes(c.id))
    .sort((a, b) => fechaHoraOrdenable(b).localeCompare(fechaHoraOrdenable(a)));
}

export const CUOTA = 12000;
export const HOY_ISO = '2026-07-29';
export const DIA_VENCIMIENTO_CUOTA = 5;

/** Monto de cuota mensual de un socio según su categoría configurada en Config. */
export function cuotaDeSocio(socio: Socio, categorias: Categoria[]): number {
  return categorias.find((c) => c.id === socio.categoriaId)?.monto ?? CUOTA;
}

/** Próximo vencimiento de cuota en formato ISO, según el día fijo del club (5 de cada mes). */
export function proximoVencimientoCuota(hoyIso: string): string {
  const [year, month, day] = hoyIso.split('-').map(Number);
  const mesVencimiento = day <= DIA_VENCIMIENTO_CUOTA ? month : month + 1;
  const anioVencimiento = mesVencimiento > 12 ? year + 1 : year;
  const mes = ((mesVencimiento - 1) % 12) + 1;
  return `${anioVencimiento}-${String(mes).padStart(2, '0')}-${String(DIA_VENCIMIENTO_CUOTA).padStart(2, '0')}`;
}

/** Último vencimiento de cuota ya pasado en formato ISO — el ciclo que un socio moroso dejó impago. */
export function ultimoVencimientoCuotaVencido(hoyIso: string): string {
  const [year, month, day] = hoyIso.split('-').map(Number);
  const mesVencimiento = day <= DIA_VENCIMIENTO_CUOTA ? month - 1 : month;
  const anioVencimiento = mesVencimiento < 1 ? year - 1 : year;
  const mes = ((mesVencimiento - 1 + 12) % 12) + 1;
  return `${anioVencimiento}-${String(mes).padStart(2, '0')}-${String(DIA_VENCIMIENTO_CUOTA).padStart(2, '0')}`;
}

export interface PagoHistorial {
  fecha: string;
  monto: number;
  medioPago: MedioPago;
}

/** Últimos N pagos de cuota del socio, retrocediendo mes a mes desde `ultimoPago` (dd/mm/aaaa). */
export function historialPagosSocio(socio: Socio, categorias: Categoria[], cantidad = 4): PagoHistorial[] {
  if (!socio.ultimoPago) return [];
  const [diaStr, mesStr, anioStr] = socio.ultimoPago.split('/');
  const dia = Number(diaStr);
  const mesInicial = Number(mesStr);
  const anioInicial = Number(anioStr);
  if (!dia || !mesInicial || !anioInicial) return [];

  const medioPago = socio.medioPago ?? 'Efectivo';
  const monto = cuotaDeSocio(socio, categorias);
  const historial: PagoHistorial[] = [];
  for (let i = 0; i < cantidad; i++) {
    let mes = mesInicial - i;
    let anio = anioInicial;
    while (mes <= 0) {
      mes += 12;
      anio -= 1;
    }
    const diasEnMes = new Date(anio, mes, 0).getDate();
    const diaAjustado = Math.min(dia, diasEnMes);
    historial.push({ fecha: `${String(diaAjustado).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${anio}`, monto, medioPago });
  }
  return historial;
}

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

export function cuotasResumen(socios: Socio[], categorias: Categoria[]): CuotasResumen {
  const totalSocios = socios.length;
  const countAlDia = socios.filter((x) => x.estado === 'al_dia').length;
  const countPorVencer = socios.filter((x) => x.estado === 'por_vencer').length;
  const countMoroso = socios.filter((x) => x.estado === 'moroso').length;
  const esperadoMes = socios.reduce((a, x) => a + cuotaDeSocio(x, categorias), 0);
  const recaudadoMes = socios.filter((x) => x.estado === 'al_dia').reduce((a, x) => a + cuotaDeSocio(x, categorias), 0);
  const pendienteMes = esperadoMes - recaudadoMes;
  const porVencerMonto = socios.filter((x) => x.estado === 'por_vencer').reduce((a, x) => a + cuotaDeSocio(x, categorias), 0);
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
  ingresoBuffet: number;
  ingresoTorneos: number;
  ingresoSponsors: number;
  totalIngresos: number;
  pctIngresoSocios: number;
  pctIngresoCanchas: number;
  pctIngresoVentas: number;
  pctIngresoBuffet: number;
  pctIngresoTorneos: number;
  pctIngresoSponsors: number;
  ingresoSociosDetalle: string;
  ingresoCanchasDetalle: string;
  ingresoVentasDetalle: string;
  ingresoBuffetDetalle: string;
  ingresoTorneosDetalle: string;
  ingresoSponsorsDetalle: string;
}

/** Compara si dos fechas ISO (aaaa-mm-dd) caen en el mismo año y mes. */
function mismoMes(iso: string, hoyIso: string): boolean {
  return iso.slice(0, 7) === hoyIso.slice(0, 7);
}

export function ingresosPorFuente(
  recaudadoMes: number,
  countAlDia: number,
  reservas: Reserva[],
  ventasShop: VentaShop[],
  ventasBuffet: VentaBuffet[],
  inscripcionesTorneo: InscripcionTorneo[],
  sponsors: Sponsor[],
  hoyIso: string
): IngresosPorFuente {
  const reservasDelMes = reservas.filter((r) => mismoMes(r.dia, hoyIso));
  const ingresoSocios = recaudadoMes;
  const ingresoCanchas = reservasDelMes.reduce((a, r) => a + r.monto, 0);
  const ingresoVentas = ventasShop.reduce((a, v) => a + v.precio, 0);
  const ingresoBuffet = ventasBuffet.reduce((a, v) => a + v.precio, 0);
  const ingresoTorneos = inscripcionesTorneo.reduce((a, i) => a + i.monto, 0);
  const ingresoSponsors = ingresoMensualSponsors(sponsors, hoyIso);
  const totalIngresos = ingresoSocios + ingresoCanchas + ingresoVentas + ingresoBuffet + ingresoTorneos + ingresoSponsors;
  const totalFuentes = totalIngresos || 1;
  const sponsorsVigentes = sponsors.filter((s) => estadoSponsor(s, hoyIso) !== 'Vencido').length;
  return {
    ingresoSocios,
    ingresoCanchas,
    ingresoVentas,
    ingresoBuffet,
    ingresoTorneos,
    ingresoSponsors,
    totalIngresos,
    pctIngresoSocios: Math.round((ingresoSocios / totalFuentes) * 100),
    pctIngresoCanchas: Math.round((ingresoCanchas / totalFuentes) * 100),
    pctIngresoVentas: Math.round((ingresoVentas / totalFuentes) * 100),
    pctIngresoBuffet: Math.round((ingresoBuffet / totalFuentes) * 100),
    pctIngresoTorneos: Math.round((ingresoTorneos / totalFuentes) * 100),
    pctIngresoSponsors: Math.round((ingresoSponsors / totalFuentes) * 100),
    ingresoSociosDetalle: `${countAlDia} socio${countAlDia === 1 ? '' : 's'} al día`,
    ingresoCanchasDetalle: `${reservasDelMes.length} turno${reservasDelMes.length === 1 ? '' : 's'} reservado${reservasDelMes.length === 1 ? '' : 's'}`,
    ingresoVentasDetalle: `${ventasShop.length} venta${ventasShop.length === 1 ? '' : 's'} registrada${ventasShop.length === 1 ? '' : 's'}`,
    ingresoBuffetDetalle: `${ventasBuffet.length} venta${ventasBuffet.length === 1 ? '' : 's'} registrada${ventasBuffet.length === 1 ? '' : 's'}`,
    ingresoTorneosDetalle: `${inscripcionesTorneo.length} inscripción${inscripcionesTorneo.length === 1 ? '' : 'es'}`,
    ingresoSponsorsDetalle: `${sponsorsVigentes} sponsor${sponsorsVigentes === 1 ? '' : 's'} vigente${sponsorsVigentes === 1 ? '' : 's'}`,
  };
}

export function balanceMes(
  recaudadoMes: number,
  reservas: Reserva[],
  ventasShop: VentaShop[],
  ventasBuffet: VentaBuffet[],
  inscripcionesTorneo: InscripcionTorneo[],
  egresos: Egreso[],
  sponsors: Sponsor[],
  hoyIso: string
): number {
  return (
    recaudadoMes +
    reservas.filter((r) => mismoMes(r.dia, hoyIso)).reduce((a, r) => a + r.monto, 0) +
    ventasShop.reduce((a, v) => a + v.precio, 0) +
    ventasBuffet.reduce((a, v) => a + v.precio, 0) +
    inscripcionesTorneo.reduce((a, i) => a + i.monto, 0) +
    ingresoMensualSponsors(sponsors, hoyIso) -
    egresos.filter((e) => mismoMes(e.fecha, hoyIso)).reduce((a, e) => a + e.monto, 0)
  );
}

export interface MovimientoCaja {
  id: string;
  tipo: 'ingreso' | 'egreso';
  fuente: string;
  concepto: string;
  monto: number;
  medioPago: MedioPago;
  fecha: string;
  hora: string;
}

export interface LibroCajaInput {
  pagosHoy: Pago[];
  ventasShop: VentaShop[];
  ventasBuffet: VentaBuffet[];
  reservas: Reserva[];
  canchas: Cancha[];
  inscripcionesTorneo: InscripcionTorneo[];
  torneos: Torneo[];
  egresos: Egreso[];
  hoyIso: string;
}

function numeroOrden(id: string): number {
  const partes = id.split('-');
  return Number(partes[partes.length - 1]) || 0;
}

/** Une todas las fuentes de ingresos y egresos en un único libro de caja cronológico. */
export function construirLibroCaja(input: LibroCajaInput): MovimientoCaja[] {
  const movimientos: MovimientoCaja[] = [];

  input.pagosHoy.forEach((p) =>
    movimientos.push({ id: `pago-${p.id}`, tipo: 'ingreso', fuente: 'Cuota de socio', concepto: p.nombre, monto: p.monto, medioPago: p.medio, fecha: input.hoyIso, hora: p.hora })
  );
  input.ventasShop.forEach((v) =>
    movimientos.push({ id: `venta-shop-${v.id}`, tipo: 'ingreso', fuente: 'Venta de tienda', concepto: v.producto, monto: v.precio, medioPago: v.medio, fecha: input.hoyIso, hora: v.hora })
  );
  input.ventasBuffet.forEach((v) =>
    movimientos.push({ id: `venta-buffet-${v.id}`, tipo: 'ingreso', fuente: 'Venta de buffet', concepto: `${v.producto} · ${v.tipoCliente}`, monto: v.precio, medioPago: v.medio, fecha: input.hoyIso, hora: v.hora })
  );
  input.reservas.forEach((r) => {
    const cancha = input.canchas.find((c) => c.id === r.canchaId);
    movimientos.push({
      id: `reserva-${r.id}`,
      tipo: 'ingreso',
      fuente: 'Reserva de cancha',
      concepto: `${cancha ? `${cancha.nombre} #${cancha.numero}` : 'Cancha'} · ${r.nombre}`,
      monto: r.monto,
      medioPago: r.medioPago || 'Efectivo',
      fecha: r.dia,
      hora: r.hora,
    });
  });
  input.inscripcionesTorneo.forEach((i) => {
    const torneo = input.torneos.find((t) => t.id === i.torneoId);
    movimientos.push({
      id: `torneo-${i.id}`,
      tipo: 'ingreso',
      fuente: 'Inscripción a torneo',
      concepto: `${torneo?.nombre || 'Torneo'} · ${i.nombreEquipo}`,
      monto: i.monto,
      medioPago: i.medioPago,
      fecha: input.hoyIso,
      hora: '—',
    });
  });
  input.egresos.forEach((e) =>
    movimientos.push({ id: `egreso-${e.id}`, tipo: 'egreso', fuente: e.categoria, concepto: e.detalle || e.categoria, monto: e.monto, medioPago: e.medioPago, fecha: e.fecha, hora: e.hora })
  );

  return movimientos.sort((a, b) => (a.fecha !== b.fecha ? b.fecha.localeCompare(a.fecha) : numeroOrden(b.id) - numeroOrden(a.id)));
}

export interface SaldoPorMedio {
  medio: MedioPago;
  ingresos: number;
  egresos: number;
  saldo: number;
}

const MEDIOS_PAGO: MedioPago[] = ['Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'];

/** Ingresos, egresos y saldo neto por cada medio de pago — el arqueo de caja del club. */
export function saldosPorMedioPago(movimientos: MovimientoCaja[]): SaldoPorMedio[] {
  return MEDIOS_PAGO.map((medio) => {
    const propios = movimientos.filter((m) => m.medioPago === medio);
    const ingresos = propios.filter((m) => m.tipo === 'ingreso').reduce((a, m) => a + m.monto, 0);
    const egresos = propios.filter((m) => m.tipo === 'egreso').reduce((a, m) => a + m.monto, 0);
    return { medio, ingresos, egresos, saldo: ingresos - egresos };
  });
}

export function totalEgresos(egresos: Egreso[]): number {
  return egresos.reduce((a, e) => a + e.monto, 0);
}

function agruparEgresosPorCategoria(egresos: Egreso[]): { categoria: string; monto: number }[] {
  const totales = new Map<string, number>();
  egresos.forEach((e) => totales.set(e.categoria, (totales.get(e.categoria) || 0) + e.monto));
  return Array.from(totales, ([categoria, monto]) => ({ categoria, monto }));
}

export interface EgresoCategoriaPct {
  categoria: string;
  monto: number;
  montoLabel: string;
  pct: number;
}

/** Total gastado por categoría (sumando todos los movimientos de cada una), de mayor a menor. `pct` es el % que representa sobre el total de egresos. */
export function egresosPorCategoria(egresos: Egreso[]): EgresoCategoriaPct[] {
  const agrupado = agruparEgresosPorCategoria(egresos);
  const totalEgresosMonto = totalEgresos(egresos) || 1;
  return agrupado
    .sort((a, b) => b.monto - a.monto)
    .map((e) => ({ ...e, montoLabel: formatMoney(e.monto), pct: Math.round((e.monto / totalEgresosMonto) * 100) }));
}

export function topEgreso(egresos: Egreso[]): { categoria: string; montoLabel: string; pct: number } | null {
  const agrupado = agruparEgresosPorCategoria(egresos);
  if (!agrupado.length) return null;
  const top = agrupado.reduce((a, b) => (b.monto > a.monto ? b : a));
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

export type EstadoSponsor = 'Activo' | 'Por vencer' | 'Vencido';

const DIAS_AVISO_VENCIMIENTO_SPONSOR = 30;

function diasEntre(desdeIso: string, hastaIso: string): number {
  const msPorDia = 24 * 60 * 60 * 1000;
  return Math.round((new Date(hastaIso).getTime() - new Date(desdeIso).getTime()) / msPorDia);
}

/** Un sponsor está "Por vencer" cuando le quedan 30 días o menos de vigencia, y "Vencido" cuando ya pasó su fecha de fin. */
export function estadoSponsor(sponsor: Sponsor, hoyIso: string): EstadoSponsor {
  if (hoyIso > sponsor.fechaFin) return 'Vencido';
  if (diasEntre(hoyIso, sponsor.fechaFin) <= DIAS_AVISO_VENCIMIENTO_SPONSOR) return 'Por vencer';
  return 'Activo';
}

export const estadoSponsorMeta: Record<EstadoSponsor, { bg: string; color: string }> = {
  Activo: { bg: '#e5f6ea', color: '#1a7d43' },
  'Por vencer': { bg: '#fdf0dc', color: '#a15c00' },
  Vencido: { bg: '#fbe6e9', color: '#c1293c' },
};

/** Ingreso mensual comprometido por sponsors vigentes (Activo o Por vencer, no Vencido). */
export function ingresoMensualSponsors(sponsors: Sponsor[], hoyIso: string): number {
  return sponsors.filter((s) => estadoSponsor(s, hoyIso) !== 'Vencido').reduce((a, s) => a + s.monto, 0);
}

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
