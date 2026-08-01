import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { cuotasResumen } from '../lib/derive';
import { formatMoney } from '../lib/format';

const selectStyle = { flex: 1, minWidth: 150, height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', background: '#fff' };

export default function Cobranza() {
  const { state, actions } = useApp();
  const resumen = useMemo(() => cuotasResumen(state.socios), [state.socios]);
  const totalCaja = useMemo(() => state.pagosHoy.reduce((a, p) => a + p.monto, 0), [state.pagosHoy]);

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Cobranza y cierre de caja</div>
          <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>29 de julio de 2026</div>
        </div>
        <button
          onClick={actions.openMediosPago}
          style={{ height: 44, padding: '0 16px', borderRadius: 9, border: '1px solid #d7dce6', background: '#fff', color: '#16203a', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          ¿Cómo pueden pagar los socios?
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 180, background: '#172a54', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, color: '#aeb8d6', fontWeight: 600 }}>Total del día</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginTop: 6 }}>{formatMoney(totalCaja)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 180, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Pagos registrados</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{state.pagosHoy.length}</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 14 }}>Registrar nuevo pago</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select value={state.nuevoPagoSocioId} onChange={(e) => actions.setNuevoPagoSocioId(e.target.value)} style={{ ...selectStyle, flex: 2 }}>
            <option value="">Seleccionar socio...</option>
            {state.socios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} {s.apellido} (#{s.numero})
              </option>
            ))}
          </select>
          <select value={state.nuevoPagoMedio} onChange={(e) => actions.setNuevoPagoMedio(e.target.value as any)} style={selectStyle}>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </select>
          <button
            onClick={actions.registrarPago}
            style={{ minWidth: 170, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Marcar cuota pagada
          </button>
        </div>
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 10 }}>Pagos de hoy</div>
      {state.pagosHoy.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #d7dce6', borderRadius: 14, padding: '40px 24px', textAlign: 'center', fontSize: 13.5, color: '#6b7488' }}>
          Todavía no registraste pagos hoy.
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden' }}>
          {state.pagosHoy.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f1f5', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a' }}>{p.nombre}</div>
                <div style={{ fontSize: 12, color: '#8b93a5', marginTop: 2 }}>
                  {p.medio} · {p.hora}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a7d43' }}>{formatMoney(p.monto)}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: 22, marginTop: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 14 }}>Julio 2026 por estado de cuota</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6 }}>
              <span style={{ fontWeight: 600, color: '#1a7d43' }}>Cobrado</span>
              <span style={{ color: '#16203a', fontWeight: 700 }}>{formatMoney(resumen.recaudadoMes)}</span>
            </div>
            <div style={{ height: 10, background: '#eef0f5', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${resumen.pctRecaudado}%`, background: '#1a7d43' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6 }}>
              <span style={{ fontWeight: 600, color: '#a15c00' }}>Por vencer</span>
              <span style={{ color: '#16203a', fontWeight: 700 }}>{formatMoney(resumen.porVencerMonto)}</span>
            </div>
            <div style={{ height: 10, background: '#eef0f5', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${resumen.pctPorVencer}%`, background: '#d99000' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6 }}>
              <span style={{ fontWeight: 600, color: '#c1293c' }}>Moroso</span>
              <span style={{ color: '#16203a', fontWeight: 700 }}>{formatMoney(resumen.deudaTotal)}</span>
            </div>
            <div style={{ height: 10, background: '#eef0f5', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${resumen.pctMoroso}%`, background: '#c1293c' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
