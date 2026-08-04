import { useApp } from '../state/AppContext';
import type { Modulo } from '../types';

const labels: Record<Modulo, string> = {
  administrativo: 'Panel Administrativo',
  deportivo: 'Gestión Deportiva',
  socio: 'Portal del Socio',
};

export default function ModuleSwitcher({ color = '#172a54' }: { color?: string }) {
  const { state, actions } = useApp();
  return (
    <div className="module-switcher" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 18px', background: color, color: '#fff' }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 15 }}>Club Atlético Modelo</div>
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.72)', marginTop: 2 }}>{state.activeModule ? labels[state.activeModule] : ''}</div>
      </div>
      <button onClick={actions.showModuleSelector} style={{ border: '1px solid rgba(255,255,255,.34)', background: 'transparent', color: '#fff', borderRadius: 8, padding: '7px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
        Cambiar módulo
      </button>
    </div>
  );
}
