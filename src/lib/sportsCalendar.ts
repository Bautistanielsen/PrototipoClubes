import type { Formacion } from '../types';
import { canonicalPrimeraFormations, cloneFormacion } from '../data/formaciones';

export type TipoEvento = 'Partido' | 'Entrenamiento' | 'Descanso' | 'Otro';
export type Competencia = 'Liga' | 'Copa' | 'Amistoso';
export const INSTANCIAS_COPA = ['Fase de grupos', 'Dieciseisavos', 'Octavos de final', 'Cuartos de final', 'Semifinal', 'Final'] as const;
export type InstanciaCopa = typeof INSTANCIAS_COPA[number];
export type EstadoPartido = 'programado' | 'finalizado' | 'suspendido' | 'postergado';
export type Recurrencia = { dias: number[]; hasta?: string };

export type PlayerRef = { playerId: string; equipoId: number; displayName: string; foto?: string; posicion?: string; dorsal?: string };
export type HistoricalPlayerSnapshot = PlayerRef;
export type ObservedFacts = { goals?: boolean; assists?: boolean; yellowCards?: boolean; redCards?: boolean };

export type FinalizedResult = {
  club: number;
  rival: number;
  difference: number;
  outcome: 'win' | 'draw' | 'loss';
};

export type Evento = {
  id: number;
  equipoId: number;
  tipo: TipoEvento;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  titulo?: string;
  descripcion?: string;
  rival?: string;
  condicion?: 'Local' | 'Visitante';
  competencia?: Competencia;
  numeroFecha?: number;
  instancia?: InstanciaCopa;
  lugar?: string;
  estado?: EstadoPartido;
  motivo?: string;
  nuevaFecha?: string;
  recurrencia?: Recurrencia;
  serieId?: number;
  exclusiones?: string[];
  overrides?: Record<string, Partial<Evento>>;
  ocurrenciaDe?: { id: number; fecha: string };
  esNuevo?: boolean;
};

export type Acta = {
  resultadoClub?: string;
  resultadoRival?: string;
  formacionId?: number;
  formacionSnapshot?: Formacion;
  goles: Array<{ jugadorId: string; minuto: string; asistenciaId: string }>;
  amarillas: Array<{ jugadorId: string; minuto: string }>;
  rojas: Array<{ jugadorId: string; minuto: string }>;
  cambios: Array<{ saleId: string; entraId: string; minuto: string }>;
  puntajes: Record<string, string>;
  observaciones: string;
  observedFacts?: ObservedFacts;
  jugadoresSnapshot?: Record<string, HistoricalPlayerSnapshot>;
};

export type Prefs = { visibles: number[]; colores: Record<number, string>; configurado?: boolean };
export type SportsCalendarData = { eventos: Evento[]; actas: Record<string, Acta>; prefs: Prefs; demoSeasonSeedVersion?: number; deletedEquipoIds?: number[] };

export const SPORTS_CALENDAR_STORAGE = 'club-calendario-deportivo-v1';
export const CANONICAL_DEMO_SEASON_SEED_VERSION = 2;

function dateFromIso(value: string) {
  return new Date(`${value}T12:00:00`);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function expandSportsEventos(eventos: Evento[], desde: string, hasta: string) {
  const result: Evento[] = [];
  eventos.forEach((evento) => {
    if (!evento.recurrencia) {
      if (evento.fecha >= desde && evento.fecha <= hasta) result.push(evento);
      return;
    }
    const inicio = dateFromIso(evento.fecha);
    const limite = evento.recurrencia.hasta ? dateFromIso(evento.recurrencia.hasta) : dateFromIso(hasta);
    for (let fecha = inicio; fecha <= limite && isoDate(fecha) <= hasta; fecha = addDays(fecha, 1)) {
      const fechaIso = isoDate(fecha);
      if (fechaIso >= desde && evento.recurrencia.dias.includes(fecha.getDay()) && !evento.exclusiones?.includes(fechaIso)) {
        result.push({ ...evento, ...(evento.overrides?.[fechaIso] || {}), fecha: fechaIso, ocurrenciaDe: { id: evento.id, fecha: fechaIso } });
      }
    }
  });
  return result.sort((a, b) => `${a.fecha}${a.horaInicio || ''}`.localeCompare(`${b.fecha}${b.horaInicio || ''}`));
}

export function emptyActa(): Acta {
  return { goles: [], amarillas: [], rojas: [], cambios: [], puntajes: {}, observaciones: '' };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

function integerValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) ? value : undefined;
}

