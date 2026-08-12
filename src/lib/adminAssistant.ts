import type { Socio, Categoria, Pago, Egreso, Reserva, Cancha, VentaShop, VentaBuffet, InscripcionTorneo, ProductoBuffet, ProductoShop, Comunicado, Sponsor } from '../types';
import { cuotasResumen, ingresosPorFuente, balanceMes, totalEgresos, topEgreso, TURNO_HORAS, estadoSponsor, ingresoMensualSponsors } from './derive';
import { formatMoney } from './format';

export type AdminAssistantContext = {
  clubNombre: string;
  socios: Socio[];
  categorias: Categoria[];
  pagosHoy: Pago[];
  egresos: Egreso[];
  reservas: Reserva[];
  canchas: Cancha[];
  ventasShop: VentaShop[];
  ventasBuffet: VentaBuffet[];
  inscripcionesTorneo: InscripcionTorneo[];
  productosBuffet: ProductoBuffet[];
  productosShop: ProductoShop[];
  comunicados: Comunicado[];
  sponsors: Sponsor[];
  hoyIso: string;
};

export type AdminAssistantReply = {
  intent: AdminAssistantIntent;
  text: string;
};

export type AdminAssistantIntent =
  | 'socios-resumen'
  | 'cobranza-hoy'
  | 'balance-mes'
  | 'mayor-gasto'
  | 'stock-bajo'
  | 'turnos-libres'
  | 'ultimo-comunicado'
  | 'sponsors-resumen'
  | 'fallback';

