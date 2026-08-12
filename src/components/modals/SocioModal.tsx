import { useApp } from '../../state/AppContext';
import ModalOverlay from './ModalOverlay';

const inputStyle = { width: '100%', height: 44, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', background: '#fff' };

export default function SocioModal() {
  const { state, actions } = useApp();
  if (!state.showSocioModal) return null;

  const editando = state.socioEditandoId !== null;

  return (
    <ModalOverlay onClose={actions.closeSocioModal} maxWidth={480} ariaLabel={editando ? 'Editar socio' : 'Nuevo socio'}>
      <div style={{ fontSize: 19, fontWeight: 800, color: '#16203a', marginBottom: 5 }}>{editando ? 'Editar socio' : 'Nuevo socio'}</div>
      <p style={{ color: '#6b7488', fontSize: 13, lineHeight: 1.45, margin: '0 0 18px' }}>
        {editando ? 'Los cambios se aplican de inmediato.' : 'Se da de alta con la cuota al día desde hoy.'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <input value={state.nuevoSocioNombre} onChange={(e) => actions.setNuevoSocioNombre(e.target.value)} placeholder="Nombre" aria-label="Nombre" style={inputStyle} />
        <input value={state.nuevoSocioApellido} onChange={(e) => actions.setNuevoSocioApellido(e.target.value)} placeholder="Apellido" aria-label="Apellido" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <input type="tel" value={state.nuevoSocioTelefono} onChange={(e) => actions.setNuevoSocioTelefono(e.target.value)} placeholder="Teléfono con WhatsApp" aria-label="Teléfono con WhatsApp" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <select value={state.nuevoSocioCategoriaId} onChange={(e) => actions.setNuevoSocioCategoriaId(e.target.value)} style={inputStyle} aria-label="Categoría de cuota">
          <option value="">Categoría de cuota...</option>
          {state.categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
        <select value={state.nuevoSocioMedioPago} onChange={(e) => actions.setNuevoSocioMedioPago(e.target.value as any)} style={inputStyle} aria-label="Medio de pago habitual">
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="MercadoPago">MercadoPago</option>
        </select>
      </div>
      {state.nuevoSocioMedioPago === 'Tarjeta' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13.5, color: '#16203a', cursor: 'pointer' }}>
          <input type="checkbox" checked={state.nuevoSocioDebitoAutomatico} onChange={actions.toggleNuevoSocioDebitoAutomatico} />
          Activar débito automático con tarjeta
        </label>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={actions.closeSocioModal} style={secondaryButton}>Cancelar</button>
        <button onClick={actions.guardarSocio} style={primaryButton}>{editando ? 'Guardar cambios' : 'Agregar socio'}</button>
      </div>
    </ModalOverlay>
  );
}

const secondaryButton = { flex: 1, height: 44, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 700, cursor: 'pointer' };
const primaryButton = { flex: 1, height: 44, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, cursor: 'pointer' };
