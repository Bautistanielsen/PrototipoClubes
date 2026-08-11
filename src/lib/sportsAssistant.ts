import type { EquipoDeportivo, Formacion, Jugador } from '../types';
import { derivePlayerHighlights, deriveSportsStatistics, selectFinalizedMatches } from './sportsStatistics';
import { expandSportsEventos } from './sportsCalendar';
import type { Evento, SportsCalendarData } from './sportsCalendar';

export type SportsAssistantContext = {
  team: EquipoDeportivo;
  players: Jugador[];
  formations: Formacion[];
  selectedFormationId: number | null;
  calendar: SportsCalendarData;
  currentDateTime: Date;
};

export type SportsAssistantReply = {
  intent: SportsAssistantIntent;
  text: string;
};

export type SportsAssistantIntent =
  | 'next-match'
  | 'weekly-events'
  | 'team-summary'
  | 'recent-results'
  | 'top-scorer'
  | 'injuries'
  | 'formations'
  | 'fallback';

const DATE_FORMATTER = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const RECENT_RESULTS_LIMIT = 5;

function normalizeQuery(value: string) {
  return value
    .toLocaleLowerCase('es-AR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

export function localIsoDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addDays(value: string, days: number) {
  const date = toDate(value);
  date.setDate(date.getDate() + days);
  return localIsoDate(date);
}

function dateTimeFromLocalValues(dateValue: string, timeValue: string) {
  const [year, month, day] = dateValue.split('-').map(Number);
  const [hours, minutes] = timeValue.split(':').map(Number);
  if (![year, month, day, hours, minutes].every(Number.isInteger)) return null;
  const dateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return dateTime.getFullYear() === year
    && dateTime.getMonth() === month - 1
    && dateTime.getDate() === day
    && dateTime.getHours() === hours
    && dateTime.getMinutes() === minutes
    ? dateTime
    : null;
}

function formatDate(value: string) {
  return DATE_FORMATTER.format(toDate(value));
}

function formatTime(value?: string) {
  return value ? ` a las ${value}` : '';
}

function hasAny(value: string, expressions: string[]) {
  return expressions.some((expression) => value.includes(expression));
}

function resolveIntent(query: string): SportsAssistantIntent {
  const normalized = normalizeQuery(query);

  if (hasAny(normalized, ['lesion', 'lesionado', 'lesionados', 'baja', 'bajas'])) return 'injuries';
  if (hasAny(normalized, ['formacion', 'formaciones', 'alineacion', 'once', 'sistema'])) return 'formations';
  if (hasAny(normalized, ['goleador', 'quien hizo mas goles', 'quien metio mas goles', 'maximo anotador'])) return 'top-scorer';
  if (hasAny(normalized, ['ultimos resultados', 'resultado reciente', 'resultados recientes', 'ultimos partidos', 'como nos fue', 'racha', 'resultados del equipo'])) return 'recent-results';
  if (hasAny(normalized, ['esta semana', 'semana actual', 'agenda semanal', 'eventos de la semana', 'actividades de la semana', 'que hay esta semana', 'que tenemos esta semana'])) return 'weekly-events';
  if (hasAny(normalized, ['diferencia de gol', 'diferencia de goles', 'goles a favor', 'goles en contra', 'resumen', 'estadisticas del equipo', 'estadisticas', 'como venimos', 'balance del equipo'])) return 'team-summary';
  if (hasAny(normalized, ['proximo partido', 'siguiente partido', 'proxima fecha', 'siguiente fecha', 'cuando jugamos', 'cuando juega', 'proximo encuentro', 'siguiente encuentro'])) return 'next-match';

  return 'fallback';
}

function eventDescription(event: Evento) {
  if (event.tipo === 'Partido') {
    return `${event.condicion || 'Local'} vs. ${event.rival || 'rival sin definir'}${formatTime(event.horaInicio)}`;
  }
  return `${event.titulo || event.tipo}${formatTime(event.horaInicio)}`;
}

function playerName(player: Jugador) {
  return `${player.nombre} ${player.apellido}`.trim();
}

function bulletList(introduction: string, items: string[]) {
  return `${introduction}\n${items.map((item) => `• ${item}`).join('\n')}`;
}

function isUpcomingMatch(event: Evento, currentDateTime: Date) {
  const currentDate = localIsoDate(currentDateTime);
  if (event.fecha > currentDate) return true;
  if (event.fecha < currentDate) return false;
  if (!event.horaInicio) return true;
  const scheduledAt = dateTimeFromLocalValues(event.fecha, event.horaInicio);
  return scheduledAt ? scheduledAt.getTime() >= currentDateTime.getTime() : true;
}

function nextMatch(context: SportsAssistantContext) {
  const match = context.calendar.eventos
    .filter((event) => event.equipoId === context.team.id
      && event.tipo === 'Partido'
      && isUpcomingMatch(event, context.currentDateTime)
      && !['finalizado', 'suspendido', 'postergado'].includes(event.estado || ''))
    .sort((a, b) => `${a.fecha}${a.horaInicio || ''}`.localeCompare(`${b.fecha}${b.horaInicio || ''}`))[0];

  if (!match) return 'No hay un próximo partido programado desde hoy.';

  const details = [
    `${formatDate(match.fecha)}${formatTime(match.horaInicio)}`,
    match.condicion || 'condición no registrada',
    match.lugar || 'lugar a definir',
  ];
  return `El próximo partido es ${match.condicion || 'Local'} frente a ${match.rival || 'un rival aún no definido'}, el ${details.join(' · ')}.`;
}

function weeklyEvents(context: SportsAssistantContext) {
  const currentDate = localIsoDate(context.currentDateTime);
  const reference = toDate(currentDate);
  const mondayOffset = (reference.getDay() + 6) % 7;
  const weekStart = addDays(currentDate, -mondayOffset);
  const weekEnd = addDays(weekStart, 6);
  const events = expandSportsEventos(context.calendar.eventos.filter((event) => event.equipoId === context.team.id), weekStart, weekEnd);

  if (!events.length) return `No hay actividades registradas entre el ${formatDate(weekStart)} y el ${formatDate(weekEnd)}.`;

  const introduction = events.length === 1 ? 'Esta semana hay una actividad:' : 'Esta semana hay estas actividades:';
  return bulletList(introduction, events.map((event) => `${formatDate(event.fecha)}: ${eventDescription(event)}`));
}

function teamSummary(context: SportsAssistantContext) {
  const stats = deriveSportsStatistics(context.calendar, { equipoId: context.team.id }, context.players).team;
  if (!stats.matchesPlayed) return 'No hay resultados finalizados con marcador válido para elaborar un resumen.';

  const difference = stats.goalDifference > 0 ? `+${stats.goalDifference}` : String(stats.goalDifference);
  return `Se registran ${stats.matchesPlayed} partidos finalizados: ${stats.wins} victorias, ${stats.draws} empates y ${stats.losses} derrotas. Marcó ${stats.goalsFor} goles, recibió ${stats.goalsAgainst} y su diferencia de gol es ${difference}.`;
}

function recentResults(context: SportsAssistantContext) {
  const matches = selectFinalizedMatches(context.calendar, { equipoId: context.team.id })
    .sort((a, b) => `${b.evento.fecha}${b.evento.horaInicio || ''}`.localeCompare(`${a.evento.fecha}${a.evento.horaInicio || ''}`))
    .slice(0, RECENT_RESULTS_LIMIT);

  if (!matches.length) return 'No hay resultados finalizados con marcador válido.';

  const results = matches.map(({ evento, result }) => {
    const score = `${evento.condicion || 'Local'} vs. ${evento.rival || 'Rival'}: ${result.club}-${result.rival}`;
    return `${formatDate(evento.fecha)}: ${score}`;
  });
  return bulletList(matches.length === 1 ? 'Último resultado:' : 'Últimos resultados:', results);
}

function topScorer(context: SportsAssistantContext) {
  const stats = deriveSportsStatistics(context.calendar, { equipoId: context.team.id }, context.players);
  const scorers = derivePlayerHighlights(stats.players).topScorers;
  if (!scorers.length) return 'No hay goles observados en las actas finalizadas; por eso no puedo identificar un goleador.';

  const names = scorers.map((item) => item.player.displayName || 'Jugador sin nombre registrado');
  const goals = scorers[0].goals;
  if (names.length === 1) return `El máximo goleador es ${names[0]}, con ${goals} ${goals === 1 ? 'gol' : 'goles'} registrados.`;
  return bulletList('Máximos goleadores:', names.map((name) => `${name} · ${goals} ${goals === 1 ? 'gol' : 'goles'}`));
}

function injuries(context: SportsAssistantContext) {
  const injured = context.players.filter((player) => player.equipoId === context.team.id && player.estado === 'lesionado');
  if (!injured.length) return 'No hay jugadores lesionados registrados.';

  const injuryEntries = injured.map((player) => {
    const injuryDetails = [player.motivoLesion?.trim(), player.fechaEstimadaRecuperacion ? `recuperación estimada: ${formatDate(player.fechaEstimadaRecuperacion)}` : 'sin fecha estimada de recuperación'].filter(Boolean);
    return `${playerName(player)} (${injuryDetails.join(' · ')})`;
  });
  return injuryEntries.length === 1 ? `Jugador lesionado: ${injuryEntries[0]}.` : bulletList('Jugadores lesionados:', injuryEntries);
}

function formations(context: SportsAssistantContext) {
  const formations = context.formations.filter((formation) => formation.equipoId === context.team.id);
  if (!formations.length) return 'No hay formaciones guardadas.';

  const selected = formations.find((formation) => formation.id === context.selectedFormationId);
  const saved = formations.map((formation) => `${formation.nombre} (${formation.sistema})`);
  if (saved.length === 1) return selected ? `La formación seleccionada es ${saved[0]}.` : `Hay una formación guardada: ${saved[0]}.`;
  return `${selected ? `La formación seleccionada es ${selected.nombre} (${selected.sistema}).\n` : ''}${bulletList('Formaciones guardadas:', saved)}`;
}

function fallback() {
  return 'Puedo consultar los datos registrados: próximo partido, agenda de esta semana, resumen y diferencia de gol, últimos resultados, máximo goleador, lesionados y formaciones. Probá una de las sugerencias.';
}

export function answerSportsAssistant(query: string, context: SportsAssistantContext): SportsAssistantReply {
  const intent = resolveIntent(query);
  const replies: Record<SportsAssistantIntent, (value: SportsAssistantContext) => string> = {
    'next-match': nextMatch,
    'weekly-events': weeklyEvents,
    'team-summary': teamSummary,
    'recent-results': recentResults,
    'top-scorer': topScorer,
    injuries,
    formations,
    fallback,
  };
  return { intent, text: replies[intent](context) };
}
