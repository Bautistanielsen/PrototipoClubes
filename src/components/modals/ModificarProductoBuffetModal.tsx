import { useApp } from '../../state/AppContext';
import ModalOverlay from './ModalOverlay';

const fieldLabel = { display: 'block', fontSize: 13, fontWeight: 600, color: '#16203a', marginBottom: 6 };
const inputStyle = { width: '100%', height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#16203a' };
const sectionTitle = { fontSize: 12.5, fontWeight: 700, color: '#8b93a5', textTransform: 'uppercase' as const, letterSpacing: '.03em', marginBottom: 10 };

export default function ModificarProductoBuffetModal() {
  const { state, actions } = useApp();
  const producto = state.productosBuffet.find((p) => p.id === state.modificarProductoBuffetId);
  if (!producto) return null;

  return (
    <ModalOverlay onClose={actions.closeModificarProductoBuffet} maxWidth={420} ariaLabel={`Modificar ${producto.nombre}`}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 4 }}>Modificar producto</div>
      <div style={{ fontSize: 13.5, color: '#6b7488', marginBottom: 20 }}>{producto.nombre} · {producto.stock} en stock</div>

      <div style={sectionTitle}>Precios</div>
      <div style={{ fontSize: 12, color: '#8b93a5', marginBottom: 10 }}>
        Se aplica a las ventas que se registren de ahora en más. Las ventas ya hechas no cambian.
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
        <div style={{ flex: 1 }}>
          <label style={fieldLabel}>Precio socio</label>
          <input
            value={String(producto.precioSocio)}
            onChange={(e) => {
              const v = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
              actions.setPrecioBuffetSocio(producto.id, v);
            }}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={fieldLabel}>Precio no socio</label>
          <input
            value={String(producto.precioNoSocio)}
            onChange={(e) => {
              const v = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
              actions.setPrecioBuffetNoSocio(producto.id, v);
            }}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={sectionTitle}>Reponer stock</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        <input
          type="number"
          min="1"
          placeholder="Cantidad a sumar"
          value={state.nuevoStockBuffetCantidad}
          onChange={(e) => actions.setNuevoStockBuffetCantidad(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onClick={actions.reponerStockBuffet}
          style={{ height: 46, padding: '0 18px', border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          + Agregar
        </button>
      </div>

      <button
        onClick={actions.closeModificarProductoBuffet}
        style={{ width: '100%', height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
      >
        Cerrar
      </button>
    </ModalOverlay>
  );
}
