import { useApp } from '../../state/AppContext';
import ModalOverlay from './ModalOverlay';
import FotoUploadInput from './FotoUploadInput';
import type { UbicacionSponsor } from '../../types';

const inputStyle = { width: '100%', height: 44, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', background: '#fff' };
const UBICACIONES: UbicacionSponsor[] = ['Cancha', 'Camiseta', 'Portal del Hincha', 'Buffet'];

export default function SponsorModal() {
  const { state, actions } = useApp();
  if (!state.showSponsorModal) return null;

  const editando = state.sponsorEditandoId !== null;

  return (
    <ModalOverlay onClose={actions.closeSponsorModal} maxWidth={480} ariaLabel={editando ? 'Editar sponsor' : 'Nuevo sponsor'}>
      <div style={{ fontSize: 19, fontWeight: 800, color: '#16203a', marginBottom: 5 }}>{editando ? 'Editar sponsor' : 'Nuevo sponsor'}</div>
      <p style={{ color: '#6b7488', fontSize: 13, lineHeight: 1.45, margin: '0 0 18px' }}>
        {editando ? 'Los cambios se aplican de inmediato.' : 'Se suma a la lista de patrocinadores del club.'}
      </p>
      <FotoUploadInput foto={state.nuevoSponsorLogo} onFotoChange={actions.setNuevoSponsorLogo} onQuitar={() => actions.setNuevoSponsorLogo('')} label="logo" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <input value={state.nuevoSponsorNombre} onChange={(e) => actions.setNuevoSponsorNombre(e.target.value)} placeholder="Nombre del sponsor" aria-label="Nombre del sponsor" style={inputStyle} />
        <input value={state.nuevoSponsorRubro} onChange={(e) => actions.setNuevoSponsorRubro(e.target.value)} placeholder="Rubro" aria-label="Rubro" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <input
          type="number"
          min="0"
          value={state.nuevoSponsorMonto}
          onChange={(e) => actions.setNuevoSponsorMonto(e.target.value)}
          placeholder="Monto mensual ($)"
          aria-label="Monto mensual"
          style={inputStyle}
        />
        <select value={state.nuevoSponsorUbicacion} onChange={(e) => actions.setNuevoSponsorUbicacion(e.target.value as UbicacionSponsor)} style={inputStyle} aria-label="Dónde aparece la marca">
          {UBICACIONES.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#8b93a5', marginBottom: 4 }}>Vigencia desde</label>
          <input type="date" value={state.nuevoSponsorFechaInicio} onChange={(e) => actions.setNuevoSponsorFechaInicio(e.target.value)} aria-label="Vigencia desde" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#8b93a5', marginBottom: 4 }}>Vigencia hasta</label>
          <input type="date" value={state.nuevoSponsorFechaFin} onChange={(e) => actions.setNuevoSponsorFechaFin(e.target.value)} aria-label="Vigencia hasta" style={inputStyle} />
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <input value={state.nuevoSponsorContacto} onChange={(e) => actions.setNuevoSponsorContacto(e.target.value)} placeholder="Contacto (teléfono o email, opcional)" aria-label="Contacto" style={inputStyle} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={actions.closeSponsorModal} style={secondaryButton}>Cancelar</button>
        <button onClick={actions.guardarSponsor} style={primaryButton}>{editando ? 'Guardar cambios' : 'Agregar sponsor'}</button>
      </div>
    </ModalOverlay>
  );
}

const secondaryButton = { flex: 1, height: 44, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 700, cursor: 'pointer' };
const primaryButton = { flex: 1, height: 44, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, cursor: 'pointer' };