function normalizePlayerRef(value: unknown): PlayerRef | undefined {
  if (!isRecord(value)) return undefined;
  const playerId = stringValue(value.playerId).trim();
  const equipoId = integerValue(value.equipoId);
  if (!playerId || equipoId === undefined) return undefined;
  return {
    playerId,
    equipoId,
    displayName: stringValue(value.displayName),
    foto: stringValue(value.foto) || undefined,
    posicion: stringValue(value.posicion) || stringValue(value.position) || undefined,
    dorsal: stringValue(value.dorsal) || undefined,
  };
}

function normalizePlayerSnapshots(value: unknown, expectedEquipoId?: number): Record<string, HistoricalPlayerSnapshot> | undefined {
  if (!isRecord(value)) return undefined;
  const snapshots = Object.fromEntries(Object.entries(value).flatMap(([id, snapshot]) => {
    const normalized = normalizePlayerRef(snapshot);
    const coherent = normalized && normalized.playerId === id
      && (expectedEquipoId === undefined || normalized.equipoId === expectedEquipoId);
    return coherent ? [[id, normalized]] : [];
  }));
  return Object.keys(snapshots).length ? snapshots : undefined;
}

function normalizeGoal(value: unknown) {
  if (!isRecord(value)) return null;
  return { jugadorId: stringValue(value.jugadorId), minuto: stringValue(value.minuto), asistenciaId: stringValue(value.asistenciaId) };
}

function normalizeCard(value: unknown) {
  if (!isRecord(value)) return null;
  return { jugadorId: stringValue(value.jugadorId), minuto: stringValue(value.minuto) };
}

function normalizeChange(value: unknown) {
  if (!isRecord(value)) return null;
  return { saleId: stringValue(value.saleId), entraId: stringValue(value.entraId), minuto: stringValue(value.minuto) };
}

function normalizeObservedFacts(acta: Record<string, unknown>): ObservedFacts | undefined {
  const supplied = isRecord(acta.observedFacts) ? acta.observedFacts : {};
  const facts: ObservedFacts = {
    goals: typeof supplied.goals === 'boolean' ? supplied.goals : Array.isArray(acta.goles),
    assists: typeof supplied.assists === 'boolean' ? supplied.assists : Array.isArray(acta.goles),
    yellowCards: typeof supplied.yellowCards === 'boolean' ? supplied.yellowCards : Array.isArray(acta.amarillas),
    redCards: typeof supplied.redCards === 'boolean' ? supplied.redCards : Array.isArray(acta.rojas),
  };
  return facts;
}

function normalizeFormationSnapshot(value: unknown, expectedEquipoId?: number): Formacion | undefined {
  if (!isRecord(value) || !Array.isArray(value.jugadores)) return undefined;
  const equipoId = integerValue(value.equipoId);
  if (equipoId === undefined || (expectedEquipoId !== undefined && equipoId !== expectedEquipoId)) return undefined;
  return cloneFormacion(value as unknown as Formacion);
}

