import { fotosJugadoresDemo } from '../../data/seed';
import { useApp } from '../../state/AppContext';
import ModalOverlay from './ModalOverlay';

const inputStyle = { width: '100%', height: 44, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', background: '#fff' };

export default function JugadorModal() {
  const { state, actions } = useApp();
  if (!state.showJugadorModal) return null;
  const editing = state.jugadorEditandoId !== null;

  return (
    <ModalOverlay onClose={actions.closeJugadorModal} maxWidth={480} ariaLabel={editing ? 'Editar jugador' : 'Agregar jugador'}>
      <div style={{ fontSize: 19, fontWeight: 800, color: '#16203a', marginBottom: 5 }}>{editing ? 'Editar jugador' : 'Agregar jugador'}</div>
      <p style={{ color: '#6b7488', fontSize: 13, lineHeight: 1.45, margin: '0 0 18px' }}>Los datos se usan únicamente para organizar el plantel y contactar al jugador.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <input value={state.nuevoJugadorNombre} onChange={(e) => actions.setNuevoJugadorNombre(e.target.value)} placeholder="Nombre" aria-label="Nombre" style={inputStyle} />
        <input value={state.nuevoJugadorApellido} onChange={(e) => actions.setNuevoJugadorApellido(e.target.value)} placeholder="Apellido" aria-label="Apellido" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <input type="date" max={new Date().toISOString().slice(0, 10)} value={state.nuevoJugadorFechaNacimiento} onChange={(e) => actions.setNuevoJugadorFechaNacimiento(e.target.value)} style={inputStyle} aria-label="Fecha de nacimiento" />
        <input type="tel" value={state.nuevoJugadorTelefono} onChange={(e) => actions.setNuevoJugadorTelefono(e.target.value)} placeholder="Teléfono con WhatsApp" aria-label="Teléfono con WhatsApp" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <select value={state.nuevoJugadorEstado} onChange={(e) => actions.setNuevoJugadorEstado(e.target.value as 'disponible' | 'lesionado')} style={inputStyle} aria-label="Estado del jugador">
          <option value="disponible">Disponible</option>
          <option value="lesionado">Lesionado</option>
        </select>
        <select value={state.nuevoJugadorFoto} onChange={(e) => actions.setNuevoJugadorFoto(e.target.value)} style={inputStyle} aria-label="Foto opcional">
          <option value="">Sin foto</option>
          {fotosJugadoresDemo.map((foto, index) => <option key={foto} value={foto}>Foto demo {index + 1}</option>)}
        </select>
      </div>
      {state.nuevoJugadorEstado === 'lesionado' && <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
        <input value={state.nuevoJugadorMotivoLesion} onChange={(e) => actions.setNuevoJugadorMotivoLesion(e.target.value)} placeholder="Motivo de lesión" aria-label="Motivo de lesión" required style={inputStyle} />
        <input type="date" value={state.nuevoJugadorFechaEstimadaRecuperacion} onChange={(e) => actions.setNuevoJugadorFechaEstimadaRecuperacion(e.target.value)} aria-label="Fecha estimada de recuperación" required style={inputStyle} />
      </div>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={actions.closeJugadorModal} style={secondaryButton}>Cancelar</button>
        <button onClick={actions.guardarJugador} style={primaryButton}>{editing ? 'Guardar cambios' : 'Agregar jugador'}</button>
      </div>
    </ModalOverlay>
  );
}

const secondaryButton = { flex: 1, height: 44, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 700, cursor: 'pointer' };
const primaryButton = { flex: 1, height: 44, border: 'none', borderRadius: 9, background: '#087f75', color: '#fff', fontWeight: 700, cursor: 'pointer' };
