import { AppProvider, useApp } from './state/AppContext';
import Sidebar from './components/Sidebar';
import MobileTopBar from './components/MobileTopBar';
import MobileBottomNav from './components/MobileBottomNav';
import MoreSheet from './components/MoreSheet';
import Toast from './components/Toast';
import ModuleSelector from './components/ModuleSelector';
import ModuleSwitcher from './components/ModuleSwitcher';
import MediosPagoModal from './components/modals/MediosPagoModal';
import InfoCanchasModal from './components/modals/InfoCanchasModal';
import VerPartidoModal from './components/modals/VerPartidoModal';
import AgregarPartidoModal from './components/modals/AgregarPartidoModal';
import ReservaModal from './components/modals/ReservaModal';
import JugadorModal from './components/modals/JugadorModal';
import EquipoDeportivoModal from './components/modals/EquipoDeportivoModal';
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
import Comunicados from './screens/Comunicados';
import Config from './screens/Config';
import DeportivoInicio from './screens/DeportivoInicio';
import Equipos from './screens/Equipos';
import Formaciones from './screens/Formaciones';
import PortalSocio from './screens/PortalSocio';

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
    case 'reportes': return <Reportes />;
    case 'egresos': return <Egresos />;
    case 'comunicados': return <Comunicados />;
    case 'config': return <Config />;
    case 'deportivo_inicio': return <DeportivoInicio />;
    case 'equipos': return <Equipos />;
    case 'formaciones': return <Formaciones />;
    case 'portal_inicio': case 'portal_cuota': case 'portal_reservas': case 'portal_mas': case 'portal_novedades': case 'portal_perfil': return <PortalSocio />;
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
    <MoreSheet /><AdministrativeModals /><Toast />
  </div>;
}

function SportsNavIcon({ screen }: { screen: 'deportivo_inicio' | 'equipos' | 'formaciones' | 'calendario' }) {
  const common = { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (screen === 'deportivo_inicio') {
    return <svg {...common}><path d="M4 19V9l8-5 8 5v10" /><path d="M8 19v-5h8v5M3 19h18" /><circle cx="12" cy="9" r="2" /></svg>;
  }
  if (screen === 'equipos') {
    return <svg {...common}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9.5" r="2.2" /><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6M15.5 14.5c2.7.3 4.5 2.3 4.5 5" /><path d="m8 4 1-2 1 2" /></svg>;
  }
  if (screen === 'formaciones') {
    return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /><circle cx="17" cy="16" r="2" /></svg>;
  }
  return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /><path d="m9 15 2 2 4-4" /></svg>;
}

function DeportivoLayout() {
  const { state, actions } = useApp();
  const nav = [{ screen: 'deportivo_inicio' as const, label: 'Inicio deportivo' }, { screen: 'equipos' as const, label: 'Planteles' }, { screen: 'formaciones' as const, label: 'Formaciones' }, { screen: 'calendario' as const, label: 'Agenda deportiva' }];
  return <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f7fb' }}>
    {!state.isMobile && <aside className="deportivo-sidebar"><div className="deportivo-brand"><strong>Club Atlético Modelo</strong><span>Gestión Deportiva</span></div><div className="deportivo-nav">{nav.map((item) => <button key={item.screen} onClick={() => actions.navigate(item.screen)} className={state.screen === item.screen ? 'active' : ''}><SportsNavIcon screen={item.screen} />{item.label}</button>)}</div><button className="deportivo-switch" onClick={actions.showModuleSelector}>Cambiar módulo</button></aside>}
    <div style={{ flex: 1, minWidth: 0 }}>
      {state.isMobile && <ModuleSwitcher color="#087f75" />}
      {state.isMobile && <nav className="deportivo-mobile-nav">{nav.map((item) => <button key={item.screen} onClick={() => actions.navigate(item.screen)} className={state.screen === item.screen ? 'active' : ''}>{item.label}</button>)}</nav>}
      <main className="deportivo-main"><ScreenContent /></main>
    </div>
    <VerPartidoModal /><AgregarPartidoModal /><JugadorModal /><EquipoDeportivoModal /><Toast />
  </div>;
}

function PortalLayout() {
  const { actions } = useApp();
  return <div className="portal-stage"><button className="portal-module-switch" onClick={actions.showModuleSelector}>Cambiar módulo</button><ScreenContent /><Toast /></div>;
}

function AdministrativeModals() { return <><VerPartidoModal /><AgregarPartidoModal /><InfoCanchasModal /><ReservaModal /><MediosPagoModal /></>; }

function Shell() {
  const { state } = useApp();
  if (!state.activeModule) return <ModuleSelector />;
  if (state.activeModule === 'deportivo') return <DeportivoLayout />;
  if (state.activeModule === 'socio') return <PortalLayout />;
  return <AdministrativeLayout />;
}

export default function App() { return <AppProvider><Shell /></AppProvider>; }