export function normalizeActa(value: unknown, lineageEquipoId?: number): Acta {
  const acta = isRecord(value) ? value : {};
  const formationEquipoId = isRecord(acta.formacionSnapshot) ? integerValue(acta.formacionSnapshot.equipoId) : undefined;
  const expectedEquipoId = integerValue(lineageEquipoId) ?? formationEquipoId;
  const jugadoresSnapshot = normalizePlayerSnapshots(acta.jugadoresSnapshot, expectedEquipoId);
  const puntajes = isRecord(acta.puntajes)
    ? Object.fromEntries(Object.entries(acta.puntajes).flatMap(([id, score]) => {
      const normalized = stringValue(score);
      return normalized === '' && score !== '' ? [] : [[id, normalized]];
    }))
    : {};
  return {
    ...emptyActa(),
    ...acta,
    resultadoClub: typeof acta.resultadoClub === 'string' || typeof acta.resultadoClub === 'number' ? stringValue(acta.resultadoClub) : undefined,
    resultadoRival: typeof acta.resultadoRival === 'string' || typeof acta.resultadoRival === 'number' ? stringValue(acta.resultadoRival) : undefined,
    formacionId: integerValue(acta.formacionId),
    formacionSnapshot: normalizeFormationSnapshot(acta.formacionSnapshot, integerValue(lineageEquipoId)),
    goles: Array.isArray(acta.goles) ? acta.goles.flatMap((item) => { const normalized = normalizeGoal(item); return normalized ? [normalized] : []; }) : [],
    amarillas: Array.isArray(acta.amarillas) ? acta.amarillas.flatMap((item) => { const normalized = normalizeCard(item); return normalized ? [normalized] : []; }) : [],
    rojas: Array.isArray(acta.rojas) ? acta.rojas.flatMap((item) => { const normalized = normalizeCard(item); return normalized ? [normalized] : []; }) : [],
    cambios: Array.isArray(acta.cambios) ? acta.cambios.flatMap((item) => { const normalized = normalizeChange(item); return normalized ? [normalized] : []; }) : [],
    puntajes,
    observaciones: typeof acta.observaciones === 'string' ? acta.observaciones : '',
    observedFacts: normalizeObservedFacts(acta),
    jugadoresSnapshot,
  };
}

function parseScore(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const score = Number(value);
  return Number.isInteger(score) && score >= 0 ? score : null;
}

export function parseFinalizedResult(evento: Evento, acta?: Acta): FinalizedResult | null {
  if (evento.tipo !== 'Partido' || evento.estado !== 'finalizado' || !acta) return null;
  const club = parseScore(acta.resultadoClub);
  const rival = parseScore(acta.resultadoRival);
  if (club === null || rival === null) return null;
  return { club, rival, difference: club - rival, outcome: club > rival ? 'win' : club < rival ? 'loss' : 'draw' };
}

const [formacionDemo, formacionDemo442] = canonicalPrimeraFormations;

const puntajesDemo433: Record<string, string> = {
  '1': '7', '2': '7.5', '4': '7', '5': '6.5', '6': '6.5', '7': '8', '10': '7',
  '11': '7', '12': '7.5', '13': '7.5', '14': '6.5', '15': '7', '16': '6.5',
};

const puntajesDemo442: Record<string, string> = {
  '1': '7', '2': '8', '4': '6.5', '5': '7', '6': '7', '7': '7.5', '10': '6.5',
  '11': '7.5', '12': '7', '13': '7', '14': '6.5', '15': '6.5', '16': '7.5',
};

function actaDemo(
  resultadoClub: number,
  resultadoRival: number,
  formacionSnapshot: Formacion,
  goles: Acta['goles'],
  amarillas: Acta['amarillas'],
  rojas: Acta['rojas'],
  puntajes: Record<string, string>,
  observaciones: string,
): Acta {
  return {
    resultadoClub: String(resultadoClub),
    resultadoRival: String(resultadoRival),
    formacionId: formacionSnapshot.id,
    formacionSnapshot: cloneFormacion(formacionSnapshot),
    goles,
    amarillas,
    rojas,
    cambios: [],
    puntajes: { ...puntajes },
    observaciones,
    observedFacts: { goals: true, assists: true, yellowCards: true, redCards: true },
  };
}

