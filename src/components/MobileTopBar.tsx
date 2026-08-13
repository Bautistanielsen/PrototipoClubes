import { useApp } from '../state/AppContext';

export default function MobileTopBar() {
  const { actions } = useApp();
  return (
    <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#172a54', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ color: '#8fa0cc', fontWeight: 800, fontSize: 9.5, letterSpacing: '.06em' }}>CLUBDESK</div>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Club Atlético Modelo</div>
      </div>
      <button onClick={actions.showModuleSelector} style={{ color: '#fff', fontSize: 11, border: '1px solid rgba(255,255,255,.25)', borderRadius: 20, padding: '5px 10px', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}>Módulos</button>
    </div>
  );
}
