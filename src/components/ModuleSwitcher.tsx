import { useApp } from '../state/AppContext';
import ClubEscudo from './ClubEscudo';
import ExitInicioButton from './ExitInicioButton';
import { MODULE_LABELS } from '../lib/modulos';
import type { Modulo } from '../types';

export default function ModuleSwitcher({ color = '#172a54' }: { color?: string }) {
  const { state } = useApp();
  const current = state.activeModule as Modulo;
  return (
    <div className="module-switcher" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 18px', background: color, color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ClubEscudo size={32} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Club Atlético Modelo</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.72)', marginTop: 2 }}>{current ? MODULE_LABELS[current] : ''}</div>
          </div>
        </div>
        <ExitInicioButton />
      </div>
    </div>
  );
}