export const seedEventos: Evento[] = [
  { id: 201, equipoId: 1, tipo: 'Partido', fecha: '2026-03-22', horaInicio: '16:00', rival: 'Atlético Peñarol', condicion: 'Local', competencia: 'Liga', numeroFecha: 1, lugar: 'Cancha principal', estado: 'finalizado' },
  { id: 202, equipoId: 1, tipo: 'Partido', fecha: '2026-04-05', horaInicio: '15:30', rival: 'Unión Progresista', condicion: 'Visitante', competencia: 'Liga', numeroFecha: 2, lugar: 'Estadio Progresista', estado: 'finalizado' },
  { id: 203, equipoId: 1, tipo: 'Partido', fecha: '2026-04-19', horaInicio: '16:00', rival: 'Villa del Parque', condicion: 'Local', competencia: 'Liga', numeroFecha: 3, lugar: 'Cancha principal', estado: 'finalizado' },
  { id: 204, equipoId: 1, tipo: 'Partido', fecha: '2026-05-03', horaInicio: '15:00', rival: 'Deportivo Belgrano', condicion: 'Visitante', competencia: 'Liga', numeroFecha: 4, lugar: 'Estadio Belgrano', estado: 'finalizado' },
  { id: 205, equipoId: 1, tipo: 'Partido', fecha: '2026-05-17', horaInicio: '16:00', rival: 'Social San Martín', condicion: 'Local', competencia: 'Liga', numeroFecha: 5, lugar: 'Cancha principal', estado: 'finalizado' },
  { id: 206, equipoId: 1, tipo: 'Partido', fecha: '2026-05-31', horaInicio: '15:30', rival: 'Juventud Unida', condicion: 'Visitante', competencia: 'Liga', numeroFecha: 6, lugar: 'Estadio Juventud', estado: 'finalizado' },
  { id: 207, equipoId: 1, tipo: 'Partido', fecha: '2026-06-07', horaInicio: '16:00', rival: 'Atlético Peñarol', condicion: 'Local', competencia: 'Liga', numeroFecha: 7, lugar: 'Cancha principal', estado: 'finalizado' },
  { id: 208, equipoId: 1, tipo: 'Partido', fecha: '2026-06-21', horaInicio: '15:30', rival: 'Unión Progresista', condicion: 'Visitante', competencia: 'Liga', numeroFecha: 8, lugar: 'Estadio Progresista', estado: 'finalizado' },
  { id: 209, equipoId: 1, tipo: 'Partido', fecha: '2026-06-28', horaInicio: '16:00', rival: 'Villa del Parque', condicion: 'Local', competencia: 'Liga', numeroFecha: 9, lugar: 'Cancha principal', estado: 'finalizado' },
  { id: 210, equipoId: 1, tipo: 'Partido', fecha: '2026-07-05', horaInicio: '16:00', rival: 'Deportivo Belgrano', condicion: 'Visitante', competencia: 'Liga', numeroFecha: 10, lugar: 'Estadio Belgrano', estado: 'finalizado' },
  { id: 211, equipoId: 1, tipo: 'Partido', fecha: '2026-07-12', horaInicio: '15:30', rival: 'Social San Martín', condicion: 'Local', competencia: 'Liga', numeroFecha: 11, lugar: 'Cancha principal', estado: 'finalizado' },
  { id: 212, equipoId: 1, tipo: 'Partido', fecha: '2026-07-19', horaInicio: '15:30', rival: 'Juventud Unida', condicion: 'Visitante', competencia: 'Liga', numeroFecha: 12, lugar: 'Estadio Juventud', estado: 'finalizado' },
  { id: 213, equipoId: 1, tipo: 'Partido', fecha: '2026-07-23', horaInicio: '20:00', rival: 'Deportivo Central', condicion: 'Local', competencia: 'Copa', lugar: 'Cancha principal', estado: 'finalizado' },
  { id: 214, equipoId: 1, tipo: 'Partido', fecha: '2026-07-26', horaInicio: '16:00', rival: 'Atlético del Sur', condicion: 'Visitante', competencia: 'Copa', lugar: 'Estadio del Sur', estado: 'finalizado' },
  { id: 101, equipoId: 1, tipo: 'Entrenamiento', fecha: '2026-08-04', horaInicio: '19:00', horaFin: '21:00', lugar: 'Cancha principal', titulo: 'Trabajo táctico', recurrencia: { dias: [1, 3], hasta: '2026-08-31' }, serieId: 101 },
  { id: 104, equipoId: 2, tipo: 'Entrenamiento', fecha: '2026-08-04', horaInicio: '18:00', horaFin: '19:30', titulo: 'Técnica individual', recurrencia: { dias: [1, 3], hasta: '2026-08-31' }, serieId: 104 },
  { id: 105, equipoId: 2, tipo: 'Partido', fecha: '2026-08-08', horaInicio: '11:00', rival: 'Juventud Unida', condicion: 'Local', competencia: 'Copa' },
  { id: 106, equipoId: 2, tipo: 'Descanso', fecha: '2026-08-09', titulo: 'Descanso', recurrencia: { dias: [0], hasta: '2026-08-30' }, serieId: 106 },
  { id: 107, equipoId: 1, tipo: 'Otro', fecha: '2026-08-06', horaInicio: '20:30', titulo: 'Charla con familias', descripcion: 'Reunión informativa previa al torneo.' },
];

