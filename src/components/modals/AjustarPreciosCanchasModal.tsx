import { useApp } from '../../state/AppContext';
import ModalOverlay from './ModalOverlay';

export default function AjustarPreciosCanchasModal() {
  const { state, actions } = useApp();
  if (!state.showAjustarPreciosCanchas) return null;

  return (
    <ModalOverlay onClose={actions.closeAjustarPreciosCanchas} maxWidth={440} ariaLabel="Ajustar precios de canchas">
      <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 4 }}>Ajustar precios de canchas</div>
      <div style={{ fontSize: 13.5, color: '#6b7488', marginBottom: 18 }}>
        El nuevo precio se aplica a los turnos que se reserven de ahora en más. Las reservas ya hechas no cambian.
      </div>
      {state.canchas.map((c) => (
        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f1f5' }}>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#16203a' }}>
            {c.nombre} #{c.numero}
          </div>
          <input
            value={String(c.precio)}
            onChange={(e) => {
              const v = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
              actions.setPrecioCancha(c.id, v);
            }}
            style={{ width: 140, height: 40, border: '1px solid #e3e7ef', borderRadius: 8, padding: '0 12px', fontSize: 14, color: '#16203a', textAlign: 'right' }}
          />
        </div>
      ))}
      <button
        onClick={actions.closeAjustarPreciosCanchas}
        style={{ width: '100%', height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 20 }}
      >
        Guardar
      </button>
    </ModalOverlay>
  );
}
