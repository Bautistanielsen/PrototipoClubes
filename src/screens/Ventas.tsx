import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { formatMoney } from '../lib/format';

const selectStyle = { height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', background: '#fff' };

export default function Ventas() {
  const { state, actions } = useApp();
  const totalVentasShop = useMemo(() => state.ventasShop.reduce((a, v) => a + v.precio, 0), [state.ventasShop]);

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Ventas del shop</div>
        <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>Registro manual de ventas de mercadería del club</div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 180, background: '#172a54', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, color: '#aeb8d6', fontWeight: 600 }}>Total vendido hoy</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginTop: 6 }}>{formatMoney(totalVentasShop)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 180, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Ventas registradas</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{state.ventasShop.length}</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 14 }}>Registrar venta</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select
            value={state.nuevaVentaProductoId}
            onChange={(e) => actions.setNuevaVentaProductoId(e.target.value)}
            style={{ ...selectStyle, flex: 2, minWidth: 200 }}
          >
            <option value="">Seleccionar producto...</option>
            {state.productosShop.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — {formatMoney(p.precio)}
              </option>
            ))}
          </select>
          <select value={state.nuevaVentaMedio} onChange={(e) => actions.setNuevaVentaMedio(e.target.value as any)} style={{ ...selectStyle, flex: 1, minWidth: 150 }}>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </select>
          <button
            onClick={actions.registrarVentaShop}
            style={{ minWidth: 150, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Registrar venta
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 14 }}>Reponer stock</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select
            value={state.nuevoStockShopProductoId}
            onChange={(e) => actions.setNuevoStockShopProductoId(e.target.value)}
            style={{ ...selectStyle, flex: 2, minWidth: 200 }}
          >
            <option value="">Seleccionar producto...</option>
            {state.productosShop.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — {p.stock} en stock
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            placeholder="Cantidad"
            value={state.nuevoStockShopCantidad}
            onChange={(e) => actions.setNuevoStockShopCantidad(e.target.value)}
            style={{ ...selectStyle, flex: 1, minWidth: 140 }}
          />
          <button
            onClick={actions.reponerStockShop}
            style={{ minWidth: 150, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Reponer stock
          </button>
        </div>
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 10 }}>Menú y stock</div>
      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
        {state.productosShop.map((p) => {
          const bajo = p.stock <= 3;
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #f0f1f5', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a' }}>{p.nombre}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 12.5, color: '#6b7488' }}>{formatMoney(p.precio)}</div>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    padding: '5px 12px',
                    borderRadius: 20,
                    background: bajo ? '#fbe6e9' : '#eef1f7',
                    color: bajo ? '#c1293c' : '#16203a',
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
      {state.ventasShop.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #d7dce6', borderRadius: 14, padding: '40px 24px', textAlign: 'center', fontSize: 13.5, color: '#6b7488' }}>
          Todavía no registraste ventas hoy.
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden' }}>
          {state.ventasShop.map((v) => (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f1f5', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a' }}>{v.producto}</div>
                <div style={{ fontSize: 12, color: '#8b93a5', marginTop: 2 }}>
                  {v.medio} · {v.hora}
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