export const seedActas: Record<string, Acta> = {
  '201': actaDemo(2, 1, formacionDemo, [{ jugadorId: '7', minuto: '', asistenciaId: '2' }, { jugadorId: '2', minuto: '', asistenciaId: '13' }], [{ jugadorId: '6', minuto: '' }], [], puntajesDemo433, 'Buen estreno de local, con eficacia en las áreas.'),
  '202': actaDemo(1, 1, formacionDemo442, [{ jugadorId: '11', minuto: '', asistenciaId: '7' }], [{ jugadorId: '4', minuto: '' }], [], puntajesDemo442, 'Empate equilibrado y ordenado fuera de casa.'),
  '203': actaDemo(3, 0, formacionDemo, [{ jugadorId: '7', minuto: '', asistenciaId: '2' }, { jugadorId: '15', minuto: '', asistenciaId: '13' }, { jugadorId: '2', minuto: '', asistenciaId: '' }], [], [], puntajesDemo433, 'Actuación completa y arco en cero.'),
  '204': actaDemo(0, 1, formacionDemo, [], [{ jugadorId: '6', minuto: '' }], [], puntajesDemo433, 'Partido cerrado que se definió por un detalle.'),
  '205': actaDemo(2, 0, formacionDemo, [{ jugadorId: '7', minuto: '', asistenciaId: '11' }, { jugadorId: '13', minuto: '', asistenciaId: '2' }], [{ jugadorId: '5', minuto: '' }], [], puntajesDemo433, 'Presión alta y control defensivo para sostener el cero.'),
  '206': actaDemo(2, 2, formacionDemo442, [{ jugadorId: '2', minuto: '', asistenciaId: '7' }, { jugadorId: '11', minuto: '', asistenciaId: '13' }], [{ jugadorId: '12', minuto: '' }, { jugadorId: '6', minuto: '' }], [], puntajesDemo442, 'Partido abierto y de ida y vuelta.'),
  '207': actaDemo(1, 0, formacionDemo, [{ jugadorId: '7', minuto: '', asistenciaId: '2' }], [], [], puntajesDemo433, 'Victoria trabajada y nueva valla invicta.'),
  '208': actaDemo(1, 2, formacionDemo, [{ jugadorId: '2', minuto: '', asistenciaId: '7' }], [{ jugadorId: '4', minuto: '' }], [], puntajesDemo433, 'El equipo compitió hasta el final, pero no pudo remontar.'),
  '209': actaDemo(2, 1, formacionDemo, [{ jugadorId: '13', minuto: '', asistenciaId: '11' }, { jugadorId: '7', minuto: '', asistenciaId: '2' }], [{ jugadorId: '10', minuto: '' }], [], puntajesDemo433, 'Triunfo de local con buen volumen ofensivo.'),
  '210': actaDemo(2, 0, formacionDemo442, [{ jugadorId: '11', minuto: '', asistenciaId: '13' }, { jugadorId: '2', minuto: '', asistenciaId: '' }], [{ jugadorId: '6', minuto: '' }], [], puntajesDemo442, 'Partido sólido y arco en cero como visitante.'),
  '211': actaDemo(0, 0, formacionDemo, [], [], [], puntajesDemo433, 'Empate sin goles y buena disciplina defensiva.'),
  '212': actaDemo(1, 1, formacionDemo, [{ jugadorId: '7', minuto: '', asistenciaId: '2' }], [{ jugadorId: '12', minuto: '' }], [], puntajesDemo433, 'Cierre parejo de la fase de Liga.'),
  '213': actaDemo(3, 1, formacionDemo, [{ jugadorId: '7', minuto: '', asistenciaId: '2' }, { jugadorId: '15', minuto: '', asistenciaId: '13' }, { jugadorId: '2', minuto: '', asistenciaId: '11' }], [{ jugadorId: '10', minuto: '' }], [{ jugadorId: '6', minuto: '' }], puntajesDemo433, 'Victoria copera con intensidad y buena respuesta ofensiva.'),
  '214': actaDemo(0, 2, formacionDemo442, [], [{ jugadorId: '4', minuto: '' }], [], puntajesDemo442, 'La serie se cerró con una derrota fuera de casa.'),
};

