import { useApp } from '../../state/AppContext';
import ModalOverlay from './ModalOverlay';

export default function DifundirTorneoModal() {
  const { state, actions } = useApp();
  if (!state.showDifundirTorneo) return null;

  const torneo = state.torneos.find((t) => t.id === state.difundirTorneoId);

  return (
    <ModalOverlay onClose={actions.closeDifundirTorneo} maxWidth={480}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 4 }}>Difundir torneo</div>
      {torneo && <div style={{ fontSize: 13.5, color: '#6b7488', marginBottom: 16 }}>{torneo.nombre}</div>}
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#16203a', marginBottom: 6 }}>Mensaje</label>
      <textarea
        value={state.mensajeDifusionTorneo}
        onChange={(e) => actions.setMensajeDifusionTorneo(e.target.value)}
        rows={6}
        style={{ width: '100%', border: '1px solid #e3e7ef', borderRadius: 9, padding: '10px 12px', fontSize: 13.5, color: '#16203a', marginBottom: 16, fontFamily: 'inherit', resize: 'vertical' }}
      />
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <button
          onClick={actions.enviarWhatsappTorneo}
          style={{ flex: 1, height: 46, border: 'none', borderRadius: 9, background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          Enviar por WhatsApp
        </button>
        <button
          onClick={actions.copiarMensajeTorneo}
          style={{ flex: 1, height: 46, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          Copiar mensaje
        </button>
      </div>
      <div style={{ fontSize: 11.5, color: '#8b93a5', marginBottom: 14 }}>
        WhatsApp se abre con el mensaje listo — elegís el grupo o la lista de difusión de socios para enviarlo. "Copiar mensaje" sirve para pegarlo en mail, Instagram u otros canales.
      </div>
      <button
        onClick={actions.closeDifundirTorneo}
        style={{ width: '100%', height: 42, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}
      >
        Cerrar
      </button>
    </ModalOverlay>
  );
}
