import { useApp } from '../../state/AppContext';
import ModalOverlay from './ModalOverlay';

const inputStyle = {
  flex: 1,
  height: 46,
  border: '1px solid #e3e7ef',
  borderRadius: 9,
  padding: '0 12px',
  fontSize: 14,
  color: '#16203a',
  background: '#fff',
};

export default function ReponerStockShopModal() {
  const { state, actions } = useApp();
  if (!state.showReponerStockShop) return null;

  const producto = state.productosShop.find((p) => String(p.id) === state.nuevoStockShopProductoId);

  return (
    <ModalOverlay onClose={actions.closeReponerStockShop} maxWidth={440}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 16 }}>Reponer stock</div>
      <select
        value={state.nuevoStockShopProductoId}
        onChange={(e) => actions.setNuevoStockShopProductoId(e.target.value)}
        style={{ width: '100%', ...inputStyle, marginBottom: 12 }}
      >
        <option value="">Seleccionar producto...</option>
        {state.productosShop.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre} — {p.stock} en stock
          </option>
        ))}
      </select>
      {producto?.categoria === 'Indumentaria' && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <select value={state.nuevoStockShopTalle} onChange={(e) => actions.setNuevoStockShopTalle(e.target.value)} style={inputStyle}>
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
            style={inputStyle}
          />
        </div>
      )}
      <input
        type="number"
        min="1"
        placeholder="Cantidad"
        value={state.nuevoStockShopCantidad}
        onChange={(e) => actions.setNuevoStockShopCantidad(e.target.value)}
        style={{ width: '100%', height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#16203a', marginBottom: 20 }}
      />
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={actions.closeReponerStockShop}
          style={{ flex: 1, height: 46, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          onClick={actions.reponerStockShop}
          style={{ flex: 1, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          Reponer
        </button>
      </div>
    </ModalOverlay>
  );
}
