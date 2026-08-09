import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { deriveSportsStatistics, type StatisticsFilters } from '../lib/sportsStatistics';
import { readSportsCalendarData } from '../lib/sportsCalendar';
import type { Competencia, SportsCalendarData } from '../lib/sportsCalendar';
import SummaryView from './estadisticas/SummaryView';
import PlayersView from './estadisticas/PlayersView';
import TacticsView from './estadisticas/TacticsView';

type CompetitionFilter = Competencia | 'all';
type ConditionFilter = NonNullable<StatisticsFilters['condition']> | 'all';

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
  const resetFilters = () => { setFrom(''); setTo(''); setCompetition('all'); setCondition('all'); };
  const viewProps = { stats, players: state.jugadores, equipoId: state.selectedEquipoDeportivoId, equipoNombre: equipo?.nombre || 'Plantel' };
  const viewHeader = {
    summary: { title: 'Resumen', detail: `${equipo?.nombre || 'Plantel'} · resultados finalizados` },
    players: { title: 'Jugadores', detail: 'Rendimiento individual e incidencias registradas' },
    tactics: { title: 'Táctica', detail: 'Sistemas registrados y formación histórica más reciente' },
  }[state.estadisticasVista];

  return <section className="statistics-screen">
    <header className="statistics-header"><div><span className="statistics-eyebrow">GESTIÓN DEPORTIVA</span><h1>{viewHeader.title}</h1><p>{viewHeader.detail}</p></div><label>Plantel<select value={state.selectedEquipoDeportivoId} onChange={(event) => actions.selectEquipoDeportivo(Number(event.target.value))}>{state.equiposDeportivos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label></header>
    <div className="statistics-filters" aria-label="Filtros de estadísticas">
      <label>Desde<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
      <label>Hasta<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
      <label>Competencia<select value={competition} onChange={(event) => setCompetition(event.target.value as CompetitionFilter)}><option value="all">Todas</option>{competitions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Condición<select value={condition} onChange={(event) => setCondition(event.target.value as ConditionFilter)}><option value="all">Local y visitante</option><option value="Local">Local</option><option value="Visitante">Visitante</option></select></label>
      <button type="button" className="statistics-filter-reset" onClick={resetFilters}>Limpiar filtros</button>
    </div>
    {state.estadisticasVista === 'summary' && <SummaryView {...viewProps} />}
    {state.estadisticasVista === 'players' && <PlayersView {...viewProps} />}
    {state.estadisticasVista === 'tactics' && <TacticsView {...viewProps} />}
  </section>;
}
