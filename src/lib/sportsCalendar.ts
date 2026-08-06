import type { Formacion } from '../types';

export type TipoEvento = 'Partido' | 'Entrenamiento' | 'Descanso' | 'Otro';
export type Competencia = 'Liga' | 'Copa' | 'Amistoso';
export type EstadoPartido = 'programado' | 'finalizado' | 'suspendido' | 'postergado';
export type Recurrencia = { dias: number[]; hasta?: string };

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
};

export type Prefs = { visibles: number[]; colores: Record<number, string>; configurado?: boolean };
export type SportsCalendarData = { eventos: Evento[]; actas: Record<string, Acta>; prefs: Prefs };

export const SPORTS_CALENDAR_STORAGE = 'club-calendario-deportivo-v1';

export function emptyActa(): Acta {
  return { goles: [], amarillas: [], rojas: [], cambios: [], puntajes: {}, observaciones: '' };
}

export function normalizeActa(value: unknown): Acta {
  const acta = value && typeof value === 'object' ? value as Partial<Acta> : {};
  return {
    ...emptyActa(),
    ...acta,
    goles: Array.isArray(acta.goles) ? acta.goles : [],
    amarillas: Array.isArray(acta.amarillas) ? acta.amarillas : [],
    rojas: Array.isArray(acta.rojas) ? acta.rojas : [],
    cambios: Array.isArray(acta.cambios) ? acta.cambios : [],
    puntajes: acta.puntajes && typeof acta.puntajes === 'object' && !Array.isArray(acta.puntajes) ? acta.puntajes : {},
    observaciones: typeof acta.observaciones === 'string' ? acta.observaciones : '',
  };
}

const formacionDemo: Formacion = {
  id: 9001,
  equipoId: 1,
  nombre: 'Once titular',
  sistema: '4-3-3',
  jugadores: [
    { jugadorId: 1, zona: 'titular', x: 50, y: 88, dorsal: '1' }, { jugadorId: 4, zona: 'titular', x: 18, y: 68, dorsal: '3' },
    { jugadorId: 5, zona: 'titular', x: 39, y: 70, dorsal: '2' }, { jugadorId: 6, zona: 'titular', x: 61, y: 70, dorsal: '6' },
    { jugadorId: 10, zona: 'titular', x: 82, y: 68, dorsal: '4' }, { jugadorId: 11, zona: 'titular', x: 27, y: 47, dorsal: '8' },
    { jugadorId: 12, zona: 'titular', x: 50, y: 43, dorsal: '5' }, { jugadorId: 13, zona: 'titular', x: 73, y: 47, dorsal: '10' },
    { jugadorId: 2, zona: 'titular', x: 20, y: 24, dorsal: '11' }, { jugadorId: 7, zona: 'titular', x: 50, y: 18, dorsal: '9' },
    { jugadorId: 15, zona: 'titular', x: 80, y: 24, dorsal: '7' }, { jugadorId: 14, zona: 'suplente', x: 0, y: 0, dorsal: '16' },
    { jugadorId: 16, zona: 'suplente', x: 0, y: 0, dorsal: '17' },
  ],
  roles: { capitan: 12 },
  camiseta: { estilo: 'lisa', principal: '#087f75', secundaria: '#ffffff', texto: '#ffffff' },
};

export const seedEventos: Evento[] = [
  { id: 91, equipoId: 1, tipo: 'Partido', fecha: '2026-06-21', horaInicio: '15:30', rival: 'Atlético Peñarol', condicion: 'Visitante', competencia: 'Liga', lugar: 'Estadio Peñarol', estado: 'finalizado' },
  { id: 92, equipoId: 1, tipo: 'Partido', fecha: '2026-07-05', horaInicio: '16:00', rival: 'Unión Progresista', condicion: 'Local', competencia: 'Liga', lugar: 'Cancha principal', estado: 'finalizado' },
  { id: 93, equipoId: 1, tipo: 'Partido', fecha: '2026-07-19', horaInicio: '15:30', rival: 'Villa del Parque', condicion: 'Visitante', competencia: 'Copa', lugar: 'Estadio Municipal', estado: 'finalizado' },
  { id: 101, equipoId: 1, tipo: 'Entrenamiento', fecha: '2026-08-04', horaInicio: '19:00', horaFin: '21:00', lugar: 'Cancha principal', titulo: 'Trabajo táctico', recurrencia: { dias: [1, 3], hasta: '2026-08-31' }, serieId: 101 },
  { id: 102, equipoId: 1, tipo: 'Partido', fecha: '2026-08-02', horaInicio: '16:00', rival: 'Deportivo Belgrano', condicion: 'Local', competencia: 'Liga', numeroFecha: 14, lugar: 'Cancha principal' },
  { id: 103, equipoId: 1, tipo: 'Partido', fecha: '2026-08-09', horaInicio: '15:30', rival: 'Social San Martín', condicion: 'Visitante', competencia: 'Amistoso' },
  { id: 104, equipoId: 2, tipo: 'Entrenamiento', fecha: '2026-08-04', horaInicio: '18:00', horaFin: '19:30', titulo: 'Técnica individual', recurrencia: { dias: [1, 3], hasta: '2026-08-31' }, serieId: 104 },
  { id: 105, equipoId: 2, tipo: 'Partido', fecha: '2026-08-08', horaInicio: '11:00', rival: 'Juventud Unida', condicion: 'Local', competencia: 'Copa' },
  { id: 106, equipoId: 2, tipo: 'Descanso', fecha: '2026-08-09', titulo: 'Descanso', recurrencia: { dias: [0], hasta: '2026-08-30' }, serieId: 106 },
  { id: 107, equipoId: 1, tipo: 'Otro', fecha: '2026-08-06', horaInicio: '20:30', titulo: 'Charla con familias', descripcion: 'Reunión informativa previa al torneo.' },
];

