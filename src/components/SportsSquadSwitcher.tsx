import { useApp } from '../state/AppContext';

export default function SportsSquadSwitcher({ variant }: { variant: 'sidebar' | 'mobile' }) {
  const { state, actions } = useApp();
  if (state.activeEquipoDeportivoId === null) return null;

  return (
    <div className={`sports-squad-switcher ${variant}`}>
      <label>
        <span>Plantel activo</span>
        <select value={state.activeEquipoDeportivoId} onChange={(event) => actions.selectEquipoDeportivo(Number(event.target.value))}>
          {state.equiposDeportivos.map((equipo) => <option key={equipo.id} value={equipo.id}>{equipo.nombre}</option>)}
        </select>
      </label>
      <button type="button" onClick={actions.openAgregarEquipoDeportivo}>+ Nuevo</button>
    </div>
  );
}
