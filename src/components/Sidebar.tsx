import { useApp } from '../state/AppContext';
import SidebarItem from './SidebarItem';
import ClubEscudo from './ClubEscudo';
import ModuleQuickNav from './ModuleQuickNav';
import type { Screen } from '../types';

function NavIcon({ screen }: { screen: Screen }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 };

  switch (screen) {
    case 'dashboard':
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
    case 'socios':
      return <svg {...common}><circle cx="9" cy="8" r="3.2" /><circle cx="17" cy="9.5" r="2.4" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M15.5 14.2c2.6.3 4.5 2.4 4.5 5.1" /></svg>;
    case 'cobranza':
      return <svg {...common}><rect x="3" y="6" width="18" height="13" rx="2" /><circle cx="12" cy="12.5" r="2.6" /><path d="M7 9.5h.01M17 15.5h.01" /></svg>;
    case 'reportes':
      return <svg {...common}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>;
    case 'egresos':
      return <svg {...common}><path d="M12 4v15M6 13l6 6 6-6" /><path d="M5 4h14" /></svg>;
    case 'sponsors':
      return <svg {...common}><path d="M12 3 4 6.5v5c0 4.5 3.2 7.9 8 9 4.8-1.1 8-4.5 8-9v-5L12 3Z" /><path d="m9 12 2 2 4-4" /></svg>;
    case 'buffet':
      return <svg {...common}><path d="M7 3v7M4 3v4a3 3 0 0 0 6 0V3M7 10v11M16 3v18M16 3c3 2 4 5 4 8h-4" /></svg>;
    case 'ventas':
      return <svg {...common}><path d="M4 8h16l-1 13H5L4 8Z" /><path d="M8 8a4 4 0 0 1 8 0" /></svg>;
    case 'torneos':
      return <svg {...common}><path d="M8 4h8v5a4 4 0 0 1-8 0V4z" /><path d="M8 5H5a3 3 0 0 0 3 5" /><path d="M16 5h3a3 3 0 0 1-3 5" /><line x1="12" y1="13" x2="12" y2="17" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="17" x2="12" y2="20" /></svg>;
    case 'canchas':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M12 5v14M3 12h5M16 12h5" /><circle cx="12" cy="12" r="2.5" /></svg>;
    case 'comunicados':
      return <svg {...common}><path d="M4 5h16v11H8l-4 4V5Z" /><path d="M8 9h8M8 12h5" /></svg>;
    case 'config':
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1-2.9 2.9-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21h-4v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1-2.9-2.9.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3v-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1 2.9-2.9.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1 2.9 2.9-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></svg>;
    default:
      return null;
  }
}

const groups: Array<{ title?: string; items: Array<{ screen: Screen; label: string }> }> = [
  { items: [{ screen: 'dashboard', label: 'Inicio' }] },
  { title: 'SOCIOS', items: [{ screen: 'socios', label: 'Padrón' }, { screen: 'cobranza', label: 'Cuotas y pagos' }] },
  { title: 'FINANZAS', items: [{ screen: 'reportes', label: 'Resumen financiero' }, { screen: 'egresos', label: 'Egresos' }, { screen: 'sponsors', label: 'Sponsors' }] },
  { title: 'VENTAS', items: [{ screen: 'buffet', label: 'Buffet' }, { screen: 'ventas', label: 'Tienda del club' }, { screen: 'torneos', label: 'Torneos' }] },
  { title: 'OPERACIÓN', items: [{ screen: 'canchas', label: 'Reservas' }, { screen: 'comunicados', label: 'Comunicaciones' }] },
  { title: 'SISTEMA', items: [{ screen: 'config', label: 'Configuración' }] },
];

export default function Sidebar() {
  const { state, actions } = useApp();
  return <aside className="no-print" style={{ width: 264, flexShrink: 0, background: '#172a54', display: 'flex', flexDirection: 'column', padding: '20px 16px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
    <div style={{ padding: '0 8px 20px', borderBottom: '1px solid rgba(255,255,255,.12)', marginBottom: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <ClubEscudo size={48} />
      <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>Club Atlético Modelo</div>
    </div>
    <div style={{ flex: 1 }}>{groups.map((group, index) => <div key={group.title || 'inicio'}>{group.title && <div style={{ color: '#7482ad', fontSize: 10.5, fontWeight: 800, letterSpacing: '.06em', padding: `${index === 1 ? 7 : 16}px 12px 6px` }}>{group.title}</div>}{group.items.map((item) => <SidebarItem key={item.screen} active={state.screen === item.screen} onClick={() => actions.navigate(item.screen)} icon={<NavIcon screen={item.screen} />} label={item.label} />)}</div>)}</div>
    <ModuleQuickNav
      current="administrativo"
      buttonStyle={{ border: '1px solid rgba(255,255,255,.18)', background: 'transparent', color: '#c3cbe4', borderRadius: 9, padding: '10px', cursor: 'pointer', fontWeight: 700, fontSize: 12, textAlign: 'left' }}
      homeStyle={{ border: '1px solid rgba(255,255,255,.34)', background: 'rgba(255,255,255,.08)', color: '#fff', borderRadius: 9, padding: '10px', cursor: 'pointer', fontWeight: 700, fontSize: 12, textAlign: 'left' }}
    />
  </aside>;
}
