import { useApp } from '../state/AppContext';
import { NavIcon } from './Sidebar';
import type { Screen } from '../types';

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '14px 10px',
  fontSize: 15,
  fontWeight: 600 as const,
  color: '#16203a',
  borderBottom: '1px solid #f0f1f5',
};

const iconBadge = {
  width: 32,
  height: 32,
  borderRadius: 8,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#eaeefb',
  color: '#172a54',
};

const items: Array<{ screen: Screen; label: string }> = [
  { screen: 'reportes', label: 'Resumen financiero' },
  { screen: 'egresos', label: 'Egresos' },
  { screen: 'sponsors', label: 'Sponsors' },
  { screen: 'comunicados', label: 'Comunicaciones' },
  { screen: 'ventas', label: 'Tienda del club' },
  { screen: 'buffet', label: 'Buffet' },
  { screen: 'canchas', label: 'Reservas' },
  { screen: 'torneos', label: 'Torneos' },
  { screen: 'config', label: 'Configuración del club' },
];

export default function MoreSheet() {
  const { state, actions } = useApp();
  if (!state.moreOpen) return null;

  const go = (s: Screen) => () => actions.navigate(s);

  return (
    <div
      onClick={actions.closeMore}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(16,20,35,0.4)',
        zIndex: 30,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={actions.stopClick}
        style={{
          width: '100%',
          background: '#fff',
          borderRadius: '18px 18px 0 0',
          padding: '20px 16px calc(20px + env(safe-area-inset-bottom))',
          animation: 'fadeIn .2s ease',
        }}
      >
        <div style={{ width: 36, height: 4, background: '#e3e7ef', borderRadius: 4, margin: '0 auto 18px' }}></div>
        {items.map((item) => (
          <div key={item.screen} style={itemStyle} onClick={go(item.screen)}>
            <div style={iconBadge}><NavIcon screen={item.screen} /></div>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
