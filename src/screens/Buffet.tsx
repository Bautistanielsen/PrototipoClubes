import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { formatMoney } from '../lib/format';

const selectStyle = { height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', background: '#fff' };

export default function Buffet() {
  const { state, actions } = useApp();

  const totalBuffet = useMemo(() => state.ventasBuffet.reduce((a, v) => a + v.precio, 0), [state.ventasBuffet]);
  const totalEfectivo = useMemo(() => state.ventasBuffet.filter((v) => v.medio === 'Efectivo').reduce((a, v) => a + v.precio, 0), [state.ventasBuffet]);
  const totalTransferencia = useMemo(() => state.ventasBuffet.filter((v) => v.medio === 'Transferencia').reduce((a, v) => a + v.precio, 0), [state.ventasBuffet]);
  const stockBajo = useMemo(() => state.productosBuffet.filter((p) => p.stock <= p.stockMin), [state.productosBuffet]);

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Buffet</div>
        <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>Ventas, precios y stock del buffet del club</div>
      </div>

      {stockBajo.length > 0 && (
        <div style={{ background: '#fdf0dc', border: '1px solid #f3ddb3', borderRadius: 14, padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#a15c00', marginBottom: 4 }}>Stock bajo</div>
          <div style={{ fontSize: 13, color: '#6b7488' }}>{stockBajo.map((p) => `${p.nombre} (${p.stock})`).join(', ')}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 180, background: '#172a54', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, color: '#aeb8d6', fontWeight: 600 }}>Total vendido hoy</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginTop: 6 }}>{formatMoney(totalBuffet)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 180, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Efectivo</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{formatMoney(totalEfectivo)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 180, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Transferencia</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{formatMoney(totalTransferencia)}</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 14 }}>Registrar venta</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select
            value={state.nuevaVentaBuffetProductoId}
            onChange={(e) => actions.setNuevaVentaBuffetProductoId(e.target.value)}
            style={{ ...selectStyle, flex: 2, minWidth: 200 }}
          >
            <option value="">Seleccionar producto...</option>
            {state.productosBuffet.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — {formatMoney(p.precioSocio)} socio / {formatMoney(p.precioNoSocio)} no socio
              </option>
            ))}
          </select>
          <select value={state.nuevaVentaBuffetTipo} onChange={(e) => actions.setNuevaVentaBuffetTipo(e.target.value as any)} style={{ ...selectStyle, flex: 1, minWidth: 140 }}>
            <option value="Socio">Socio</option>
            <option value="No socio">No socio</option>
          </select>
          <select value={state.nuevaVentaBuffetMedio} onChange={(e) => actions.setNuevaVentaBuffetMedio(e.target.value as any)} style={{ ...selectStyle, flex: 1, minWidth: 140 }}>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </select>
          <button
            onClick={actions.registrarVentaBuffet}
            style={{ minWidth: 150, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Registrar venta
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a' }}>Menú y stock</div>
        <button
          onClick={actions.openReponerStockBuffet}
          style={{ height: 42, padding: '0 20px', border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', boxShadow: '0 2px 8px rgba(23,42,84,0.25)' }}
        >
          + Reponer stock
        </button>
      </div>
      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
        {state.productosBuffet.map((p) => {
          const bajo = p.stock <= p.stockMin;
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #f0f1f5', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a' }}>{p.nombre}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 12.5, color: '#6b7488' }}>
                  {formatMoney(p.precioSocio)} socio · {formatMoney(p.precioNoSocio)} no socio
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    padding: '5px 12px',
                    borderRadius: 20,
                    background: bajo ? '#fbe6e9' : '#e5f6ea',
                    color: bajo ? '#c1293c' : '#1a7d43',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.stock} en stock
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 10 }}>Ventas de hoy</div>
      {state.ventasBuffet.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #d7dce6', borderRadius: 14, padding: '40px 24px', textAlign: 'center', fontSize: 13.5, color: '#6b7488' }}>
          Todavía no registraste ventas del buffet hoy.
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden' }}>
          {state.ventasBuffet.map((v) => (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f1f5', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a' }}>{v.producto}</div>
                <div style={{ fontSize: 12, color: '#8b93a5', marginTop: 2 }}>
                  {v.tipoCliente} · {v.medio} · {v.hora}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a7d43' }}>{formatMoney(v.precio)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
