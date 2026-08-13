import { useApp } from '../state/AppContext';
import ClubEscudo from './ClubEscudo';

export default function SportsSquadEntry() {
  const { state, actions } = useApp();

  return (
    <main className="sports-squad-entry">
      <header className="sports-squad-entry-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ClubEscudo size={34} />
          <div><strong>Club Atlético Modelo</strong><span>Gestión Deportiva</span></div>
        </div>
        <button type="button" onClick={actions.showModuleSelector}>Cambiar módulo</button>
      </header>
      <section className="sports-squad-entry-card">
        <span>GESTIÓN DEPORTIVA</span>
        <h1>Elegí el plantel con el que vas a trabajar</h1>
        <p>La agenda, el plantel, las formaciones y las estadísticas se organizarán en este contexto.</p>
        <div className="sports-squad-entry-list">
          {state.equiposDeportivos.map((equipo) => (
            <button type="button" key={equipo.id} onClick={() => actions.selectEquipoDeportivo(equipo.id)}>
              <strong>{equipo.nombre}</strong>
              <span>{equipo.disciplina}</span>
              <b>Ingresar</b>
            </button>
          ))}
        </div>
        <button type="button" className="sports-squad-entry-create" onClick={actions.openAgregarEquipoDeportivo}>+ Crear nuevo plantel</button>
      </section>
    </main>
  );
}
