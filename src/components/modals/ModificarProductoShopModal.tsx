import { useApp } from '../../state/AppContext';
import ModalOverlay from './ModalOverlay';

const inputStyle = { height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#16203a', background: '#fff' };
const sectionTitle = { fontSize: 12.5, fontWeight: 700, color: '#8b93a5', textTransform: 'uppercase' as const, letterSpacing: '.03em', marginBottom: 10 };

export default function ModificarProductoShopModal() {
  const { state, actions } = useApp();
  const producto = state.productosShop.find((p) => p.id === state.modificarProductoShopId);
  if (!producto) return null;

  return (
    <ModalOverlay onClose={actions.closeModificarProductoShop} maxWidth={420} ariaLabel={`Modificar ${producto.nombre}`}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 4 }}>Modificar producto</div>
      <div style={{ fontSize: 13.5, color: '#6b7488', marginBottom: 20 }}>{producto.nombre} · {producto.stock} en stock</div>

      <div style={sectionTitle}>Precio</div>
      <div style={{ fontSize: 12, color: '#8b93a5', marginBottom: 10 }}>
        Se aplica a las ventas que se registren de ahora en más. Las ventas ya hechas no cambian.
      </div>
      <input
        value={String(producto.precio)}
        onChange={(e) => {
          const v = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
          actions.setPrecioShop(producto.id, v);
        }}
        style={{ ...inputStyle, width: '100%', marginBottom: 22 }}
      />

      <div style={sectionTitle}>Reponer stock</div>
      {producto.categoria === 'Indumentaria' && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <select value={state.nuevoStockShopTalle} onChange={(e) => actions.setNuevoStockShopTalle(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
            <option value="">Talle...</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
          <input
            type="text"
            placeholder="Color"
            value={state.nuevoStockShopColor}
            onChange={(e) => actions.setNuevoStockShopColor(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        <input
          type="number"
          min="1"
          placeholder="Cantidad a sumar"
          value={state.nuevoStockShopCantidad}
          onChange={(e) => actions.setNuevoStockShopCantidad(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onClick={actions.reponerStockShop}
          style={{ height: 46, padding: '0 18px', border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          + Agregar
        </button>
      </div>

      <button
        onClick={actions.closeModificarProductoShop}
        style={{ width: '100%', height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
      >
        Cerrar
      </button>
    </ModalOverlay>
  );
}
