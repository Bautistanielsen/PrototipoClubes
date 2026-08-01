import { useMemo } from 'react';
import { useApp } from '../state/AppContext';

export default function Config() {
  const { state, actions } = useApp();

  const countDebito = useMemo(() => state.socios.filter((x) => x.debitoAutomatico).length, [state.socios]);
  const pctDebito = useMemo(() => Math.round((countDebito / state.socios.length) * 100), [countDebito, state.socios.length]);

  const inputStyle = { width: '100%', height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#16203a' };

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Configuración del club</div>
        <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>Datos generales y cuotas</div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 14 }}>Datos del club</div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#16203a', marginBottom: 6 }}>Nombre del club</label>
            <input value={state.clubNombre} onChange={(e) => actions.setClubNombre(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#16203a', marginBottom: 6 }}>Dirección</label>
            <input value={state.clubDireccion} onChange={(e) => actions.setClubDireccion(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#16203a', marginBottom: 6 }}>Día de vencimiento</label>
            <input value={state.diaVencimiento} onChange={(e) => actions.setDiaVencimiento(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a' }}>Cobro automático con tarjeta de crédito</div>
          <button
            onClick={actions.toggleDebitoAutomatico}
            style={{
              height: 36,
              padding: '0 14px',
              borderRadius: 20,
              border: 'none',
              background: state.debitoAutomaticoHabilitado ? '#e5f6ea' : '#fbe6e9',
              color: state.debitoAutomaticoHabilitado ? '#1a7d43' : '#c1293c',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {state.debitoAutomaticoHabilitado ? 'Habilitado' : 'Deshabilitado'}
          </button>
        </div>
        <div style={{ fontSize: 13.5, color: '#6b7488', lineHeight: 1.5, marginBottom: 14 }}>
          El socio carga su tarjeta una sola vez y la cuota se cobra sola todos los meses en la fecha de vencimiento, sin que
          tengas que hacer nada. Así se mantienen al día automáticamente.
        </div>
        <div style={{ background: '#f5f7fb', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Socios con débito automático activo</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#16203a', marginTop: 4 }}>
            {countDebito} de {state.socios.length} <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7488' }}>({pctDebito}%)</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 14 }}>Categorías de cuota</div>
        {state.categorias.map((cat) => (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f1f5' }}>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#16203a' }}>{cat.nombre}</div>
            <input
              value={String(cat.monto)}
              onChange={(e) => {
                const v = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                actions.setCategoriaMonto(cat.id, v);
              }}
              style={{ width: 140, height: 40, border: '1px solid #e3e7ef', borderRadius: 8, padding: '0 12px', fontSize: 14, color: '#16203a', textAlign: 'right' }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={actions.guardarConfig}
        style={{ height: 48, padding: '0 24px', border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
      >
        Guardar cambios
      </button>
    </div>
  );
}
