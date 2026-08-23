import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppProvider, useApp } from './state/AppContext';
import Sidebar from './components/Sidebar';
import MobileTopBar from './components/MobileTopBar';
import MobileBottomNav from './components/MobileBottomNav';
import MoreSheet from './components/MoreSheet';
import Toast from './components/Toast';
import ModuleSelector from './components/ModuleSelector';
import ModuleSwitcher from './components/ModuleSwitcher';
import SportsSquadEntry from './components/SportsSquadEntry';
import SportsSquadSwitcher from './components/SportsSquadSwitcher';
import SportsAssistant from './components/SportsAssistant';
import ClubEscudo from './components/ClubEscudo';
import AdminAssistant from './components/AdminAssistant';
import MediosPagoModal from './components/modals/MediosPagoModal';
import SocioModal from './components/modals/SocioModal';
import ImportarSociosModal from './components/modals/ImportarSociosModal';
import SponsorModal from './components/modals/SponsorModal';
import InfoCanchasModal from './components/modals/InfoCanchasModal';
import AjustarPreciosCanchasModal from './components/modals/AjustarPreciosCanchasModal';
import ModificarProductoBuffetModal from './components/modals/ModificarProductoBuffetModal';
import ModificarProductoShopModal from './components/modals/ModificarProductoShopModal';
import NuevoProductoBuffetModal from './components/modals/NuevoProductoBuffetModal';
import NuevoProductoShopModal from './components/modals/NuevoProductoShopModal';
import VerPartidoModal from './components/modals/VerPartidoModal';
import AgregarPartidoModal from './components/modals/AgregarPartidoModal';
import ReservaModal from './components/modals/ReservaModal';
import JugadorModal from './components/modals/JugadorModal';
import EquipoDeportivoModal from './components/modals/EquipoDeportivoModal';
import DifundirTorneoModal from './components/modals/DifundirTorneoModal';
import Dashboard from './screens/Dashboard';
import Socios from './screens/Socios';
import Cobranza from './screens/Cobranza';
import Ventas from './screens/Ventas';
import Buffet from './screens/Buffet';
import Canchas from './screens/Canchas';
import Calendario from './screens/Calendario';
import Torneos from './screens/Torneos';
import Reportes from './screens/Reportes';
import Egresos from './screens/Egresos';
import Sponsors from './screens/Sponsors';
import Comunicados from './screens/Comunicados';
import Config from './screens/Config';
import DeportivoInicio from './screens/DeportivoInicio';
import Equipos from './screens/Equipos';
import Formaciones from './screens/Formaciones';
import Partidos from './screens/Partidos';
import Estadisticas from './screens/Estadisticas';
import PortalSocio from './screens/PortalSocio';
import type { StatisticsView } from './types';

function ScreenContent() {
  const { state } = useApp();
  switch (state.screen) {
    case 'dashboard': return <Dashboard />;
    case 'socios': return <Socios />;
    case 'cobranza': return <Cobranza />;
    case 'ventas': return <Ventas />;
    case 'buffet': return <Buffet />;
    case 'canchas': return <Canchas />;
    case 'calendario': return <Calendario />;
    case 'torneos': return <Torneos />;
    case 'reportes': return <Reportes />;
    case 'egresos': return <Egresos />;
    case 'sponsors': return <Sponsors />;
    case 'comunicados': return <Comunicados />;
    case 'config': return <Config />;
    case 'deportivo_inicio': return <DeportivoInicio />;
    case 'equipos': return <Equipos />;
    case 'formaciones': return <Formaciones />;
    case 'partidos': return <Partidos />;
    case 'estadisticas': return <Estadisticas />;
    case 'portal_login': case 'portal_inicio': case 'portal_cuota': case 'portal_reservas': case 'portal_novedades': case 'portal_perfil': case 'portal_hacete_socio': case 'portal_mis_reservas': case 'portal_torneos': case 'portal_partidos': return <PortalSocio />;
  }
}

function AdministrativeLayout() {
  const { state } = useApp();
  return <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f7fb' }}>
    {!state.isMobile && <Sidebar />}
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      {state.isMobile && <MobileTopBar />}
      <div style={{ flex: 1, padding: state.isMobile ? '18px 16px 84px' : '32px', maxWidth: 1180, width: '100%', margin: '0 auto' }}><ScreenContent /></div>
      {state.isMobile && <MobileBottomNav />}
    </div>
    <AdminAssistant /><MoreSheet /><AdministrativeModals /><Toast />
  </div>;
}

