import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { totalEgresos as sumEgresos, egresosPorCategoria, topEgreso } from '../lib/derive';
import { formatMoney } from '../lib/format';
import { exportToCSV } from '../lib/export';
import { CATEGORIA_META, MEDIO_META } from '../lib/movimientoMeta';
import MetaRow from '../components/MetaRow';

const CATEGORIAS = ['Jugadores', 'Cuerpo técnico', 'Mantenimiento de predio', 'Servicios (luz, agua, gas)', 'Insumos y equipamiento', 'Otros'];

const inputStyle = { height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#16203a', background: '#fff' };

const filterChipStyle = (active: boolean) => ({
  height: 36,
  padding: '0 14px',
  borderRadius: 20,
  border: `1px solid ${active ? '#172a54' : '#e3e7ef'}`,
  background: active ? '#172a54' : '#fff',
  color: active ? '#fff' : '#16203a',
  fontSize: 12.5,
  fontWeight: 600 as const,
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
});

const statCard = { flex: 1, minWidth: 170, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '18px 20px' };

export default function Egresos() {
  const { state, actions } = useApp();
  const total = useMemo(() => sumEgresos(state.egresos), [state.egresos]);
  const top = useMemo(() => topEgreso(state.egresos), [state.egresos]);
  const porCategoria = useMemo(() => egresosPorCategoria(state.egresos), [state.egresos]);
  const cantidad = state.egresos.length;
  const promedio = cantidad ? Math.round(total / cantidad) : 0;

  const categoriasPresentes = useMemo(
    () => Array.from(new Set(state.egresos.map((e) => e.categoria))),
    [state.egresos]
  );

  const movimientos = useMemo(
    () =>
      [...state.egresos]
        .filter((e) => state.egresoFiltroCategoria === 'todas' || e.categoria === state.egresoFiltroCategoria)
        .sort((a, b) => b.id - a.id),
    [state.egresos, state.egresoFiltroCategoria]
  );

  const exportar = () => {
    exportToCSV(
      'egresos.csv',
      ['Categoría', 'Concepto', 'Monto', 'Medio de pago', 'Fecha/hora'],
      [...state.egresos].sort((a, b) => b.id - a.id).map((e) => [e.categoria, e.detalle || '', e.monto, e.medioPago, e.hora])
    );
  };

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Egresos</div>
          <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>Gastos de mantenimiento, sueldos y servicios del club</div>
        </div>
        <button
          onClick={exportar}
          style={{ height: 42, padding: '0 18px', border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Exportar Excel
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ ...statCard, background: '#172a54', border: 'none' }}>
          <div style={{ fontSize: 13, color: '#aeb8d6', fontWeight: 600 }}>Total de egresos — Julio 2026</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginTop: 6 }}>{formatMoney(total)}</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Movimientos registrados</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{cantidad}</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Promedio por movimiento</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{formatMoney(promedio)}</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 14 }}>Registrar egreso</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <select
            value={state.nuevoEgresoCategoria}
            onChange={(e) => actions.setNuevoEgresoCategoria(e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: 200 }}
            aria-label="Categoría del egreso"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={state.nuevoEgresoDetalle}
            onChange={(e) => actions.setNuevoEgresoDetalle(e.target.value)}
            placeholder="Concepto (opcional)"
            style={{ ...inputStyle, flex: 2, minWidth: 220 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            inputMode="numeric"
            value={state.nuevoEgresoMonto}
            onChange={(e) => actions.setNuevoEgresoMonto(e.target.value)}
            placeholder="Monto ($)"
            style={{ ...inputStyle, flex: 1, minWidth: 120 }}
          />
          <select
            value={state.nuevoEgresoMedioPago}
            onChange={(e) => actions.setNuevoEgresoMedioPago(e.target.value as any)}
            style={{ ...inputStyle, flex: 1, minWidth: 160 }}
            aria-label="Medio de pago del egreso"
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="MercadoPago">MercadoPago</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
          <button
            onClick={actions.agregarEgreso}
            style={{ minWidth: 170, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
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

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 4 }}>Por categoría</div>
        <div>
          {porCategoria.map((eg, i) => (
            <MetaRow
              key={eg.categoria}
              meta={CATEGORIA_META[eg.categoria] ?? CATEGORIA_META.Otros}
              label={eg.categoria}
              monto={eg.monto}
              pct={eg.pct}
              detalle=""
              ultima={i === porCategoria.length - 1}
            />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a' }}>Movimientos</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => actions.setEgresoFiltroCategoria('todas')} style={filterChipStyle(state.egresoFiltroCategoria === 'todas')}>
            Todas
          </button>
          {categoriasPresentes.map((c) => (
            <button key={c} onClick={() => actions.setEgresoFiltroCategoria(c)} style={filterChipStyle(state.egresoFiltroCategoria === c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {movimientos.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #d7dce6', borderRadius: 14, padding: '40px 24px', textAlign: 'center', fontSize: 13.5, color: '#6b7488' }}>
          No hay movimientos para ese filtro.
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden' }}>
          {movimientos.map((eg) => {
            const meta = CATEGORIA_META[eg.categoria] ?? CATEGORIA_META.Otros;
            const medioMeta = MEDIO_META[eg.medioPago];
            return (
              <div key={eg.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f1f5', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {meta.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a' }}>{eg.categoria}</div>
                    <div style={{ fontSize: 12, color: '#8b93a5', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                      {eg.detalle ? eg.detalle + ' · ' : ''}
                      {medioMeta && <span style={{ width: 7, height: 7, borderRadius: '50%', background: medioMeta.color, display: 'inline-block', flexShrink: 0 }} />}
                      {eg.medioPago} · {eg.hora}
                    </div>
                  </div>
                </div>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
