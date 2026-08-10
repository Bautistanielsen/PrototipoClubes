import type { StatisticsViewProps } from './types';
import type { MatchOutcome } from '../../lib/sportsStatistics';

const average = (value: number | null) => value === null ? 'Sin datos' : value.toFixed(2);
const OUTCOME_PRESENTATION: Record<MatchOutcome, { className: string; style: { background: string; color: string } }> = {
  V: { className: 'win', style: { background: '#eaf7ef', color: '#168345' } },
  E: { className: 'draw', style: { background: '#fff8e1', color: '#a97c00' } },
  D: { className: 'loss', style: { background: '#fff0f1', color: '#bc3941' } },
};

export default function SummaryView({ stats }: StatisticsViewProps) {
  const showTrend = stats.evidence.canShowTrends;
  return <>
    <section className="statistics-section statistics-summary">
      <div className="statistics-cards">
        <StatCard label="Partidos" value={stats.team.matchesPlayed} />
        <StatCard label="Victorias" value={stats.team.wins} tone="positive" />
        <StatCard label="Empates" value={stats.team.draws} tone="neutral" />
        <StatCard label="Derrotas" value={stats.team.losses} tone="negative" />
        <StatCard label="Goles a favor" value={stats.team.goalsFor} />
        <StatCard label="Goles en contra" value={stats.team.goalsAgainst} />
      </div>
    </section>
    <section className="statistics-section">
      <SectionTitle title="Equipo" detail="Indicadores y secuencia reciente" />
      <div className="statistics-grid">
        <div className="statistics-panel"><h3>Indicadores</h3><div className="statistics-kv"><span>Diferencia de gol</span><b>{stats.team.goalDifference}</b><span>Promedio a favor</span><b>{average(stats.team.scoringRate)}</b><span>Promedio en contra</span><b>{average(stats.team.concedingRate)}</b><span>Arcos en cero</span><b>{stats.team.cleanSheets}</b></div></div>
        <div className="statistics-panel"><h3>{showTrend ? 'Últimos resultados' : 'Evidencia disponible'}</h3>{showTrend ? <div className="statistics-sequence" aria-label="Secuencia de últimos resultados">{stats.team.recentSequence.map((item, index) => <span key={`${item}-${index}`} className={OUTCOME_PRESENTATION[item].className} style={OUTCOME_PRESENTATION[item].style}>{item}</span>)}</div> : <p className="statistics-unknown">Se necesitan 5 partidos finalizados para mostrar tendencias.</p>}</div>
      </div>
    </section>
  </>;
}

function SectionTitle({ title, detail }: { title: string; detail: string }) { return <header className="statistics-section-title"><div><h2>{title}</h2><p>{detail}</p></div></header>; }
function StatCard({ label, value, tone = '' }: { label: string; value: number | string; tone?: string }) { return <div className={`statistics-card ${tone}`}><span>{label}</span><strong>{value}</strong></div>; }
