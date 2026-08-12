import type { FilaMeta } from '../lib/movimientoMeta';
import { formatMoney } from '../lib/format';

export default function MetaRow({ meta, label, monto, pct, detalle, ultima }: { meta: FilaMeta; label: string; monto: number; pct: number; detalle: string; ultima?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: ultima ? 'none' : '1px solid #f0f1f5' }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {meta.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#16203a' }}>{label}</span>
          <span style={{ color: '#16203a', fontWeight: 800, fontSize: 14.5, whiteSpace: 'nowrap' }}>{formatMoney(monto)}</span>
        </div>
        <div style={{ height: 7, background: '#eef0f5', borderRadius: 6, overflow: 'hidden', marginBottom: 5 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: meta.color, borderRadius: 6 }} />
        </div>
        <div style={{ fontSize: 12, color: '#8b93a5' }}>
          {detalle ? detalle + ' · ' : ''}
          {pct}% del total
        </div>
      </div>
    </div>
  );
}
