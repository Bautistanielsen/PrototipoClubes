import type { Formacion, Jugador } from '../types';
import {
  normalizeActa,
  parseFinalizedResult,
} from './sportsCalendar';
import type {
  Acta,
  Competencia,
  Evento,
  FinalizedResult,
  PlayerRef,
  SportsCalendarData,
} from './sportsCalendar';

export type StatisticsFilters = {
  equipoId: number;
  from?: string;
  to?: string;
  competition?: Competencia;
  condition?: 'Local' | 'Visitante';
};

export type Evidence = {
  sampleSize: number;
  confidence: 'insufficient' | 'comparable';
  canShowTrends: boolean;
  canCompare: boolean;
  canRank: boolean;
};

export type FinalizedMatch = { evento: Evento; acta: Acta; result: FinalizedResult };
export type MatchOutcome = 'V' | 'E' | 'D';

export type TeamStatistics = Evidence & {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  scoringRate: number | null;
  concedingRate: number | null;
  cleanSheets: number;
  scoredMatches: number;
  recentSequence: MatchOutcome[];
};

export type PlayerStatistics = {
  player: PlayerRef;
  goals: number | null;
  assists: number | null;
  yellowCards: number | null;
  redCards: number | null;
  rating: number | null;
  ratedMatches: number;
  cleanSheets: number;
  isGoalkeeper: boolean;
};

export type TacticalLineupPlayer = PlayerRef & { dorsal?: string; x: number; y: number };

export type TacticalEntry = {
  system: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  usageRate: number | null;
  latestSnapshot: {
    eventId: number;
    date: string;
    time: string;
    rival: string;
    formationName: string;
    camiseta: Formacion['camiseta'];
    starters: TacticalLineupPlayer[];
    substitutes: TacticalLineupPlayer[];
  } | null;
};

export type TacticalStatistics = Evidence & {
  registeredSystems: TacticalEntry[];
};

export type SportsStatistics = {
  evidence: Evidence;
  team: TeamStatistics;
  players: PlayerStatistics[];
  tactical: TacticalStatistics;
};

export type PlayerHighlights = {
  bestRated: PlayerStatistics[];
  topScorers: PlayerStatistics[];
  topAssisters: PlayerStatistics[];
};

function matchesFilter(evento: Evento, filters: StatisticsFilters) {
  return evento.tipo === 'Partido'
    && evento.equipoId === filters.equipoId
    && (!filters.from || evento.fecha >= filters.from)
    && (!filters.to || evento.fecha <= filters.to)
    && (!filters.competition || evento.competencia === filters.competition)
    && (!filters.condition || evento.condicion === filters.condition);
}

export function selectMatchEvents(data: SportsCalendarData, filters: StatisticsFilters): Evento[] {
  return data.eventos.filter((evento) => matchesFilter(evento, filters));
}

export function selectFinalizedMatches(data: SportsCalendarData, filters: StatisticsFilters): FinalizedMatch[] {
  return selectMatchEvents(data, filters).flatMap((evento) => {
    const acta = normalizeActa(data.actas[String(evento.id)], evento.equipoId);
    const result = parseFinalizedResult(evento, acta);
    return result ? [{ evento, acta, result }] : [];
  });
}

function confidenceFor(sampleSize: number): Evidence['confidence'] {
  return sampleSize < 5 ? 'insufficient' : 'comparable';
}

export function evidenceFor(matches: FinalizedMatch[]): Evidence {
  const sampleSize = matches.length;
  return {
    sampleSize,
    confidence: confidenceFor(sampleSize),
    canShowTrends: sampleSize >= 5,
    canCompare: sampleSize >= 5,
    canRank: sampleSize >= 5,
  };
}

export function deriveEvidence(data: SportsCalendarData, filters: StatisticsFilters): Evidence {
  return evidenceFor(selectFinalizedMatches(data, filters));
}

const rate = (value: number, sampleSize: number) => sampleSize ? value / sampleSize : null;

