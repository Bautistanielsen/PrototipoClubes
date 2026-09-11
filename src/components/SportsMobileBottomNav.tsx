import { useState } from 'react';
import { useApp } from '../state/AppContext';
import type { Screen, StatisticsView } from '../types';

const primaryItems: Array<{ screen: Extract<Screen, 'deportivo_inicio' | 'equipos' | 'partidos' | 'calendario'>; label: string }> = [
  { screen: 'deportivo_inicio', label: 'Inicio' },
  { screen: 'equipos', label: 'Plantel' },
  { screen: 'partidos', label: 'Partidos' },
  { screen: 'calendario', label: 'Calendario' },
];

const statisticsViews: Array<{ view: StatisticsView; label: string }> = [
  { view: 'summary', label: 'Resumen' },
  { view: 'players', label: 'Jugadores' },
  { view: 'tactics', label: 'Táctica' },
];

function SportsFooterIcon({ screen }: { screen: Screen | 'more' }) {
  const common = { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (screen === 'deportivo_inicio') return <svg {...common}><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></svg>;
  if (screen === 'equipos') return <svg {...common}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9.5" r="2.2" /><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6M15.5 14.5c2.7.3 4.5 2.3 4.5 5" /></svg>;
  if (screen === 'partidos') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m12 7 4.76 3.45L15 16H9l-1.76-5.55L12 7" /></svg>;
  if (screen === 'calendario') return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /><path d="m9 15 2 2 4-4" /></svg>;
  return <svg {...common}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></svg>;
}

export default function SportsMobileBottomNav() {
  const { state, actions } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);
  const isActive = (screen: Screen) => state.screen === screen;

  const navigate = (screen: Screen) => {
    setMoreOpen(false);
    actions.navigate(screen);
  };

  const selectStatistics = (view: StatisticsView) => {
    setMoreOpen(false);
    actions.selectEstadisticasVista(view);
    actions.navigate('estadisticas');
  };

  return (
    <>
      <nav className="sports-mobile-bottom-nav no-print" aria-label="Navegación deportiva">
        {primaryItems.map((item) => (
          <button
            type="button"
            key={item.screen}
            className={isActive(item.screen) ? 'active' : ''}
            aria-current={isActive(item.screen) ? 'page' : undefined}
            onClick={() => navigate(item.screen)}
          >
            <SportsFooterIcon screen={item.screen} />
            <span>{item.label}</span>
          </button>
        ))}
        <button type="button" className={moreOpen ? 'active' : ''} aria-expanded={moreOpen} onClick={() => setMoreOpen((open) => !open)}>
          <SportsFooterIcon screen="more" />
          <span>Más</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="sports-mobile-more-overlay" onClick={() => setMoreOpen(false)}>
          <section className="sports-mobile-more-sheet" role="dialog" aria-modal="true" aria-labelledby="sports-more-title" onClick={(event) => event.stopPropagation()}>
            <div className="sports-mobile-more-handle" aria-hidden="true" />
            <div className="sports-mobile-more-heading">
              <strong id="sports-more-title">Más opciones</strong>
              <button type="button" onClick={() => setMoreOpen(false)} aria-label="Cerrar más opciones">×</button>
            </div>
            <button type="button" onClick={() => navigate('formaciones')}>Formaciones</button>
            <div className="sports-mobile-more-group-title">Estadísticas</div>
            {statisticsViews.map((item) => (
              <button type="button" key={item.view} className={state.screen === 'estadisticas' && state.estadisticasVista === item.view ? 'active' : ''} onClick={() => selectStatistics(item.view)}>
                {item.label}
              </button>
            ))}
          </section>
        </div>
      )}
    </>
  );
}
