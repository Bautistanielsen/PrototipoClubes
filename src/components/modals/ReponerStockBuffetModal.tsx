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

export default function ReponerStockBuffetModal() {
  const { state, actions } = useApp();
  if (!state.showReponerStockBuffet) return null;

  return (
    <ModalOverlay onClose={actions.closeReponerStockBuffet} maxWidth={440}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 16 }}>Reponer stock</div>
      <select
        value={state.nuevoStockBuffetProductoId}
        onChange={(e) => actions.setNuevoStockBuffetProductoId(e.target.value)}
        style={{ width: '100%', ...inputStyle, marginBottom: 12 }}
      >
        <option value="">Seleccionar producto...</option>
        {state.productosBuffet.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre} — {p.stock} en stock
          </option>
        ))}
      </select>
      <input
        type="number"
        min="1"
        placeholder="Cantidad"
        value={state.nuevoStockBuffetCantidad}
        onChange={(e) => actions.setNuevoStockBuffetCantidad(e.target.value)}
        style={{ width: '100%', height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#16203a', marginBottom: 20 }}
      />
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={actions.closeReponerStockBuffet}
          style={{ flex: 1, height: 46, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          onClick={actions.reponerStockBuffet}
          style={{ flex: 1, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          Reponer
        </button>
      </div>
    </ModalOverlay>
  );
}