export const seedActas: Record<string, Acta> = {
  '91': { resultadoClub: '1', resultadoRival: '2', formacionSnapshot: formacionDemo, goles: [{ jugadorId: '7', minuto: '63', asistenciaId: '2' }], amarillas: [{ jugadorId: '6', minuto: '28' }], rojas: [], cambios: [{ saleId: '15', entraId: '14', minuto: '67' }], puntajes: { '1': '6.5', '2': '7', '4': '6', '5': '6.5', '6': '5.5', '7': '7.5', '10': '6', '11': '6.5', '12': '6.5', '13': '6', '15': '6', '14': '6.5' }, observaciones: 'El equipo reaccionó en el complemento, pero no alcanzó para igualar el partido.' },
  '92': { resultadoClub: '2', resultadoRival: '0', formacionSnapshot: formacionDemo, goles: [{ jugadorId: '7', minuto: '34', asistenciaId: '13' }, { jugadorId: '2', minuto: '71', asistenciaId: '14' }], amarillas: [{ jugadorId: '12', minuto: '58' }], rojas: [], cambios: [{ saleId: '15', entraId: '14', minuto: '65' }, { saleId: '11', entraId: '16', minuto: '76' }], puntajes: { '1': '7', '2': '8', '4': '7.5', '5': '7', '6': '7', '7': '8.5', '10': '7.5', '11': '7', '12': '8', '13': '8', '15': '7', '14': '7.5', '16': '7' }, observaciones: 'Partido sólido, con control del juego y arco en cero.' },
  '93': { resultadoClub: '1', resultadoRival: '1', formacionSnapshot: formacionDemo, goles: [{ jugadorId: '15', minuto: '22', asistenciaId: '7' }], amarillas: [{ jugadorId: '4', minuto: '41' }, { jugadorId: '13', minuto: '74' }], rojas: [], cambios: [{ saleId: '2', entraId: '14', minuto: '60' }], puntajes: { '1': '7', '2': '6.5', '4': '6.5', '5': '7', '6': '7', '7': '7.5', '10': '6.5', '11': '7', '12': '7.5', '13': '7', '15': '7.5', '14': '6.5' }, observaciones: 'Empate intenso en una cancha difícil. Buen cierre defensivo en los últimos minutos.' },
};

const HISTORICAL_SEED_IDS = new Set([91, 92, 93]);
const LEGACY_DEMO_IDS = new Set([101, 102, 103, 104, 105, 106, 107]);
const DEMO_NUMERO_FECHA: Record<number, number> = { 91: 12, 92: 13, 93: 1, 102: 14, 105: 2 };

function withDemoNumeroFecha(eventos: Evento[]) {
  return eventos.map((evento) => evento.numeroFecha === undefined && DEMO_NUMERO_FECHA[evento.id]
    ? { ...evento, numeroFecha: DEMO_NUMERO_FECHA[evento.id] }
    : evento);
}

function cloneSeedData(): SportsCalendarData {
  return { eventos: withDemoNumeroFecha(seedEventos), actas: Object.fromEntries(Object.entries(seedActas).map(([id, acta]) => [id, normalizeActa(acta)])), prefs: { visibles: [], colores: {} } };
}

export function readSportsCalendarData(): SportsCalendarData {
  const fallback = cloneSeedData();
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = window.localStorage.getItem(SPORTS_CALENDAR_STORAGE);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved) as Partial<SportsCalendarData>;
    const storedEventos = Array.isArray(parsed.eventos) ? withDemoNumeroFecha(parsed.eventos) : fallback.eventos;
    const storedActas = parsed.actas && typeof parsed.actas === 'object'
      ? Object.fromEntries(Object.entries(parsed.actas).map(([id, acta]) => [id, normalizeActa(acta)]))
      : fallback.actas;
    const migrateLegacyDemo = storedEventos.length > 0
      && !storedEventos.some((evento) => HISTORICAL_SEED_IDS.has(evento.id))
      && storedEventos.every((evento) => LEGACY_DEMO_IDS.has(evento.id));
    return {
      eventos: migrateLegacyDemo ? [...seedEventos.filter((evento) => HISTORICAL_SEED_IDS.has(evento.id)), ...storedEventos] : storedEventos,
      actas: migrateLegacyDemo ? { ...seedActas, ...storedActas } : storedActas,
      prefs: parsed.prefs && typeof parsed.prefs === 'object' ? parsed.prefs : fallback.prefs,
    };
  } catch {
    return fallback;
  }
}

export function writeSportsCalendarData(data: SportsCalendarData) {
  try {
    window.localStorage.setItem(SPORTS_CALENDAR_STORAGE, JSON.stringify(data));
  } catch { /* almacenamiento no disponible */ }
}
