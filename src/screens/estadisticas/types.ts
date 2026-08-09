import type { Jugador } from '../../types';
import type { SportsStatistics } from '../../lib/sportsStatistics';

export type StatisticsViewProps = {
  stats: SportsStatistics;
  players: Jugador[];
  equipoId: number;
  equipoNombre: string;
};

export function rosterPlayer(playerId: string, players: Jugador[], equipoId: number) {
  return players.find((player) => String(player.id) === playerId && player.equipoId === equipoId);
}

export function displayName(displayName: string, playerId: string, players: Jugador[], equipoId: number) {
  if (displayName.trim()) return displayName;
  const player = rosterPlayer(playerId, players, equipoId);
  return player ? `${player.nombre} ${player.apellido}`.trim() : 'Jugador sin nombre';
}

export function playerPhoto(playerId: string, photo: string | undefined, players: Jugador[], equipoId: number) {
  return photo || rosterPlayer(playerId, players, equipoId)?.foto;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2) || '?').toUpperCase();
}
