import { AppProvider, useApp } from './state/AppContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import MobileTopBar from './components/MobileTopBar';
import MobileBottomNav from './components/MobileBottomNav';
import MoreSheet from './components/MoreSheet';
import Toast from './components/Toast';
import MediosPagoModal from './components/modals/MediosPagoModal';
import InfoCanchasModal from './components/modals/InfoCanchasModal';
import VerPartidoModal from './components/modals/VerPartidoModal';
import AgregarPartidoModal from './components/modals/AgregarPartidoModal';
import ReservaModal from './components/modals/ReservaModal';
import Dashboard from './screens/Dashboard';
import Socios from './screens/Socios';
import Cobranza from './screens/Cobranza';
import Ventas from './screens/Ventas';
import Buffet from './screens/Buffet';
import Canchas from './screens/Canchas';
import Calendario from './screens/Calendario';
import Reportes from './screens/Reportes';
import Egresos from './screens/Egresos';
import Comunicados from './screens/Comunicados';
import Config from './screens/Config';

function ScreenContent() {
  const { state } = useApp();
  switch (state.screen) {
    case 'dashboard':
      return <Dashboard />;
    case 'socios':
      return <Socios />;
    case 'cobranza':
      return <Cobranza />;
    case 'ventas':
      return <Ventas />;
    case 'buffet':
      return <Buffet />;
    case 'canchas':
      return <Canchas />;
    case 'calendario':
      return <Calendario />;
    case 'reportes':
      return <Reportes />;
    case 'egresos':
      return <Egresos />;
    case 'comunicados':
      return <Comunicados />;
    case 'config':
      return <Config />;
    default:
      return null;
  }
}

function MainLayout() {
  const { state } = useApp();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f7fb' }}>
      {!state.isMobile && <Sidebar />}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {state.isMobile && <MobileTopBar />}

        <div
          style={{
            flex: 1,
            padding: state.isMobile ? '18px 16px' : '32px 32px',
            paddingBottom: state.isMobile ? 84 : 32,
            maxWidth: 1180,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <ScreenContent />
        </div>

        {state.isMobile && <MobileBottomNav />}
      </div>

      <MoreSheet />
      <VerPartidoModal />
      <AgregarPartidoModal />
      <InfoCanchasModal />
      <ReservaModal />
      <MediosPagoModal />
      <Toast />
    </div>
  );
}

function Shell() {
  const { state } = useApp();
  return state.loggedIn ? <MainLayout /> : <Login />;
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
