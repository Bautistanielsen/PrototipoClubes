import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import {
  deriveSportsStatistics,
  type StatisticsFilters,
} from '../lib/sportsStatistics';
import { readSportsCalendarData } from '../lib/sportsCalendar';
import type { Competencia, SportsCalendarData } from '../lib/sportsCalendar';

type CompetitionFilter = Competencia | 'all';
type ConditionFilter = NonNullable<StatisticsFilters['condition']> | 'all';

const metric = (value: number | null) => value === null ? 'Sin datos' : String(value);
const percentage = (value: number | null) => value === null ? 'Sin datos' : `${Math.round(value * 100)}%`;

export default function Estadisticas() {
  const { state, actions } = useApp();
  const [data, setData] = useState<SportsCalendarData>(() => readSportsCalendarData());
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [competition, setCompetition] = useState<CompetitionFilter>('all');
  const [condition, setCondition] = useState<ConditionFilter>('all');
  useEffect(() => { setData(readSportsCalendarData()); setCompetition('all'); setCondition('all'); }, [state.selectedEquipoDeportivoId]);

  const competitions = useMemo(() => [...new Set(data.eventos
    .filter((event) => event.equipoId === state.selectedEquipoDeportivoId && event.competencia)
    .map((event) => event.competencia as Competencia))], [data.eventos, state.selectedEquipoDeportivoId]);
  const filters: StatisticsFilters = {
    equipoId: state.selectedEquipoDeportivoId,
    from: from || undefined,
    to: to || undefined,
    competition: competition === 'all' ? undefined : competition,
    condition: condition === 'all' ? undefined : condition,
  };
  const stats = useMemo(() => deriveSportsStatistics(data, filters, state.jugadores), [data, filters.equipoId, filters.from, filters.to, filters.competition, filters.condition, state.jugadores]);
  const equipo = state.equiposDeportivos.find((item) => item.id === state.selectedEquipoDeportivoId);
  const showTrend = stats.evidence.canShowTrends;
  const hasPlayerFacts = stats.players.some((player) => [player.goals, player.assists, player.yellowCards, player.redCards, player.rating].some((value) => value !== null));
  const resetFilters = () => { setFrom(''); setTo(''); setCompetition('all'); setCondition('all'); };

  return <section className="statistics-screen">
    <header className="statistics-header"><div><span className="statistics-eyebrow">GESTIÓN DEPORTIVA</span><h1>Estadísticas</h1><p>Una lectura progresiva del rendimiento y el contexto del plantel.</p></div><label>Plantel<select value={state.selectedEquipoDeportivoId} onChange={(event) => actions.selectEquipoDeportivo(Number(event.target.value))}>{state.equiposDeportivos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label></header>
    <div className="statistics-filters" aria-label="Filtros de estadísticas">
      <label>Desde<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
      <label>Hasta<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
      <label>Competencia<select value={competition} onChange={(event) => setCompetition(event.target.value as CompetitionFilter)}><option value="all">Todas</option>{competitions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Condición<select value={condition} onChange={(event) => setCondition(event.target.value as ConditionFilter)}><option value="all">Local y visitante</option><option value="Local">Local</option><option value="Visitante">Visitante</option></select></label>
      <button type="button" className="statistics-filter-reset" onClick={resetFilters}>Limpiar filtros</button>
    </div>
    <section className="statistics-section statistics-summary"><SectionTitle title="Resumen" detail={`${equipo?.nombre || 'Plantel'} · resultados finalizados`} /><div className="statistics-cards"><StatCard label="Partidos" value={stats.team.matchesPlayed} /><StatCard label="Victorias" value={stats.team.wins} tone="positive" /><StatCard label="Empates" value={stats.team.draws} tone="neutral" /><StatCard label="Derrotas" value={stats.team.losses} tone="negative" /><StatCard label="Goles a favor" value={stats.team.goalsFor} /><StatCard label="Goles en contra" value={stats.team.goalsAgainst} /></div></section>

    <section className="statistics-section"><SectionTitle title="Equipo" detail="Forma y producción del plantel" /><div className="statistics-grid"><div className="statistics-panel"><h3>Indicadores</h3><div className="statistics-kv"><span>Diferencia de gol</span><b>{stats.team.goalDifference}</b><span>Promedio a favor</span><b>{metric(stats.team.scoringRate)}</b><span>Promedio en contra</span><b>{metric(stats.team.concedingRate)}</b><span>Arcos en cero</span><b>{stats.team.cleanSheets}</b></div></div><div className="statistics-panel"><h3>{showTrend ? 'Últimos resultados' : 'Evidencia disponible'}</h3>{showTrend ? <div className="statistics-sequence">{stats.team.recentSequence.map((item, index) => <span key={`${item}-${index}`} className={item}>{item}</span>)}</div> : <p className="statistics-unknown">Se necesitan 5 partidos finalizados para mostrar tendencias.</p>}</div></div></section>

    <section className="statistics-section"><SectionTitle title="Jugadores" detail="Incidencias y calificaciones registradas" />{!hasPlayerFacts ? <div className="statistics-empty"><strong>No hay datos de jugadores para estos filtros</strong><p>Las actas seleccionadas todavía no tienen incidencias ni calificaciones registradas.</p></div> : <div className="statistics-table-wrap"><table className="statistics-table" aria-label="Incidencias y calificaciones por jugador"><caption>Incidencias y calificaciones por jugador</caption><thead><tr><th scope="col">Jugador</th><th scope="col">Goles</th><th scope="col">Asistencias</th><th scope="col">Amarillas</th><th scope="col">Rojas</th><th scope="col">Puntaje</th><th scope="col">Calificaciones</th></tr></thead><tbody>{stats.players.map((player) => <tr key={`${player.player.equipoId}-${player.player.playerId}`}><th scope="row">{player.player.displayName || 'Jugador sin nombre'}<small>{player.player.playerId}</small></th><td>{metric(player.goals)}</td><td>{metric(player.assists)}</td><td>{metric(player.yellowCards)}</td><td>{metric(player.redCards)}</td><td>{player.rating === null ? 'Sin datos' : player.rating.toFixed(1)}</td><td>{player.ratedMatches || 'Sin datos'}</td></tr>)}</tbody></table></div>}</section>

    <section className="statistics-section"><SectionTitle title="Táctica" detail={stats.evidence.canCompare ? 'Comparación contextual de sistemas, sin afirmar causalidad' : 'Uso registrado como contexto, sin comparación de resultados'} />{stats.evidence.canCompare ? <div className="statistics-table-wrap"><table className="statistics-table" aria-label="Resultados por sistema registrado"><caption>Resultados por sistema registrado</caption><thead><tr><th scope="col">Sistema</th><th scope="col">Uso</th><th scope="col">Victorias</th><th scope="col">Empates</th><th scope="col">Derrotas</th><th scope="col">GF / GC</th></tr></thead><tbody>{stats.tactical.registeredSystems.map((system) => <tr key={system.system}><th scope="row">{system.system}</th><td>{system.matches} · {percentage(system.usageRate)}</td><td>{system.wins}</td><td>{system.draws}</td><td>{system.losses}</td><td>{system.goalsFor} / {system.goalsAgainst}</td></tr>)}</tbody></table>{!stats.tactical.registeredSystems.length && <p className="statistics-unknown">No hay sistemas registrados en esta muestra.</p>}</div> : <div className="statistics-panel"><p className="statistics-unknown">Los resultados por sistema aparecen con 5 partidos finalizados.</p><div className="statistics-usage-list">{stats.tactical.registeredSystems.map((system) => <div key={system.system}><strong>{system.system}</strong><span>{system.matches} registros · {percentage(system.usageRate)} de uso</span></div>)}</div></div>}</section>

    <section className="statistics-section statistics-operations"><SectionTitle title="Operaciones" detail="Seguimiento técnico separado del rendimiento" /><div className="statistics-cards"><StatCard label="Partidos en agenda" value={stats.operations.matchEvents} /><StatCard label="Actas finalizadas" value={stats.operations.finalizedMatches} /><StatCard label="Cobertura de actas" value={percentage(stats.operations.actaCoverage)} /><StatCard label="Actas pendientes" value={stats.operations.pendingActs} /><StatCard label="Postergados" value={stats.operations.postponedMatches} /><StatCard label="Suspendidos" value={stats.operations.suspendedMatches} /><StatCard label="Próximos 7 días" value={stats.operations.matchCongestion} /><StatCard label="Disponibles hoy" value={stats.operations.availablePlayers === null ? 'Sin datos' : stats.operations.availablePlayers} /></div><p className="statistics-footnote">Disponibilidad: estado actual del plantel. No representa historial de lesiones ni carga de trabajo.</p></section>
  </section>;
}

function SectionTitle({ title, detail }: { title: string; detail: string }) { return <header className="statistics-section-title"><div><h2>{title}</h2><p>{detail}</p></div></header>; }
function StatCard({ label, value, tone = '' }: { label: string; value: number | string; tone?: string }) { return <div className={`statistics-card ${tone}`}><span>{label}</span><strong>{value}</strong></div>; }