function SportsNavIcon({ screen }: { screen: 'deportivo_inicio' | 'equipos' | 'formaciones' | 'partidos' | 'calendario' | 'estadisticas' }) {
  const common = { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (screen === 'deportivo_inicio') {
    return <svg {...common}><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></svg>;
  }
  if (screen === 'equipos') {
    return <svg {...common}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9.5" r="2.2" /><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6M15.5 14.5c2.7.3 4.5 2.3 4.5 5" /><path d="m8 4 1-2 1 2" /></svg>;
  }
  if (screen === 'formaciones') {
    return <svg {...common}><rect x="2.5" y="4" width="19" height="16" rx="2" /><path d="M12 4v16" /><circle cx="12" cy="12" r="3" /><path d="M2.5 8h4v8h-4M21.5 8h-4v8h4" /></svg>;
  }
  if (screen === 'partidos') {
    return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m12 7 4.76 3.45L15 16H9l-1.76-5.55L12 7" /><path d="M12 7V3m3 13 2.5 3m-.74-8.55L20.5 9M9.06 16.05 6.5 19m.74-8.55L3.5 9" /></svg>;
  }
  if (screen === 'estadisticas') {
    return <svg {...common}><path d="M4 19V5M4 19h16" /><path d="m7 15 4-4 3 2 5-7" /></svg>;
  }
  return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /><path d="m9 15 2 2 4-4" /></svg>;
}

function DeportivoLayout() {
  const { state, actions } = useApp();
  const [statisticsOpen, setStatisticsOpen] = useState(state.screen === 'estadisticas');
  const nav = [{ screen: 'deportivo_inicio' as const, label: 'Inicio' }, { screen: 'equipos' as const, label: 'Plantel' }, { screen: 'formaciones' as const, label: 'Formaciones' }, { screen: 'partidos' as const, label: 'Partidos' }, { screen: 'calendario' as const, label: 'Calendario' }];
  const statisticsViews: Array<{ view: StatisticsView; label: string }> = [{ view: 'summary', label: 'Resumen' }, { view: 'players', label: 'Jugadores' }, { view: 'tactics', label: 'Táctica' }];
  const selectStatistics = (view: StatisticsView) => { actions.selectEstadisticasVista(view); actions.navigate('estadisticas'); };
  useEffect(() => { if (state.screen === 'estadisticas') setStatisticsOpen(true); }, [state.screen]);
  const toggleStatistics = () => {
    if (state.screen !== 'estadisticas') selectStatistics(state.estadisticasVista);
    else setStatisticsOpen((open) => !open);
  };
  if (state.activeEquipoDeportivoId === null) return <><SportsSquadEntry /><EquipoDeportivoModal /><Toast /></>;
  return <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f7fb' }}>
    {!state.isMobile && <aside className="deportivo-sidebar"><div className="deportivo-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}><ClubEscudo size={48} /><strong>Club Atlético Modelo</strong></div><div className="deportivo-nav">{nav.map((item) => <button key={item.screen} onClick={() => actions.navigate(item.screen)} className={state.screen === item.screen ? 'active' : ''}><SportsNavIcon screen={item.screen} />{item.label}</button>)}<button onClick={toggleStatistics} className={state.screen === 'estadisticas' ? 'active statistics-parent' : 'statistics-parent'} aria-expanded={statisticsOpen}><SportsNavIcon screen="estadisticas" /><span>Estadísticas</span><b aria-hidden="true">{statisticsOpen ? '−' : '+'}</b></button>{statisticsOpen && <div className="deportivo-statistics-children">{statisticsViews.map((item) => <button key={item.view} onClick={() => selectStatistics(item.view)} className={state.screen === 'estadisticas' && state.estadisticasVista === item.view ? 'active' : ''}>{item.label}</button>)}</div>}</div><SportsSquadSwitcher variant="sidebar" /><button className="deportivo-switch" onClick={actions.showModuleSelector}>Cambiar módulo</button></aside>}
    <div style={{ flex: 1, minWidth: 0 }}>
      {state.isMobile && <><ModuleSwitcher color="#087f75" /><SportsSquadSwitcher variant="mobile" /></>}
      {state.isMobile && <nav className="deportivo-mobile-nav">{nav.map((item) => <button key={item.screen} onClick={() => actions.navigate(item.screen)} className={state.screen === item.screen ? 'active' : ''}>{item.label}</button>)}<button onClick={toggleStatistics} className={state.screen === 'estadisticas' ? 'active statistics-parent' : 'statistics-parent'} aria-expanded={statisticsOpen}>Estadísticas {statisticsOpen ? '−' : '+'}</button>{statisticsOpen && statisticsViews.map((item) => <button key={item.view} onClick={() => selectStatistics(item.view)} className={state.screen === 'estadisticas' && state.estadisticasVista === item.view ? 'active' : ''}>{item.label}</button>)}</nav>}
      <main className="deportivo-main"><ScreenContent /></main>
    </div>
    <SportsAssistant /><VerPartidoModal /><AgregarPartidoModal /><JugadorModal /><EquipoDeportivoModal /><Toast />
  </div>;
}

function PortalLayout() {
  const { state, actions } = useApp();
  const esSocio = state.portalRol === 'socio';
  return <div className="portal-stage">
    <button className="portal-module-switch" onClick={actions.showModuleSelector}>Cambiar módulo</button>
    {state.portalLoggedIn && (
      <button
        className="portal-module-switch"
        style={{ left: 24, right: 'auto' }}
        onClick={() => actions.setPortalRol(esSocio ? 'hincha' : 'socio')}
      >
        Viendo como {esSocio ? 'socio' : 'hincha'} · Cambiar
      </button>
    )}
    <ScreenContent /><Toast />
  </div>;
}

function AdministrativeModals() { return <><VerPartidoModal /><AgregarPartidoModal /><InfoCanchasModal /><AjustarPreciosCanchasModal /><ReservaModal /><MediosPagoModal /><ModificarProductoBuffetModal /><ModificarProductoShopModal /><NuevoProductoBuffetModal /><NuevoProductoShopModal /><DifundirTorneoModal /><SocioModal /><ImportarSociosModal /><SponsorModal /></>; }

function Shell() {
  const { state } = useApp();
  if (!state.activeModule) return <ModuleSelector />;
  if (state.activeModule === 'deportivo') return <DeportivoLayout />;
  if (state.activeModule === 'socio') return <PortalLayout />;
  return <AdministrativeLayout />;
}

export default function App() { return <AppProvider><Shell /><Analytics /><SpeedInsights /></AppProvider>; }
