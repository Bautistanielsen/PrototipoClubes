import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { formatMoney } from '../lib/format';
import type { MedioPago } from '../types';

const selectStyle = { height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', background: '#fff' };
const iconCommon = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const MEDIOS: MedioPago[] = ['Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'];
const iconBtnStyle = { width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, border: '1px solid #d7dce6', background: '#fff', cursor: 'pointer', flexShrink: 0 };

function PencilIcon() {
  return (
    <svg {...iconCommon}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg {...iconCommon}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function CategoriaBadge({ categoria }: { categoria: 'Indumentaria' | 'Accesorio' }) {
  const indumentaria = categoria === 'Indumentaria';
  const color = indumentaria ? '#6c4fa1' : '#0f7d8b';
  const bg = indumentaria ? '#f1ecf9' : '#e3f3f5';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color, background: bg, padding: '4px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {indumentaria
        ? <svg {...iconCommon}><path d="M8 3 4 6l1 4h2v11h10V10h2l1-4-4-3-3 2-3-2Z" /></svg>
        : <svg {...iconCommon}><path d="M4 8h16l-1 13H5L4 8Z" /><path d="M8 8a4 4 0 0 1 8 0" /></svg>}
      {categoria}
    </div>
  );
}

export default function Ventas() {
  const { state, actions } = useApp();
  const totalVentasShop = useMemo(() => state.ventasShop.reduce((a, v) => a + v.precio, 0), [state.ventasShop]);
  const totalesPorMedio = useMemo(
    () => MEDIOS.map((medio) => ({ medio, total: state.ventasShop.filter((v) => v.medio === medio).reduce((a, v) => a + v.precio, 0) })).filter((m) => m.total > 0),
    [state.ventasShop]
  );
  const productoSeleccionado = state.productosShop.find((p) => String(p.id) === state.nuevaVentaProductoId);

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
        {totalesPorMedio.length === 0 ? (
          <div style={{ flex: 2, minWidth: 220, background: '#fff', border: '1px dashed #d7dce6', borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', color: '#8b93a5', fontSize: 13.5 }}>
            Todavía no hay ventas registradas hoy.
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
          {productoSeleccionado?.categoria === 'Indumentaria' && (
            <select
              value={state.nuevaVentaVarianteId}
              onChange={(e) => actions.setNuevaVentaVarianteId(e.target.value)}
              style={{ ...selectStyle, flex: 2, minWidth: 200 }}
            >
              <option value="">Seleccionar talle y color...</option>
              {(productoSeleccionado.variantes || []).map((v) => (
                <option key={v.id} value={v.id}>
                  Talle {v.talle} · {v.color} — {v.stock} en stock
                </option>
              ))}
            </select>
          )}
          <select value={state.nuevaVentaMedio} onChange={(e) => actions.setNuevaVentaMedio(e.target.value as any)} style={{ ...selectStyle, flex: 1, minWidth: 150 }}>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="MercadoPago">MercadoPago</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
          <button
            onClick={actions.registrarVentaShop}
            style={{ minWidth: 150, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Registrar venta
          </button>
        </div>
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 10 }}>Menú y stock</div>
      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
        {state.productosShop.map((p) => {
          const bajo = p.stock <= 3;
          return (
            <div key={p.id} style={{ padding: '12px 20px', borderBottom: '1px solid #f0f1f5' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CategoriaBadge categoria={p.categoria} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a' }}>{p.nombre}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                  <button
                    onClick={() => actions.openModificarProductoShop(p.id)}
                    aria-label={`Modificar ${p.nombre}`}
                    style={{ ...iconBtnStyle, color: '#16203a' }}
                  >
                    <PencilIcon />
                  </button>
                  <button
                    onClick={() => actions.eliminarProductoShop(p.id)}
                    aria-label={`Eliminar ${p.nombre}`}
                    style={{ ...iconBtnStyle, border: '1px solid #f3d3d8', color: '#c1293c' }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
              {p.variantes && p.variantes.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {p.variantes.map((v) => (
                    <div key={v.id} style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 10, background: '#f5f7fb', color: '#6b7488' }}>
                      {v.talle} · {v.color}: {v.stock}
                    </div>
                  ))}
                </div>
              )}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a7d43' }}>{formatMoney(v.precio)}</div>
                <button
                  onClick={() => actions.quitarVentaShop(v.id)}
                  style={{ height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid #d7dce6', background: '#fff', color: '#c1293c', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
