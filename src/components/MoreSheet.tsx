import { useApp } from '../state/AppContext';
import type { Screen } from '../types';

const itemStyle = {
  padding: '14px 10px',
  fontSize: 15,
  fontWeight: 600 as const,
  color: '#16203a',
  borderBottom: '1px solid #f0f1f5',
};

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
        <div style={itemStyle} onClick={go('reportes')}>Reportes financieros</div>
        <div style={itemStyle} onClick={go('egresos')}>Egresos</div>
        <div style={itemStyle} onClick={go('comunicados')}>Comunicados</div>
        <div style={itemStyle} onClick={go('ventas')}>Ventas del shop</div>
        <div style={itemStyle} onClick={go('buffet')}>Buffet</div>
        <div style={itemStyle} onClick={go('canchas')}>Reserva de canchas</div>
        <div style={itemStyle} onClick={go('calendario')}>Calendario deportivo</div>
        <div style={itemStyle} onClick={go('config')}>Configuración del club</div>
        <div style={{ padding: '14px 10px', fontSize: 15, fontWeight: 600, color: '#c1293c' }} onClick={actions.onLogout}>
          Cerrar sesión
        </div>
      </div>
    </div>
  );
}
