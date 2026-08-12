import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { cuotasResumen, estadoMeta } from '../lib/derive';
import { formatMoney } from '../lib/format';
import { MEDIO_META } from '../lib/movimientoMeta';
import MetaRow from '../components/MetaRow';
import type { MedioPago } from '../types';

const selectStyle = { flex: 1, minWidth: 150, height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', background: '#fff' };
const iconCommon = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const MEDIOS: MedioPago[] = ['Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'];

const ESTADO_ICON: Record<string, React.ReactNode> = {
  al_dia: <svg {...iconCommon}><path d="M20 6 9 17l-5-5" /></svg>,
  por_vencer: <svg {...iconCommon}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>,
  moroso: <svg {...iconCommon}><path d="M12 9v4M12 17h.01" /><path d="m10.3 3.9-8 14A1.7 1.7 0 0 0 3.7 20.5h16.6a1.7 1.7 0 0 0 1.4-2.6l-8-14a1.7 1.7 0 0 0-2.9 0Z" /></svg>,
};

export default function Cobranza() {
  const { state, actions } = useApp();
  const resumen = useMemo(() => cuotasResumen(state.socios, state.categorias), [state.socios, state.categorias]);
  const totalCaja = useMemo(() => state.pagosHoy.reduce((a, p) => a + p.monto, 0), [state.pagosHoy]);
  const totalesPorMedio = useMemo(
    () => MEDIOS.map((medio) => ({ medio, total: state.pagosHoy.filter((p) => p.medio === medio).reduce((a, p) => a + p.monto, 0) })).filter((m) => m.total > 0),
    [state.pagosHoy]
  );

  const sociosOrdenados = useMemo(() => {
    const prioridad = { moroso: 0, por_vencer: 1, al_dia: 2 };
    return [...state.socios].sort((a, b) => prioridad[a.estado] - prioridad[b.estado] || a.nombre.localeCompare(b.nombre));
  }, [state.socios]);

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
        {totalesPorMedio.length === 0 ? (
          <div style={{ flex: 2, minWidth: 220, background: '#fff', border: '1px dashed #d7dce6', borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', color: '#8b93a5', fontSize: 13.5 }}>
            Todavía no hay pagos registrados hoy.
          </div>
        ) : (
          totalesPorMedio.map((m) => (
            <div key={m.medio} style={{ flex: 1, minWidth: 180, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>{m.medio}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{formatMoney(m.total)}</div>
            </div>
          ))
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 14 }}>Registrar nuevo pago</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select value={state.nuevoPagoSocioId} onChange={(e) => actions.setNuevoPagoSocioId(e.target.value)} style={{ ...selectStyle, flex: 2 }}>
            <option value="">Seleccionar socio...</option>
            {sociosOrdenados.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} {s.apellido} (#{s.numero}) — {estadoMeta[s.estado].label}{s.estado === 'moroso' ? ` · ${formatMoney(s.deuda)}` : ''}
              </option>
            ))}
          </select>
          <select value={state.nuevoPagoMedio} onChange={(e) => actions.setNuevoPagoMedio(e.target.value as any)} style={selectStyle}>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="MercadoPago">MercadoPago</option>
            <option value="Tarjeta">Tarjeta</option>
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
        <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {state.pagosHoy.map((p) => {
            const medioMeta = MEDIO_META[p.medio];
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f1f5', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a' }}>{p.nombre}</div>
                  <div style={{ fontSize: 12, color: '#8b93a5', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                    {medioMeta && <span style={{ width: 7, height: 7, borderRadius: '50%', background: medioMeta.color, display: 'inline-block', flexShrink: 0 }} />}
                    {p.medio} · {p.hora}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1a7d43' }}>{formatMoney(p.monto)}</div>
                  <button
                    onClick={() => actions.quitarPago(p.id)}
                    style={{ height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid #d7dce6', background: '#fff', color: '#c1293c', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) as any}

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: 22, marginTop: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 4 }}>Julio 2026 por estado de cuota</div>
        <div>
          <MetaRow
            meta={{ color: estadoMeta.al_dia.color, bg: estadoMeta.al_dia.bg, icon: ESTADO_ICON.al_dia }}
            label="Cobrado"
            monto={resumen.recaudadoMes}
            pct={resumen.pctRecaudado}
            detalle={`${resumen.countAlDia} socios al día`}
          />
          <MetaRow
            meta={{ color: estadoMeta.por_vencer.color, bg: estadoMeta.por_vencer.bg, icon: ESTADO_ICON.por_vencer }}
            label="Por vencer"
            monto={resumen.porVencerMonto}
            pct={resumen.pctPorVencer}
            detalle={`${resumen.countPorVencer} socios`}
          />
          <MetaRow
            meta={{ color: estadoMeta.moroso.color, bg: estadoMeta.moroso.bg, icon: ESTADO_ICON.moroso }}
            label="Moroso"
            monto={resumen.deudaTotal}
            pct={resumen.pctMoroso}
            detalle={`${resumen.countMoroso} socios`}
            ultima
          />
        </div>
      </div>
    </div>
  );
}
