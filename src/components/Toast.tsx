import { useApp } from '../state/AppContext';

export default function Toast() {
  const { state } = useApp();
  if (!state.toast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: state.isMobile ? '90px' : '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#16203a',
        color: '#fff',
        fontSize: 13.5,
        fontWeight: 600,
        padding: '12px 20px',
        borderRadius: 30,
        boxShadow: '0 10px 30px rgba(16,20,35,0.3)',
        zIndex: 40,
        animation: 'fadeIn .2s ease',
      }}
    >
      {state.toast}
    </div>
  );
}
