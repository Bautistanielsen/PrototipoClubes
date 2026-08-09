import { derivePlayerHighlights, type PlayerStatistics } from '../../lib/sportsStatistics';
import PlayerAvatar from './PlayerAvatar';
import { displayName, playerPhoto, type StatisticsViewProps } from './types';

const metric = (value: number | null) => value === null ? 'Sin datos' : String(value);

export default function PlayersView({ stats, players, equipoId }: StatisticsViewProps) {
  const highlights = derivePlayerHighlights(stats.players);
  const visiblePlayers = stats.players.filter((player) => [player.goals, player.assists, player.yellowCards, player.redCards, player.rating, player.cleanSheets].some((value) => value !== null && value > 0));
  const hasFacts = visiblePlayers.length > 0;
  return <section className="statistics-section">
    <div className="statistics-highlight-grid">
      <HighlightCard title="Mejor jugador" valueLabel="Promedio de calificación" players={highlights.bestRated} value={(player) => player.rating === null ? '' : player.rating.toFixed(1)} empty="Se necesitan 3 partidos calificados por jugador." playersList={players} equipoId={equipoId} />
      <HighlightCard title="Máximo goleador" valueLabel="Goles" players={highlights.topScorers} value={(player) => metric(player.goals)} empty="Todavía no hay goles observados en estos filtros." playersList={players} equipoId={equipoId} />
      <HighlightCard title="Máximo asistidor" valueLabel="Asistencias" players={highlights.topAssisters} value={(player) => metric(player.assists)} empty="Todavía no hay asistencias observadas en estos filtros." playersList={players} equipoId={equipoId} />
    </div>
    {!hasFacts ? <EmptyState title="No hay datos de jugadores para estos filtros" detail="Las actas seleccionadas todavía no tienen incidencias, arcos en cero ni calificaciones registradas." /> : <div className="statistics-table-wrap"><table className="statistics-table" aria-label="Estadísticas por jugador"><caption>Estadísticas por jugador</caption><thead><tr><th scope="col">Jugador</th><th scope="col">Goles</th><th scope="col">Asistencias</th><th scope="col">Arcos en cero</th><th scope="col">Amarillas</th><th scope="col">Rojas</th><th scope="col">Puntaje</th><th scope="col">Calificaciones</th></tr></thead><tbody>{visiblePlayers.map((player) => <PlayerRow key={`${player.player.equipoId}-${player.player.playerId}`} player={player} players={players} equipoId={equipoId} />)}</tbody></table></div>}
  </section>;
}

function PlayerRow({ player, players, equipoId }: { player: PlayerStatistics; players: StatisticsViewProps['players']; equipoId: number }) {
  const name = displayName(player.player.displayName, player.player.playerId, players, equipoId);
  const photo = playerPhoto(player.player.playerId, player.player.foto, players, equipoId);
  return <tr><th scope="row"><span className="statistics-player-cell"><PlayerAvatar name={name} photo={photo} /><span>{name}<small>{player.player.playerId}</small></span></span></th><td>{player.isGoalkeeper ? '—' : metric(player.goals)}</td><td>{player.isGoalkeeper ? '—' : metric(player.assists)}</td><td>{player.isGoalkeeper ? String(player.cleanSheets) : '—'}</td><td>{metric(player.yellowCards)}</td><td>{metric(player.redCards)}</td><td>{player.rating === null ? 'Sin datos' : player.rating.toFixed(1)}</td><td>{player.ratedMatches || 'Sin datos'}</td></tr>;
}

function HighlightCard({ title, valueLabel, players, value, empty, playersList, equipoId }: { title: string; valueLabel: string; players: PlayerStatistics[]; value: (player: PlayerStatistics) => string; empty: string; playersList: StatisticsViewProps['players']; equipoId: number }) {
  return <article className="statistics-highlight-card"><div className="statistics-highlight-heading"><span>{title}</span><small>{valueLabel}</small></div>{players.length ? <div className="statistics-highlight-players">{players.map((player) => { const name = displayName(player.player.displayName, player.player.playerId, playersList, equipoId); return <div className="statistics-highlight-player" key={player.player.playerId}><PlayerAvatar name={name} photo={playerPhoto(player.player.playerId, player.player.foto, playersList, equipoId)} /><div><strong>{name}</strong><b>{value(player)}</b></div></div>; })}</div> : <p className="statistics-highlight-empty">{empty}</p>}</article>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="statistics-empty"><strong>{title}</strong><p>{detail}</p></div>; }