const CANONICAL_DEMO_IDS = new Set(seedEventos.filter((evento) => evento.tipo === 'Partido' && evento.equipoId === 1 && evento.estado === 'finalizado').map((evento) => evento.id));
const LEGACY_PRIMERA_MATCH_IDS = new Set([91, 92, 93, 102, 103]);
const DEMO_NUMERO_FECHA: Record<number, number> = {
  201: 1, 202: 2, 203: 3, 204: 4, 205: 5, 206: 6, 207: 7,
  208: 8, 209: 9, 210: 10, 211: 11, 212: 12,
};

function withDemoNumeroFecha(eventos: Evento[]) {
  return eventos.map((evento) => evento.numeroFecha === undefined
    && evento.tipo === 'Partido'
    && evento.equipoId === 1
    && (evento.competencia || 'Liga') === 'Liga'
    && DEMO_NUMERO_FECHA[evento.id] !== undefined
    ? { ...evento, numeroFecha: DEMO_NUMERO_FECHA[evento.id] }
    : evento);
}

function cloneSeedData(): SportsCalendarData {
  const eventos = withDemoNumeroFecha(seedEventos);
  const equiposPorActa = new Map(eventos.map((evento) => [String(evento.id), evento.equipoId]));
  return {
    eventos,
    actas: Object.fromEntries(Object.entries(seedActas).map(([id, acta]) => [id, normalizeActa(acta, equiposPorActa.get(id))])),
    prefs: { visibles: [], colores: {} },
    demoSeasonSeedVersion: CANONICAL_DEMO_SEASON_SEED_VERSION,
  };
}

function normalizeStoredActas(value: unknown, eventos: Evento[], fallback: Record<string, Acta>) {
  if (!isRecord(value)) return fallback;
  const equiposPorActa = new Map(eventos.map((evento) => [String(evento.id), evento.equipoId]));
  return Object.fromEntries(Object.entries(value).map(([id, acta]) => [id, normalizeActa(acta, equiposPorActa.get(id))]));
}

