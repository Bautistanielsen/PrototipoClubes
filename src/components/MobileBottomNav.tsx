import { useApp } from '../state/AppContext';
import type { Screen } from '../types';

function NavIcon({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        padding: '6px 2px',
        minHeight: 52,
        justifyContent: 'center',
        color: active ? '#172a54' : '#9aa2b1',
      }}
    >
      {children}
    </div>
  );
}

export default function MobileBottomNav() {
  const { state, actions } = useApp();
  const is = (s: Screen) => state.screen === s;

  return (
    <div
      className="no-print"
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 20,
        background: '#fff',
        borderTop: '1px solid #e3e7ef',
        display: 'flex',
        padding: '6px 4px calc(6px + env(safe-area-inset-bottom))',
      }}
    >
      <div onClick={() => actions.navigate('dashboard')} style={{ flex: 1, cursor: 'pointer' }}>
        <NavIcon active={is('dashboard')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
          </svg>
          <span style={{ fontSize: 10.5, fontWeight: 600 }}>Resumen</span>
        </NavIcon>
      </div>
      <div onClick={() => actions.navigate('socios')} style={{ flex: 1, cursor: 'pointer' }}>
        <NavIcon active={is('socios')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="8" r="3.2"></circle>
            <circle cx="17" cy="9.5" r="2.4"></circle>
            <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"></path>
          </svg>
          <span style={{ fontSize: 10.5, fontWeight: 600 }}>Socios</span>
        </NavIcon>
      </div>
      <div onClick={() => actions.navigate('cobranza')} style={{ flex: 1, cursor: 'pointer' }}>
        <NavIcon active={is('cobranza')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="6" width="18" height="13" rx="2"></rect>
            <circle cx="12" cy="12.5" r="2.6"></circle>
          </svg>
          <span style={{ fontSize: 10.5, fontWeight: 600 }}>Cobranza</span>
        </NavIcon>
      </div>
      <div onClick={actions.toggleMore} style={{ flex: 1, cursor: 'pointer' }}>
        <NavIcon active={false}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"></circle>
            <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"></circle>
            <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"></circle>
          </svg>
          <span style={{ fontSize: 10.5, fontWeight: 600 }}>Más</span>
        </NavIcon>
      </div>
    </div>
  );
}
