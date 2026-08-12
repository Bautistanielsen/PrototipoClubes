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

function esBebida(nombre: string) {
  return /gaseosa|agua|caf[eé]|jugo|limonada/i.test(nombre);
}

function CategoriaBadge({ nombre }: { nombre: string }) {
  const bebida = esBebida(nombre);
  const color = bebida ? '#2f6fb0' : '#a15c00';
  const bg = bebida ? '#eaf2fa' : '#fdf0dc';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color, background: bg, padding: '4px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {bebida
        ? <svg {...iconCommon}><path d="M7 3v7M4 3v4a3 3 0 0 0 6 0V3M7 10v11" /></svg>
        : <svg {...iconCommon}><path d="M6 2v20M6 2c-2 2-2 6 0 8M6 2c2 2 2 6 0 8M18 2v20M18 2a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3" /></svg>}
      {bebida ? 'Bebida' : 'Comida'}
    </div>
  );
}

export default function Buffet() {
  const { state, actions } = useApp();

  const totalBuffet = useMemo(() => state.ventasBuffet.reduce((a, v) => a + v.precio, 0), [state.ventasBuffet]);
  const totalesPorMedio = useMemo(
    () => MEDIOS.map((medio) => ({ medio, total: state.ventasBuffet.filter((v) => v.medio === medio).reduce((a, v) => a + v.precio, 0) })).filter((m) => m.total > 0),
    [state.ventasBuffet]
  );
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
            <option value="MercadoPago">MercadoPago</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
          <button
            onClick={actions.registrarVentaBuffet}
            style={{ minWidth: 150, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Registrar venta
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a' }}>Menú y stock</div>
        <button
          onClick={actions.openNuevoProductoBuffet}
          style={{ height: 36, padding: '0 16px', border: 'none', borderRadius: 8, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          + Nuevo producto
        </button>
      </div>
      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
        {state.productosBuffet.map((p) => {
          const bajo = p.stock <= p.stockMin;
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #f0f1f5', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f5f7fb', border: '1px solid #e3e7ef', overflow: 'hidden', flexShrink: 0 }}>
                  {p.foto && <img src={p.foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                </div>
                <CategoriaBadge nombre={p.nombre} />
                <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a' }}>{p.nombre}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                <button
                  onClick={() => actions.openModificarProductoBuffet(p.id)}
                  aria-label={`Modificar ${p.nombre}`}
                  style={{ ...iconBtnStyle, color: '#16203a' }}
                >
                  <PencilIcon />
                </button>
                <button
                  onClick={() => actions.eliminarProductoBuffet(p.id)}
                  aria-label={`Eliminar ${p.nombre}`}
                  style={{ ...iconBtnStyle, border: '1px solid #f3d3d8', color: '#c1293c' }}
                >
                  <TrashIcon />
                </button>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a7d43' }}>{formatMoney(v.precio)}</div>
                <button
                  onClick={() => actions.quitarVentaBuffet(v.id)}
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
