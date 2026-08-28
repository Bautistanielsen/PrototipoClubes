import { useApp } from '../state/AppContext';
import ClubEscudo from './ClubEscudo';
import ModuleQuickNav from './ModuleQuickNav';
import { MODULE_LABELS } from '../lib/modulos';
import type { Modulo } from '../types';

export default function ModuleSwitcher({ color = '#172a54' }: { color?: string }) {
  const { state } = useApp();
  const current = state.activeModule as Modulo;
  return (
    <div className="module-switcher" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 18px', background: color, color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ClubEscudo size={32} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Club Atlético Modelo</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.72)', marginTop: 2 }}>{current ? MODULE_LABELS[current] : ''}</div>
        </div>
      </div>
      <ModuleQuickNav
        current={current}
        direction="row"
        gap={7}
        wrapperStyle={{ marginTop: 4, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.18)' }}
        buttonStyle={{ border: '1px solid rgba(255,255,255,.4)', background: 'rgba(255,255,255,.1)', color: '#fff', borderRadius: 14, padding: '7px 4px', fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}
        homeStyle={{ border: '1px solid #fff', background: '#fff', color, borderRadius: 14, padding: '7px 4px', fontSize: 10.5, fontWeight: 800, cursor: 'pointer' }}
      />
    </div>
  );
}
