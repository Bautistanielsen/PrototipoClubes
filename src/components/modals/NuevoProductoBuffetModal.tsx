import { useApp } from '../../state/AppContext';
import ModalOverlay from './ModalOverlay';
import FotoUploadInput from './FotoUploadInput';

const inputStyle = { width: '100%', height: 44, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', background: '#fff' };

export default function NuevoProductoBuffetModal() {
  const { state, actions } = useApp();
  if (!state.showNuevoProductoBuffetModal) return null;

  return (
    <ModalOverlay onClose={actions.closeNuevoProductoBuffet} maxWidth={480} ariaLabel="Nuevo producto">
      <div style={{ fontSize: 19, fontWeight: 800, color: '#16203a', marginBottom: 5 }}>Nuevo producto</div>
      <p style={{ color: '#6b7488', fontSize: 13, lineHeight: 1.45, margin: '0 0 18px' }}>Se suma al menú del buffet.</p>
      <FotoUploadInput foto={state.nuevoProductoBuffetFoto} onFotoChange={actions.setNuevoProductoBuffetFoto} onQuitar={() => actions.setNuevoProductoBuffetFoto('')} />
      <div style={{ marginBottom: 10 }}>
        <input value={state.nuevoProductoBuffetNombre} onChange={(e) => actions.setNuevoProductoBuffetNombre(e.target.value)} placeholder="Nombre del producto" aria-label="Nombre del producto" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <input
          type="number"
          min="0"
          value={state.nuevoProductoBuffetPrecioSocio}
          onChange={(e) => actions.setNuevoProductoBuffetPrecioSocio(e.target.value)}
          placeholder="Precio socio"
          aria-label="Precio socio"
          style={inputStyle}
        />
        <input
          type="number"
          min="0"
          value={state.nuevoProductoBuffetPrecioNoSocio}
          onChange={(e) => actions.setNuevoProductoBuffetPrecioNoSocio(e.target.value)}
          placeholder="Precio no socio"
          aria-label="Precio no socio"
          style={inputStyle}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <input
          type="number"
          min="0"
          value={state.nuevoProductoBuffetStock}
          onChange={(e) => actions.setNuevoProductoBuffetStock(e.target.value)}
          placeholder="Stock inicial"
          aria-label="Stock inicial"
          style={inputStyle}
        />
        <input
          type="number"
          min="0"
          value={state.nuevoProductoBuffetStockMin}
          onChange={(e) => actions.setNuevoProductoBuffetStockMin(e.target.value)}
          placeholder="Stock mínimo"
          aria-label="Stock mínimo"
          style={inputStyle}
        />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={actions.closeNuevoProductoBuffet} style={secondaryButton}>Cancelar</button>
        <button onClick={actions.guardarNuevoProductoBuffet} style={primaryButton}>Agregar producto</button>
      </div>
    </ModalOverlay>
  );
}

const secondaryButton = { flex: 1, height: 44, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 700, cursor: 'pointer' };
const primaryButton = { flex: 1, height: 44, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, cursor: 'pointer' };
