import { useApp } from '../../state/AppContext';
import ModalOverlay from './ModalOverlay';

export default function EquipoDeportivoModal() {
  const { state, actions } = useApp();
  if (!state.showEquipoDeportivoModal) return null;

  return (
    <ModalOverlay onClose={actions.closeEquipoDeportivoModal} maxWidth={400} ariaLabel="Crear plantel">
      <div style={{ fontSize: 19, fontWeight: 800, color: '#16203a', marginBottom: 5 }}>Nuevo plantel</div>
      <p style={{ color: '#6b7488', fontSize: 13, lineHeight: 1.45, margin: '0 0 16px' }}>Por ejemplo: Reserva, Sub 15 o Femenino.</p>
      <input
        autoFocus
        value={state.nuevoEquipoDeportivoNombre}
        onChange={(e) => actions.setNuevoEquipoDeportivoNombre(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') actions.agregarEquipoDeportivo(); }}
        placeholder="Nombre del plantel"
        aria-label="Nombre del plantel"
        style={{ width: '100%', height: 44, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', marginBottom: 18 }}
      />
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={actions.closeEquipoDeportivoModal} style={secondaryButton}>Cancelar</button>
        <button onClick={actions.agregarEquipoDeportivo} style={primaryButton}>Crear plantel</button>
      </div>
    </ModalOverlay>
  );
}

const secondaryButton = { flex: 1, height: 44, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 700, cursor: 'pointer' };
const primaryButton = { flex: 1, height: 44, border: 'none', borderRadius: 9, background: '#65c458', color: '#fff', fontWeight: 700, cursor: 'pointer' };
