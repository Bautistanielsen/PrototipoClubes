import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { totalEgresos as sumEgresos, topEgreso } from '../lib/derive';
import { formatMoney } from '../lib/format';

const CATEGORIAS = ['Jugadores', 'Cuerpo técnico', 'Mantenimiento de predio', 'Servicios (luz, agua, gas)', 'Insumos y equipamiento', 'Otros'];

export default function Egresos() {
  const { state, actions } = useApp();
  const total = useMemo(() => sumEgresos(state.egresos), [state.egresos]);
  const top = useMemo(() => topEgreso(state.egresos), [state.egresos]);

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Egresos</div>
        <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>Gastos de mantenimiento, sueldos y servicios del club</div>
      </div>

      <div style={{ background: '#172a54', borderRadius: 14, padding: '20px 22px', marginBottom: 16, maxWidth: 280 }}>
        <div style={{ fontSize: 13, color: '#aeb8d6', fontWeight: 600 }}>Total de egresos — Julio 2026</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginTop: 6 }}>{formatMoney(total)}</div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 14 }}>Registrar egreso</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select
            value={state.nuevoEgresoCategoria}
            onChange={(e) => actions.setNuevoEgresoCategoria(e.target.value)}
            style={{ flex: 2, minWidth: 220, height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#16203a', background: '#fff' }}
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={state.nuevoEgresoMonto}
            onChange={(e) => actions.setNuevoEgresoMonto(e.target.value)}
            placeholder="Monto ($)"
            style={{ flex: 1, minWidth: 120, height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a' }}
          />
          <button
            onClick={actions.agregarEgreso}
            style={{ minWidth: 150, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Registrar egreso
          </button>
        </div>
      </div>

      {top && (
        <div style={{ background: '#fdf0dc', border: '1px solid #f3ddb3', borderRadius: 14, padding: '18px 22px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#a15c00', fontWeight: 700 }}>Mayor gasto del mes</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: '#16203a', marginTop: 4 }}>
            {top.categoria} — {top.montoLabel}
          </div>
          <div style={{ fontSize: 13, color: '#6b7488', marginTop: 2 }}>{top.pct}% del total de egresos del mes</div>
        </div>
      )}

      <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 10 }}>Detalle de egresos</div>
      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden' }}>
        {state.egresos.map((eg) => (
          <div key={eg.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f1f5', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a' }}>{eg.categoria}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a' }}>{formatMoney(eg.monto)}</div>
              <button
                onClick={() => actions.quitarEgreso(eg.id)}
                style={{ height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid #d7dce6', background: '#fff', color: '#c1293c', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
