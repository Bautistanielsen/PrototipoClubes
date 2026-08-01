import { useApp } from '../../state/AppContext';
import { HOY_ISO } from '../../lib/derive';
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

export default function AgregarPartidoModal() {
  const { state, actions } = useApp();
  if (!state.showAgregarPartido) return null;

  return (
    <ModalOverlay onClose={actions.closeAgregarPartido} maxWidth={440}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 16 }}>Agregar partido</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <input
          type="date"
          value={state.nuevoPartidoFecha}
          min={HOY_ISO}
          onChange={(e) => actions.setNuevoPartidoFecha(e.target.value)}
          style={inputStyle}
        />
        <input
          type="time"
          value={state.nuevoPartidoHora}
          onChange={(e) => actions.setNuevoPartidoHora(e.target.value)}
          style={{ ...inputStyle, flex: 'unset', width: 110 }}
        />
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <select value={state.nuevoPartidoTipo} onChange={(e) => actions.setNuevoPartidoTipo(e.target.value as any)} style={inputStyle}>
          <option value="Liga">Liga</option>
          <option value="Amistoso">Amistoso</option>
          <option value="Copa">Copa</option>
          <option value="Torneo">Torneo</option>
        </select>
        <select value={state.nuevoPartidoCondicion} onChange={(e) => actions.setNuevoPartidoCondicion(e.target.value as any)} style={inputStyle}>
          <option value="Local">Local</option>
          <option value="Visitante">Visitante</option>
        </select>
      </div>
      <input
        type="text"
        value={state.nuevoPartidoRival}
        onChange={(e) => actions.setNuevoPartidoRival(e.target.value)}
        placeholder="Nombre del rival"
        style={{ width: '100%', height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#16203a', marginBottom: 20 }}
      />
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={actions.closeAgregarPartido}
          style={{ flex: 1, height: 46, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          onClick={actions.agregarPartido}
          style={{ flex: 1, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          Agregar
        </button>
      </div>
    </ModalOverlay>
  );
}