export function deriveTeamStatistics(data: SportsCalendarData, filters: StatisticsFilters): TeamStatistics {
  const matches = selectFinalizedMatches(data, filters);
  const evidence = evidenceFor(matches);
  const wins = matches.filter(({ result }) => result.outcome === 'win').length;
  const draws = matches.filter(({ result }) => result.outcome === 'draw').length;
  const losses = matches.filter(({ result }) => result.outcome === 'loss').length;
  const goalsFor = matches.reduce((total, match) => total + match.result.club, 0);
  const goalsAgainst = matches.reduce((total, match) => total + match.result.rival, 0);
  return {
    ...evidence,
    matchesPlayed: matches.length,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    scoringRate: rate(goalsFor, matches.length),
    concedingRate: rate(goalsAgainst, matches.length),
    cleanSheets: matches.filter(({ result }) => result.rival === 0).length,
    scoredMatches: matches.filter(({ result }) => result.club > 0).length,
    recentSequence: [...matches].sort((a, b) => `${b.evento.fecha}${b.evento.horaInicio || ''}`.localeCompare(`${a.evento.fecha}${a.evento.horaInicio || ''}`)).map(({ result }) => result.outcome === 'win' ? 'V' : result.outcome === 'draw' ? 'E' : 'D'),
  };
}

type PlayerIdentitySource = 'snapshot' | 'roster';
type ResolvedPlayer = { player: PlayerRef; source: PlayerIdentitySource };

function fallbackPlayer(id: string, equipoId: number, players: Jugador[]): PlayerRef {
  const current = players.find((player) => String(player.id) === id && player.equipoId === equipoId);
  return {
    playerId: id,
    equipoId,
    displayName: current ? `${current.nombre} ${current.apellido}`.trim() : '',
    foto: current?.foto,
    posicion: current?.posicion,
  };
}

function resolvePlayer(id: string, acta: Acta, equipoId: number, players: Jugador[]): ResolvedPlayer {
  const snapshot = acta.jugadoresSnapshot?.[id];
  return snapshot && snapshot.playerId === id && snapshot.equipoId === equipoId
    ? { player: snapshot, source: 'snapshot' }
    : { player: fallbackPlayer(id, equipoId, players), source: 'roster' };
}

function preferIdentity(current: { player: PlayerRef; source: PlayerIdentitySource }, candidate: ResolvedPlayer) {
  const currentName = current.player.displayName.trim(); const candidateName = candidate.player.displayName.trim();
  if (currentName && !candidateName) return current;
  if (!currentName && candidateName) return candidate;
  if (current.source !== candidate.source) return candidate.source === 'snapshot' ? candidate : current;
  return candidateName.localeCompare(currentName) < 0 ? candidate : current;
}

function playerIds(acta: Acta) {
  const ids = new Set<string>();
  acta.formacionSnapshot?.jugadores.forEach((item) => ids.add(String(item.jugadorId)));
  acta.goles.forEach((item) => { ids.add(item.jugadorId); if (item.asistenciaId) ids.add(item.asistenciaId); });
  acta.amarillas.forEach((item) => ids.add(item.jugadorId));
  acta.rojas.forEach((item) => ids.add(item.jugadorId));
  acta.cambios.forEach((item) => { ids.add(item.saleId); ids.add(item.entraId); });
  Object.keys(acta.puntajes).forEach((id) => ids.add(id));
  Object.keys(acta.jugadoresSnapshot || {}).forEach((id) => ids.add(id));
  return [...ids].filter(Boolean);
}

function numericRating(value?: string) {
  if (!value || value.trim() === '') return null;
  const rating = Number(value);
  return Number.isFinite(rating) && rating >= 1 && rating <= 10 ? rating : null;
}

function positionOf(player: Jugador | PlayerRef | undefined) {
  const value = player?.posicion || (player as (Jugador | PlayerRef) & { position?: string } | undefined)?.position;
  return value?.trim().toLocaleLowerCase('es-AR') || '';
}

function isGoalkeeperPosition(position: string) {
  return position.includes('arquero') || position.includes('portero') || position.includes('goalkeeper') || position === 'gk';
}

function currentGoalkeeperIds(entries: Formacion['jugadores'], players: Jugador[], equipoId: number) {
  return entries
    .filter((entry) => entry.zona === 'titular')
    .filter((entry) => isGoalkeeperPosition(positionOf(players.find((player) => player.id === entry.jugadorId && player.equipoId === equipoId))))
    .map((entry) => String(entry.jugadorId));
}

