import { useApp } from '../../state/AppContext';
import { formatFechaCorta } from '../../lib/format';
import ModalOverlay from './ModalOverlay';

export default function ReservaModal() {
  const { state, actions } = useApp();
  if (!state.showReservaModal) return null;

  const cancha = state.canchas.find((c) => c.id === state.selectedCanchaId);

  return (
    <ModalOverlay onClose={actions.closeReservaModal} maxWidth={420}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 4 }}>Reservar turno</div>
      <div style={{ fontSize: 13.5, color: '#6b7488', marginBottom: 18 }}>
        {cancha?.nombre} · {formatFechaCorta(state.selectedDia)} · {state.reservaHoraSel}
      </div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#16203a', marginBottom: 6 }}>Nombre de quien reserva</label>
      <input
        type="text"
        value={state.reservaNombre}
        onChange={(e) => actions.setReservaNombre(e.target.value)}
        placeholder="Nombre y apellido"
        style={{ width: '100%', height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#16203a', marginBottom: 14 }}
      />
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button
          onClick={actions.closeReservaModal}
          style={{ flex: 1, height: 46, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          onClick={actions.confirmarReserva}
          style={{ flex: 1, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          Confirmar
        </button>
      </div>
    </ModalOverlay>
  );
}