function normalizeQuery(value: string) {
  return value
    .toLocaleLowerCase('es-AR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAny(value: string, expressions: string[]) {
  return expressions.some((expression) => value.includes(expression));
}

function bulletList(introduction: string, items: string[]) {
  return `${introduction}\n${items.map((item) => `• ${item}`).join('\n')}`;
}

function resolveIntent(query: string): AdminAssistantIntent {
  const normalized = normalizeQuery(query);

  if (hasAny(normalized, ['sponsor', 'sponsors', 'patrocinador', 'patrocinadores', 'auspiciante', 'auspiciantes'])) return 'sponsors-resumen';
  if (hasAny(normalized, ['comunicado', 'aviso', 'novedad', 'ultimo mensaje'])) return 'ultimo-comunicado';
  if (hasAny(normalized, ['turno libre', 'turnos libres', 'cancha libre', 'canchas libres', 'hay cancha', 'reserva libre', 'disponibilidad de cancha'])) return 'turnos-libres';
  if (hasAny(normalized, ['stock bajo', 'falta stock', 'que falta', 'reponer', 'sin stock', 'poco stock'])) return 'stock-bajo';
  if (hasAny(normalized, ['mayor gasto', 'gasto mas grande', 'en que gastamos mas', 'principal egreso', 'egreso mas alto'])) return 'mayor-gasto';
  if (hasAny(normalized, ['cuanto se cobro', 'cobranza de hoy', 'pagos de hoy', 'caja de hoy', 'cobramos hoy'])) return 'cobranza-hoy';
  if (hasAny(normalized, ['balance', 'como venimos', 'como estamos de plata', 'ingresos del mes', 'egresos del mes', 'resumen financiero', 'plata del club', 'finanzas'])) return 'balance-mes';
  if (hasAny(normalized, ['socio', 'socios', 'padron', 'moroso', 'morosos', 'al dia', 'por vencer'])) return 'socios-resumen';

  return 'fallback';
}

function sociosResumen(context: AdminAssistantContext) {
  const resumen = cuotasResumen(context.socios, context.categorias);
  return `Hay ${resumen.totalSocios} socios registrados: ${resumen.countAlDia} al día, ${resumen.countPorVencer} por vencer y ${resumen.countMoroso} morosos. La deuda total acumulada es ${formatMoney(resumen.deudaTotal)}.`;
}

function cobranzaHoy(context: AdminAssistantContext) {
  if (!context.pagosHoy.length) return 'Todavía no se registraron pagos hoy.';
  const total = context.pagosHoy.reduce((a, p) => a + p.monto, 0);
  const cantidad = context.pagosHoy.length;
  return `Hoy se registraron ${cantidad} pago${cantidad === 1 ? '' : 's'} por un total de ${formatMoney(total)}.`;
}

function balanceMesResumen(context: AdminAssistantContext) {
  const resumen = cuotasResumen(context.socios, context.categorias);
  const fuentes = ingresosPorFuente(resumen.recaudadoMes, resumen.countAlDia, context.reservas, context.ventasShop, context.ventasBuffet, context.inscripcionesTorneo, context.sponsors, context.hoyIso);
  const egresosTotal = totalEgresos(context.egresos);
  const balance = balanceMes(resumen.recaudadoMes, context.reservas, context.ventasShop, context.ventasBuffet, context.inscripcionesTorneo, context.egresos, context.sponsors, context.hoyIso);
  return `Este mes: ingresos ${formatMoney(fuentes.totalIngresos)}, egresos ${formatMoney(egresosTotal)}, balance ${balance >= 0 ? 'positivo' : 'negativo'} de ${formatMoney(Math.abs(balance))}.`;
}

function mayorGasto(context: AdminAssistantContext) {
  const top = topEgreso(context.egresos);
  if (!top) return 'Todavía no hay egresos registrados este mes.';
  return `El mayor gasto del mes es "${top.categoria}", con ${top.montoLabel} (${top.pct}% del total de egresos).`;
}

function stockBajo(context: AdminAssistantContext) {
  const buffetBajo = context.productosBuffet.filter((p) => p.stock <= p.stockMin);
  const shopBajo = context.productosShop.filter((p) => p.stock <= p.stockMin);
  if (!buffetBajo.length && !shopBajo.length) return 'No hay productos con stock bajo por ahora.';

  const items = [
    ...buffetBajo.map((p) => `${p.nombre} — buffet, ${p.stock} unidades`),
    ...shopBajo.map((p) => `${p.nombre} — tienda, ${p.stock} unidades`),
  ];
  return bulletList('Productos con stock bajo:', items);
}

function turnosLibres(context: AdminAssistantContext) {
  if (!context.canchas.length) return 'No hay canchas cargadas todavía.';
  const ocupados = context.reservas.filter((r) => r.dia === context.hoyIso).length;
  const totalTurnos = context.canchas.length * TURNO_HORAS.length;
  const libres = Math.max(0, totalTurnos - ocupados);
  return `Hoy hay ${libres} de ${totalTurnos} turnos libres entre las ${context.canchas.length} canchas del club.`;
}

function ultimoComunicado(context: AdminAssistantContext) {
  const ultimo = context.comunicados[0];
  if (!ultimo) return 'No hay comunicados enviados todavía.';
  return `El último comunicado fue "${ultimo.titulo}" (${ultimo.fecha}), enviado a ${ultimo.destinatario}.`;
}

function sponsorsResumen(context: AdminAssistantContext) {
  if (!context.sponsors.length) return 'Todavía no hay sponsors cargados.';
  const vigentes = context.sponsors.filter((s) => estadoSponsor(s, context.hoyIso) !== 'Vencido');
  const porVencer = context.sponsors.filter((s) => estadoSponsor(s, context.hoyIso) === 'Por vencer');
  const ingresoMensual = ingresoMensualSponsors(context.sponsors, context.hoyIso);
  let texto = `Hay ${vigentes.length} sponsor${vigentes.length === 1 ? '' : 's'} vigente${vigentes.length === 1 ? '' : 's'}, que suman ${formatMoney(ingresoMensual)} por mes.`;
  if (porVencer.length) {
    texto += ` ${porVencer.length} está${porVencer.length === 1 ? '' : 'n'} por vencer: ${porVencer.map((s) => s.nombre).join(', ')}.`;
  }
  return texto;
}

function fallback(context: AdminAssistantContext) {
  return `Puedo consultar los datos registrados de ${context.clubNombre}: resumen de socios, cobranza de hoy, balance del mes, mayor gasto, stock bajo, turnos libres de cancha, sponsors y el último comunicado. Probá una de las sugerencias.`;
}

export function answerAdminAssistant(query: string, context: AdminAssistantContext): AdminAssistantReply {
  const intent = resolveIntent(query);
  const replies: Record<AdminAssistantIntent, (value: AdminAssistantContext) => string> = {
    'socios-resumen': sociosResumen,
    'cobranza-hoy': cobranzaHoy,
    'balance-mes': balanceMesResumen,
    'mayor-gasto': mayorGasto,
    'stock-bajo': stockBajo,
    'turnos-libres': turnosLibres,
    'ultimo-comunicado': ultimoComunicado,
    'sponsors-resumen': sponsorsResumen,
    fallback,
  };
  return { intent, text: replies[intent](context) };
}
