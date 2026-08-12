import type { Socio, Reserva, Torneo, InscripcionTorneo, Comunicado, EquipoDeportivo } from '../types';
import type { Evento, SportsCalendarData } from './sportsCalendar';
import { proximoVencimientoCuota, estadoTorneo } from './derive';
import { formatMoney, formatFechaCorta } from './format';

export type HinchaAssistantContext = {
  clubNombre: string;
  socio: Socio;
  esSocio: boolean;
  reservas: Reserva[];
  torneos: Torneo[];
  inscripcionesTorneo: InscripcionTorneo[];
  comunicados: Comunicado[];
  comunicadosLeidos: number[];
  equiposDeportivos: EquipoDeportivo[];
  calendar: SportsCalendarData;
  hoyIso: string;
};

export type HinchaAssistantReply = {
  intent: HinchaAssistantIntent;
  text: string;
};

export type HinchaAssistantIntent =
  | 'cuota'
  | 'mis-reservas'
  | 'novedades'
  | 'torneos'
  | 'proximo-partido'
  | 'hacete-socio'
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

function resolveIntent(query: string): HinchaAssistantIntent {
  const normalized = normalizeQuery(query);

  if (hasAny(normalized, ['hacete socio', 'ser socio', 'asociarme', 'como me hago socio', 'quiero ser socio', 'hacerme socio'])) return 'hacete-socio';
  if (hasAny(normalized, ['proximo partido', 'siguiente partido', 'cuando jugamos', 'cuando juega', 'cuando es el partido'])) return 'proximo-partido';
  if (hasAny(normalized, ['torneo', 'torneos', 'inscripcion', 'inscripto', 'anotarme'])) return 'torneos';
  if (hasAny(normalized, ['novedad', 'novedades', 'aviso', 'avisos', 'comunicado', 'comunicados'])) return 'novedades';
  if (hasAny(normalized, ['reserva', 'reservas', 'cancha', 'turno', 'turnos'])) return 'mis-reservas';
  if (hasAny(normalized, ['cuota', 'deuda', 'debo', 'vencimiento', 'vence', 'al dia'])) return 'cuota';

  return 'fallback';
}

function cuotaEstado(context: HinchaAssistantContext) {
  if (!context.esSocio) return 'Todavía no sos socio, así que no tenés una cuota asociada. Preguntame "cómo me hago socio" y te cuento cómo asociarte.';

  const socio = context.socio;
  const vencimiento = formatFechaCorta(proximoVencimientoCuota(context.hoyIso));
  if (socio.estado === 'moroso') return `Tenés una cuota morosa por ${formatMoney(socio.deuda)}. Podés regularizarla desde "Mi cuota" en el portal.`;
  if (socio.estado === 'por_vencer') return `Tu cuota está por vencer. El próximo vencimiento es el ${vencimiento}.`;
  return `Tu cuota está al día. El próximo vencimiento es el ${vencimiento}.`;
}

function misReservas(context: HinchaAssistantContext) {
  const nombreCompleto = `${context.socio.nombre} ${context.socio.apellido}`;
  const propias = context.reservas
    .filter((r) => r.nombre === nombreCompleto)
    .sort((a, b) => `${a.dia}${a.hora}`.localeCompare(`${b.dia}${b.hora}`));
  if (!propias.length) return 'No tenés reservas de cancha registradas.';

  const items = propias.map((r) => `${formatFechaCorta(r.dia)} a las ${r.hora}`);
  return bulletList(propias.length === 1 ? 'Tenés una reserva:' : 'Tenés estas reservas:', items);
}

function novedades(context: HinchaAssistantContext) {
  const ultimo = context.comunicados[0];
  if (!ultimo) return 'No hay novedades publicadas todavía.';

  const noLeidas = context.comunicados.filter((c) => !context.comunicadosLeidos.includes(c.id)).length;
  const prefijo = noLeidas > 0 ? `Tenés ${noLeidas} novedad${noLeidas === 1 ? '' : 'es'} sin leer. ` : '';
  return `${prefijo}La última es "${ultimo.titulo}" (${ultimo.fecha}).`;
}

function torneosInfo(context: HinchaAssistantContext) {
  const abiertos = context.torneos.filter((t) => estadoTorneo(t, context.hoyIso) !== 'Finalizado');
  if (!abiertos.length) return 'No hay torneos abiertos por ahora.';

  const items = abiertos.map((t) => {
    const inscripcion = context.inscripcionesTorneo.find((i) => i.torneoId === t.id);
    const estado = estadoTorneo(t, context.hoyIso);
    return `${t.nombre} (${estado})${inscripcion ? ` — ya estás anotado como ${inscripcion.nombreEquipo}` : ''}`;
  });
  return bulletList('Torneos disponibles:', items);
}

function partidosDelEquipo(calendar: SportsCalendarData, equipoId: number): Evento[] {
  return calendar.eventos.filter((e) => e.tipo === 'Partido' && e.equipoId === equipoId && e.estado !== 'finalizado');
}

function proximoPartido(context: HinchaAssistantContext) {
  const proximoPorEquipo = context.equiposDeportivos
    .map((equipo) => ({ equipo, partido: partidosDelEquipo(context.calendar, equipo.id).sort((a, b) => `${a.fecha}${a.horaInicio || ''}`.localeCompare(`${b.fecha}${b.horaInicio || ''}`))[0] }))
    .filter((item): item is { equipo: EquipoDeportivo; partido: Evento } => Boolean(item.partido))
    .sort((a, b) => `${a.partido.fecha}${a.partido.horaInicio || ''}`.localeCompare(`${b.partido.fecha}${b.partido.horaInicio || ''}`));

  const proximo = proximoPorEquipo[0];
  if (!proximo) return 'No hay partidos programados por ahora.';
  return `El próximo partido es de ${proximo.equipo.nombre} vs. ${proximo.partido.rival || 'un rival aún sin confirmar'}, el ${formatFechaCorta(proximo.partido.fecha)}${proximo.partido.horaInicio ? ` a las ${proximo.partido.horaInicio}` : ''}.`;
}

function haceteSocio(context: HinchaAssistantContext) {
  if (context.esSocio) return 'Ya sos socio del club — no hace falta que te vuelvas a asociar.';
  return 'Podés hacerte socio desde "Hacete socio" en el menú del portal: completás tus datos y elegís el medio de pago de la cuota.';
}

function fallback(context: HinchaAssistantContext) {
  const extra = context.esSocio ? '' : ' y cómo hacerte socio';
  return `Puedo contarte sobre tu cuota, tus reservas, las novedades del club, los torneos abiertos, el próximo partido${extra}. Probá una de las sugerencias.`;
}

export function answerHinchaAssistant(query: string, context: HinchaAssistantContext): HinchaAssistantReply {
  const intent = resolveIntent(query);
  const replies: Record<HinchaAssistantIntent, (value: HinchaAssistantContext) => string> = {
    cuota: cuotaEstado,
    'mis-reservas': misReservas,
    novedades,
    torneos: torneosInfo,
    'proximo-partido': proximoPartido,
    'hacete-socio': haceteSocio,
    fallback,
  };
  return { intent, text: replies[intent](context) };
}
