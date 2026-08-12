import { useApp } from '../../state/AppContext';
import ModalOverlay from './ModalOverlay';
import FotoUploadInput from './FotoUploadInput';

const inputStyle = { width: '100%', height: 44, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', background: '#fff' };

export default function NuevoProductoShopModal() {
  const { state, actions } = useApp();
  if (!state.showNuevoProductoShopModal) return null;

  const esIndumentaria = state.nuevoProductoShopCategoria === 'Indumentaria';

  return (
    <ModalOverlay onClose={actions.closeNuevoProductoShop} maxWidth={480} ariaLabel="Nuevo producto">
      <div style={{ fontSize: 19, fontWeight: 800, color: '#16203a', marginBottom: 5 }}>Nuevo producto</div>
      <p style={{ color: '#6b7488', fontSize: 13, lineHeight: 1.45, margin: '0 0 18px' }}>Se suma al catálogo de la tienda del club.</p>
      <FotoUploadInput foto={state.nuevoProductoShopFoto} onFotoChange={actions.setNuevoProductoShopFoto} onQuitar={() => actions.setNuevoProductoShopFoto('')} />
      <div style={{ marginBottom: 10 }}>
        <input value={state.nuevoProductoShopNombre} onChange={(e) => actions.setNuevoProductoShopNombre(e.target.value)} placeholder="Nombre del producto" aria-label="Nombre del producto" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <select value={state.nuevoProductoShopCategoria} onChange={(e) => actions.setNuevoProductoShopCategoria(e.target.value as any)} style={inputStyle} aria-label="Categoría">
          <option value="Indumentaria">Indumentaria</option>
          <option value="Accesorio">Accesorio</option>
        </select>
        <input
          type="number"
          min="0"
          value={state.nuevoProductoShopPrecio}
          onChange={(e) => actions.setNuevoProductoShopPrecio(e.target.value)}
          placeholder="Precio"
          aria-label="Precio"
          style={inputStyle}
        />
      </div>
      {esIndumentaria ? (
        <>
          <p style={{ color: '#8b93a5', fontSize: 12.5, lineHeight: 1.45, margin: '0 0 10px' }}>
            Se crea sin stock. Después sumale talle, color y cantidad con el lápiz de "Modificar".
          </p>
          <div style={{ marginBottom: 20 }}>
            <input
              type="number"
              min="0"
              value={state.nuevoProductoShopStockMin}
              onChange={(e) => actions.setNuevoProductoShopStockMin(e.target.value)}
              placeholder="Stock mínimo (alerta de stock bajo)"
              aria-label="Stock mínimo"
              style={inputStyle}
            />
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <input
            type="number"
            min="0"
            value={state.nuevoProductoShopStock}
            onChange={(e) => actions.setNuevoProductoShopStock(e.target.value)}
            placeholder="Stock inicial"
            aria-label="Stock inicial"
            style={inputStyle}
          />
          <input
            type="number"
            min="0"
            value={state.nuevoProductoShopStockMin}
            onChange={(e) => actions.setNuevoProductoShopStockMin(e.target.value)}
            placeholder="Stock mínimo"
            aria-label="Stock mínimo"
            style={inputStyle}
          />
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={actions.closeNuevoProductoShop} style={secondaryButton}>Cancelar</button>
        <button onClick={actions.guardarNuevoProductoShop} style={primaryButton}>Agregar producto</button>
      </div>
    </ModalOverlay>
  );
}

const secondaryButton = { flex: 1, height: 44, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 700, cursor: 'pointer' };
const primaryButton = { flex: 1, height: 44, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, cursor: 'pointer' };