function snapshotGoalkeeperIds(entries: Formacion['jugadores'], acta: Acta) {
  return entries
    .filter((entry) => entry.zona === 'titular')
    .filter((entry) => isGoalkeeperPosition(positionOf(acta.jugadoresSnapshot?.[String(entry.jugadorId)])))
    .map((entry) => String(entry.jugadorId));
}

function goalkeeperIdForMatch(match: FinalizedMatch, players: Jugador[]) {
  const formation = match.acta.formacionSnapshot;
  if (!formation) return null;
  const entries = formation.jugadores;
  // Historical acta data is authoritative; current roster position is only a last-resort fallback.
  const bySnapshot = snapshotGoalkeeperIds(entries, match.acta);
  if (bySnapshot.length) return bySnapshot[0];
  const bySnapshotDorsal = entries.find((entry) => entry.zona === 'titular' && entry.dorsal.trim() === '1');
  if (bySnapshotDorsal) return bySnapshotDorsal.jugadorId.toString();
  const byCurrentRoster = currentGoalkeeperIds(entries, players, match.evento.equipoId);
  return byCurrentRoster[0] || null;
}

function isNewerThanSnapshot(match: FinalizedMatch, snapshot: NonNullable<TacticalEntry['latestSnapshot']>) {
  const date = match.evento.fecha.localeCompare(snapshot.date);
  if (date !== 0) return date > 0;
  const time = (match.evento.horaInicio || '').localeCompare(snapshot.time);
  if (time !== 0) return time > 0;
  return match.evento.id > snapshot.eventId;
}

function lineupPlayer(id: number, dorsal: string, x: number, y: number, acta: Acta, players: Jugador[], equipoId: number): TacticalLineupPlayer {
  const resolved = resolvePlayer(String(id), acta, equipoId, players).player;
  return { ...resolved, dorsal, x, y };
}

export function derivePlayerStatistics(data: SportsCalendarData, filters: StatisticsFilters, players: Jugador[] = []): PlayerStatistics[] {
  const matches = selectFinalizedMatches(data, filters);
  const observedFacts = {
    goals: matches.length > 0 && matches.every(({ acta }) => acta.observedFacts?.goals === true),
    assists: matches.length > 0 && matches.every(({ acta }) => acta.observedFacts?.assists === true),
    yellowCards: matches.length > 0 && matches.every(({ acta }) => acta.observedFacts?.yellowCards === true),
    redCards: matches.length > 0 && matches.every(({ acta }) => acta.observedFacts?.redCards === true),
  };
  const aggregates = new Map<string, {
    player: PlayerRef; identitySource: PlayerIdentitySource; goals: number; assistCount: number; assistObserved: boolean; yellowCards: number; redCards: number; ratings: number[]; cleanSheets: number; isGoalkeeper: boolean;
  }>();
  const add = (id: string, acta: Acta) => {
    const resolved = resolvePlayer(id, acta, filters.equipoId, players);
    const current = aggregates.get(id) || { player: resolved.player, identitySource: resolved.source, goals: 0, assistCount: 0, assistObserved: false, yellowCards: 0, redCards: 0, ratings: [], cleanSheets: 0, isGoalkeeper: false };
    const preferred = preferIdentity({ player: current.player, source: current.identitySource }, resolved);
    current.player = preferred.player; current.identitySource = preferred.source;
    aggregates.set(id, current);
    return current;
  };
  players.filter((player) => player.equipoId === filters.equipoId).forEach((player) => add(String(player.id), matches[0]?.acta || normalizeActa(undefined, filters.equipoId)));
  players.filter((player) => player.equipoId === filters.equipoId && isGoalkeeperPosition(positionOf(player))).forEach((player) => { add(String(player.id), matches[0]?.acta || normalizeActa(undefined, filters.equipoId)).isGoalkeeper = true; });
  matches.forEach(({ acta }) => {
    playerIds(acta).forEach((id) => add(id, acta));
    acta.goles.forEach((goal) => {
      const current = add(goal.jugadorId, acta); current.goals += 1;
      if (goal.asistenciaId) { const assister = add(goal.asistenciaId, acta); assister.assistCount += 1; assister.assistObserved = true; }
    });
    acta.amarillas.forEach((card) => { add(card.jugadorId, acta).yellowCards += 1; });
    acta.rojas.forEach((card) => { add(card.jugadorId, acta).redCards += 1; });
    Object.entries(acta.puntajes).forEach(([id, value]) => { const rating = numericRating(value); if (rating !== null) add(id, acta).ratings.push(rating); });
  });
  matches.forEach((match) => {
    const goalkeeperId = goalkeeperIdForMatch(match, players);
    if (!goalkeeperId) return;
    const current = add(goalkeeperId, match.acta);
    current.isGoalkeeper = true;
    if (match.result.rival === 0) current.cleanSheets += 1;
  });
  return [...aggregates.values()].map((item) => ({
    player: item.player,
    goals: observedFacts.goals ? item.goals : null,
    assists: observedFacts.assists ? item.assistCount : null,
    yellowCards: observedFacts.yellowCards ? item.yellowCards : null,
    redCards: observedFacts.redCards ? item.redCards : null,
    rating: item.ratings.length ? item.ratings.reduce((sum, value) => sum + value, 0) / item.ratings.length : null,
    ratedMatches: item.ratings.length,
    cleanSheets: item.cleanSheets,
    isGoalkeeper: item.isGoalkeeper,
  }));
}

