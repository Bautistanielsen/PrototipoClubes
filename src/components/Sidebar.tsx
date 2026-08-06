import { useApp } from '../state/AppContext';
import SidebarItem from './SidebarItem';
import type { Screen } from '../types';

const sectionLabelStyle = {
  fontSize: 10.5,
  fontWeight: 700 as const,
  letterSpacing: '0.06em',
  color: '#7482ad',
  padding: '16px 12px 6px',
};

export default function Sidebar() {
  const { state, actions } = useApp();
  const is = (s: Screen) => state.screen === s;

  return (
    <div
      className="no-print"
      style={{
        width: 264,
        flexShrink: 0,
        background: '#172a54',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: '0 8px 24px', borderBottom: '1px solid rgba(255,255,255,0.12)', marginBottom: 16 }}>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>Club Atlético Modelo</div>
        <div style={{ color: '#8fa0cc', fontSize: 12, marginTop: 2 }}>Panel de administración</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <SidebarItem
          active={is('dashboard')}
          onClick={() => actions.navigate('dashboard')}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
            </svg>
          }
          label="Resumen"
        />

        <div style={sectionLabelStyle}>SOCIOS</div>
        <SidebarItem
          active={is('socios')}
          onClick={() => actions.navigate('socios')}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="8" r="3.2"></circle>
              <circle cx="17" cy="9.5" r="2.4"></circle>
              <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"></path>
              <path d="M15.5 14.2c2.6.3 4.5 2.4 4.5 5.1"></path>
            </svg>
          }
          label="Padrón de socios"
        />
        <SidebarItem
          active={is('cobranza')}
          onClick={() => actions.navigate('cobranza')}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="6" width="18" height="13" rx="2"></rect>
              <circle cx="12" cy="12.5" r="2.6"></circle>
            </svg>
          }
          label="Cobranza"
        />

        <div style={sectionLabelStyle}>FINANZAS</div>
        <SidebarItem
          active={is('reportes')}
          onClick={() => actions.navigate('reportes')}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="19" x2="5" y2="11"></line>
              <line x1="12" y1="19" x2="12" y2="6"></line>
              <line x1="19" y1="19" x2="19" y2="14"></line>
            </svg>
          }
          label="Reportes"
        />
        <div
          onClick={actions.toggleIngresosMenu}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 12px',
            borderRadius: 9,
            cursor: 'pointer',
            background: 'transparent',
            color: '#c3cbe4',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="6 11 12 5 18 11"></polyline>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>Ingresos</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ transform: `rotate(${state.ingresosMenuOpen ? 180 : 0}deg)`, transition: 'transform .15s' }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        {state.ingresosMenuOpen && (
          <>
            <SidebarItem
              sub
              active={is('ventas')}
              onClick={() => actions.navigate('ventas')}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="8" width="14" height="12" rx="1.5"></rect>
                  <line x1="9" y1="8" x2="9" y2="5"></line>
                  <line x1="15" y1="8" x2="15" y2="5"></line>
                  <line x1="9" y1="5" x2="15" y2="5"></line>
                </svg>
              }
              label="Ventas del shop"
            />
            <SidebarItem
              sub
              active={is('buffet')}
              onClick={() => actions.navigate('buffet')}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="7" y1="4" x2="7" y2="20"></line>
                  <line x1="17" y1="4" x2="17" y2="20"></line>
                  <line x1="4" y1="9" x2="10" y2="9"></line>
                </svg>
              }
              label="Buffet"
            />
            <SidebarItem
              sub
              active={is('canchas')}
              onClick={() => actions.navigate('canchas')}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="14" rx="1.5"></rect>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                </svg>
              }
              label="Canchas"
            />
            <SidebarItem
              sub
              active={is('torneos')}
              onClick={() => actions.navigate('torneos')}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 4h8v5a4 4 0 0 1-8 0V4z"></path>
                  <path d="M8 5H5a3 3 0 0 0 3 5"></path>
                  <path d="M16 5h3a3 3 0 0 1-3 5"></path>
                  <line x1="12" y1="13" x2="12" y2="17"></line>
                  <line x1="9" y1="20" x2="15" y2="20"></line>
                  <line x1="12" y1="17" x2="12" y2="20"></line>
                </svg>
              }
              label="Torneos"
            />
          </>
        )}
        <SidebarItem
          active={is('egresos')}
          onClick={() => actions.navigate('egresos')}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="6 13 12 19 18 13"></polyline>
            </svg>
          }
          label="Egresos"
        />

        <div style={sectionLabelStyle}>ORGANIZACIÓN</div>
        <SidebarItem
          active={is('calendario')}
          onClick={() => actions.navigate('calendario')}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="17" rx="1.5"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="16" y1="2" x2="16" y2="6"></line>
            </svg>
          }
          label="Calendario deportivo"
        />
        <SidebarItem
          active={is('comunicados')}
          onClick={() => actions.navigate('comunicados')}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2"></rect>
              <line x1="3.5" y1="6" x2="12" y2="13" stroke="currentColor"></line>
              <line x1="20.5" y1="6" x2="12" y2="13" stroke="currentColor"></line>
            </svg>
          }
          label="Comunicados"
        />

        <div style={sectionLabelStyle}>SISTEMA</div>
        <SidebarItem
          active={is('config')}
          onClick={() => actions.navigate('config')}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3 13.09H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          }
          label="Configuración"
        />
      </div>

      <div
        onClick={actions.onLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 12px',
          borderRadius: 9,
          cursor: 'pointer',
          color: '#aeb8d6',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          marginTop: 8,
          paddingTop: 16,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#aeb8d6')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="9" height="16" rx="1.5"></rect>
          <line x1="20" y1="12" x2="11" y2="12"></line>
          <line x1="16" y1="8" x2="20" y2="12"></line>
          <line x1="16" y1="16" x2="20" y2="12"></line>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Cerrar sesión</span>
      </div>
    </div>
  );
}