function migrateDemoSeason(eventos: Evento[], actas: Record<string, Acta>, seedVersion: unknown, deletedEquipoIds: unknown) {
  const deletedIds = Array.isArray(deletedEquipoIds) ? deletedEquipoIds.filter((id): id is number => typeof id === 'number' && Number.isInteger(id)) : [];
  if (typeof seedVersion === 'number' && seedVersion >= CANONICAL_DEMO_SEASON_SEED_VERSION) {
    return { eventos, actas, demoSeasonSeedVersion: seedVersion, deletedEquipoIds: deletedIds };
  }

  const preservedEventos = eventos.filter((evento) => !LEGACY_PRIMERA_MATCH_IDS.has(evento.id));
  const storedIds = new Set(preservedEventos.map((evento) => evento.id));
  const addedEventos = seedEventos.filter((evento) => CANONICAL_DEMO_IDS.has(evento.id) && !storedIds.has(evento.id) && !deletedIds.includes(evento.equipoId));
  const migratedEventos = withDemoNumeroFecha([...preservedEventos, ...addedEventos]);
  const migratedActas = Object.fromEntries(Object.entries(actas).filter(([id]) => !LEGACY_PRIMERA_MATCH_IDS.has(Number(id))));
  const canonicalEventIds = new Set(migratedEventos.filter((evento) => CANONICAL_DEMO_IDS.has(evento.id)).map((evento) => evento.id));
  const fallbackActas = Object.fromEntries(seedEventos.flatMap((evento) => {
    const id = String(evento.id);
    const acta = seedActas[id];
    return CANONICAL_DEMO_IDS.has(evento.id) && canonicalEventIds.has(evento.id) && acta && !Object.prototype.hasOwnProperty.call(migratedActas, id)
      ? [[id, normalizeActa(acta, evento.equipoId)]]
      : [];
  }));
  return {
    eventos: migratedEventos,
    actas: { ...fallbackActas, ...migratedActas },
    demoSeasonSeedVersion: CANONICAL_DEMO_SEASON_SEED_VERSION,
    deletedEquipoIds: deletedIds,
  };
}

export function readSportsCalendarData(): SportsCalendarData {
  const fallback = cloneSeedData();
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = window.localStorage.getItem(SPORTS_CALENDAR_STORAGE);
    if (!saved) {
      writeSportsCalendarData(fallback);
      return fallback;
    }
    const parsed = JSON.parse(saved) as Partial<SportsCalendarData>;
    const storedEventos = Array.isArray(parsed.eventos) ? parsed.eventos : fallback.eventos;
    const storedActas = normalizeStoredActas(parsed.actas, storedEventos, fallback.actas);
    const migrated = migrateDemoSeason(storedEventos, storedActas, parsed.demoSeasonSeedVersion, parsed.deletedEquipoIds);
    const result = {
      eventos: migrated.eventos,
      actas: migrated.actas,
      prefs: parsed.prefs && typeof parsed.prefs === 'object' ? parsed.prefs : fallback.prefs,
      demoSeasonSeedVersion: migrated.demoSeasonSeedVersion,
      deletedEquipoIds: migrated.deletedEquipoIds,
    };
    if (!(typeof parsed.demoSeasonSeedVersion === 'number' && parsed.demoSeasonSeedVersion >= CANONICAL_DEMO_SEASON_SEED_VERSION)) {
      writeSportsCalendarData(result);
    }
    return result;
  } catch {
    return fallback;
  }
}

export function removeSportsCalendarTeam(data: SportsCalendarData, equipoId: number): SportsCalendarData {
  const eventIds = new Set(data.eventos.filter((evento) => evento.equipoId === equipoId).map((evento) => String(evento.id)));
  const visibles = Array.isArray(data.prefs.visibles) ? data.prefs.visibles : [];
  const colores = data.prefs.colores && typeof data.prefs.colores === 'object' && !Array.isArray(data.prefs.colores) ? data.prefs.colores : {};
  return {
    ...data,
    deletedEquipoIds: [...new Set([...(data.deletedEquipoIds || []), equipoId])],
    eventos: data.eventos.filter((evento) => evento.equipoId !== equipoId),
    actas: Object.fromEntries(Object.entries(data.actas).filter(([eventoId]) => !eventIds.has(eventoId))),
    prefs: {
      ...data.prefs,
      visibles: visibles.filter((id) => id !== equipoId),
      colores: Object.fromEntries(Object.entries(colores).filter(([id]) => Number(id) !== equipoId)),
    },
  };
}

export function writeSportsCalendarData(data: SportsCalendarData) {
  try {
    window.localStorage.setItem(SPORTS_CALENDAR_STORAGE, JSON.stringify({
      ...data,
      demoSeasonSeedVersion: data.demoSeasonSeedVersion ?? CANONICAL_DEMO_SEASON_SEED_VERSION,
    }));
    return true;
  } catch {
    return false;
  }
}
