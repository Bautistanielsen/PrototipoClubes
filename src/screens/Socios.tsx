import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { estadoMeta } from '../lib/derive';
import { formatMoney } from '../lib/format';
import type { EstadoFilter } from '../types';

const filterBtnStyle = (active: boolean) => ({
  height: 46,
  padding: '0 16px',
  borderRadius: 9,
  border: `1px solid ${active ? '#172a54' : '#e3e7ef'}`,
  background: active ? '#172a54' : '#fff',
  color: active ? '#fff' : '#16203a',
  fontSize: 13.5,
  fontWeight: 600 as const,
  cursor: 'pointer',
});

export default function Socios() {
  const { state, actions } = useApp();

  const filteredSocios = useMemo(() => {
    const q = state.searchQuery.trim().toLowerCase();
    return state.socios
      .filter((x) => state.estadoFilter === 'todos' || x.estado === state.estadoFilter)
      .filter((x) => !q || (x.nombre + ' ' + x.apellido).toLowerCase().includes(q) || String(x.numero).includes(q));
  }, [state.socios, state.estadoFilter, state.searchQuery]);

  const filters: { key: EstadoFilter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'al_dia', label: 'Al día' },
    { key: 'por_vencer', label: 'Por vencer' },
    { key: 'moroso', label: 'Moroso' },
  ];

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Padrón de socios</div>
          <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>
            {filteredSocios.length} de {state.socios.length} socios
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          value={state.searchQuery}
          onChange={(e) => actions.setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre o número de socio..."
          style={{ flex: 2, minWidth: 220, height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, outline: 'none', background: '#fff', color: '#16203a' }}
        />
        <div style={{ flex: 3, minWidth: 260, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <button key={f.key} onClick={() => actions.setFilter(f.key)} style={filterBtnStyle(state.estadoFilter === f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filteredSocios.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #d7dce6', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #cfd5e2', margin: '0 auto 14px' }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a' }}>No encontramos socios con ese criterio</div>
          <div style={{ fontSize: 13.5, color: '#6b7488', marginTop: 4 }}>Probá con otro nombre, número, o cambiá el filtro de estado.</div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden' }}>
          {filteredSocios.map((s) => {
            const meta = estadoMeta[s.estado];
            const esMoroso = s.estado === 'moroso';
            const rec = state.recordatorios[s.id] || 'pendiente';
            return (
              <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 20px', borderBottom: '1px solid #f0f1f5' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 200 }}>
                    <div style={{ fontSize: 12, color: '#9aa2b1', fontWeight: 600, width: 36 }}>#{s.numero}</div>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: '#16203a' }}>
                        {s.nombre} {s.apellido}
                      </div>
                      <div style={{ fontSize: 12, color: '#8b93a5', marginTop: 1 }}>Último pago: {s.ultimoPago}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {esMoroso && <div style={{ fontSize: 13.5, fontWeight: 700, color: '#c1293c' }}>{formatMoney(s.deuda)}</div>}
                    {s.debitoAutomatico && (
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: '#1b3a8a', background: '#eaeefb', padding: '5px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                        Tarjeta automática
                      </div>
                    )}
                    <div style={{ fontSize: 12.5, fontWeight: 700, padding: '6px 12px', borderRadius: 20, background: meta.bg, color: meta.color, whiteSpace: 'nowrap' }}>
                      {meta.label}
                    </div>
                  </div>
                </div>
                {esMoroso && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: '#fbf7f2', borderRadius: 10, padding: '10px 14px' }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '5px 12px',
                        borderRadius: 20,
                        background: rec === 'enviado' ? '#e5f6ea' : '#fdf0dc',
                        color: rec === 'enviado' ? '#1a7d43' : '#a15c00',
                      }}
                    >
                      {rec === 'enviado' ? 'Recordatorio enviado' : 'Pendiente de envío'}
                    </div>
                    <button
                      onClick={() => actions.toggleRecordatorio(s.id)}
                      style={{ height: 36, padding: '0 14px', borderRadius: 8, border: '1px solid #d7dce6', background: '#fff', color: '#16203a', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                    >
                      {rec === 'enviado' ? 'Marcar pendiente' : 'Marcar enviado'}
                    </button>
                    <button
                      onClick={() => actions.cobrarMoroso(s.id)}
                      style={{ height: 36, padding: '0 14px', borderRadius: 8, border: 'none', background: '#172a54', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Registrar cobro
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