export function deriveTacticalStatistics(data: SportsCalendarData, filters: StatisticsFilters, players: Jugador[] = []): TacticalStatistics {
  const matches = selectFinalizedMatches(data, filters);
  const systems = new Map<string, TacticalEntry>();
  matches.forEach((match) => {
    const { acta, result, evento } = match;
    const formation = acta.formacionSnapshot;
    const system = formation?.sistema;
    if (!system) return;
    const current = systems.get(system) || { system, matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, usageRate: null, latestSnapshot: null };
    current.matches += 1; current.goalsFor += result.club; current.goalsAgainst += result.rival;
    if (result.outcome === 'win') current.wins += 1; else if (result.outcome === 'draw') current.draws += 1; else current.losses += 1;
    const latest = current.latestSnapshot;
    if (!latest || isNewerThanSnapshot(match, latest)) {
      const entries = acta.formacionSnapshot?.jugadores || [];
      current.latestSnapshot = {
        eventId: evento.id,
        date: evento.fecha,
        time: evento.horaInicio || '',
        rival: evento.rival || 'Rival a definir',
        formationName: formation.nombre || system,
        camiseta: formation.camiseta,
        starters: entries.filter((entry) => entry.zona === 'titular').map((entry) => lineupPlayer(entry.jugadorId, entry.dorsal, entry.x, entry.y, acta, players, evento.equipoId)),
        substitutes: entries.filter((entry) => entry.zona === 'suplente').map((entry) => lineupPlayer(entry.jugadorId, entry.dorsal, entry.x, entry.y, acta, players, evento.equipoId)),
      };
    }
    systems.set(system, current);
  });
  const evidence = evidenceFor(matches);
  return { ...evidence, registeredSystems: [...systems.values()].map((system) => ({ ...system, usageRate: rate(system.matches, matches.length) })) };
}

function leadersByValue(players: PlayerStatistics[], value: (player: PlayerStatistics) => number | null) {
  const eligible = players.filter((player) => !player.isGoalkeeper && value(player) !== null && (value(player) as number) > 0);
  if (!eligible.length) return [];
  const maximum = Math.max(...eligible.map((player) => value(player) as number));
  return eligible.filter((player) => value(player) === maximum);
}

export function derivePlayerHighlights(players: PlayerStatistics[]): PlayerHighlights {
  const rated = players.filter((player) => player.rating !== null && player.ratedMatches >= 3);
  const bestRating = rated.length ? Math.max(...rated.map((player) => player.rating as number)) : null;
  return {
    bestRated: bestRating === null ? [] : rated.filter((player) => player.rating === bestRating),
    topScorers: leadersByValue(players, (player) => player.goals),
    topAssisters: leadersByValue(players, (player) => player.assists),
  };
}

export function deriveSportsStatistics(data: SportsCalendarData, filters: StatisticsFilters, players: Jugador[] = []): SportsStatistics {
  return {
    evidence: deriveEvidence(data, filters),
    team: deriveTeamStatistics(data, filters),
    players: derivePlayerStatistics(data, filters, players),
    tactical: deriveTacticalStatistics(data, filters, players),
  };
}
