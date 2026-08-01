import { useApp } from '../../state/AppContext';
import ModalOverlay from './ModalOverlay';

export default function InfoCanchasModal() {
  const { state, actions } = useApp();
  if (!state.showInfoCanchas) return null;

  return (
    <ModalOverlay onClose={actions.closeInfoCanchas} maxWidth={460}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 10 }}>Reserva de canchas para los socios</div>
      <div style={{ fontSize: 13.5, color: '#4b5468', lineHeight: 1.6, marginBottom: 16 }}>
        Lo que ves acá es la vista de administración, para gestionar los turnos manualmente. El club también puede sumar el
        servicio de <strong>Reservar Cancha</strong>: los socios reservan directamente desde su celular, sin llamar ni pasar
        por secretaría, y el turno aparece al instante en este mismo panel.
      </div>
      <div style={{ background: '#f5f7fb', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#16203a', lineHeight: 1.5 }}>
        Menos coordinación manual, menos superposición de horarios, y una mejor experiencia para el socio.
      </div>
      <button
        onClick={actions.closeInfoCanchas}
        style={{ width: '100%', height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
      >
        Entendido
      </button>
    </ModalOverlay>
  );
}
