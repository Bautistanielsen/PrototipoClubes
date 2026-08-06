import { useEffect, useState } from 'react';
import type { Jugador } from '../types';
import { useApp } from '../state/AppContext';

function edad(fechaNacimiento: string) {
  const hoy = new Date();
  const nacimiento = new Date(`${fechaNacimiento}T12:00:00`);
  let años = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) años--;
  return años;
}

function iniciales(jugador: Jugador) {
  return `${jugador.nombre[0] || ''}${jugador.apellido[0] || ''}`.toUpperCase();
}

function telefonoWhatsApp(telefono: string) {
  const digitos = telefono.replace(/\D/g, '');
  if (digitos.startsWith('54')) return digitos;
  return digitos.length === 10 ? `549${digitos}` : digitos;
}

function fechaLocalISO() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

function slug(valor: string) {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'plantel';
}

function csvCell(valor: string | number) {
  let texto = String(valor);
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
  return /[",\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export default function Equipos() {
  const { state, actions } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [vista, setVista] = useState<'lista' | 'grilla'>('lista');
  const equipo = state.equiposDeportivos.find((item) => item.id === state.selectedEquipoDeportivoId);
  const jugadores = state.jugadores.filter((jugador) => jugador.equipoId === state.selectedEquipoDeportivoId);
  const disponibles = jugadores.filter((jugador) => jugador.estado === 'disponible').length;
  const normalizar = (valor: string) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR');
  const jugadoresFiltrados = jugadores.filter((jugador) => normalizar(`${jugador.nombre} ${jugador.apellido}`).includes(normalizar(busqueda.trim())));
  const descripcionFiltro = busqueda.trim() ? `Filtro: “${busqueda.trim()}” · ${jugadoresFiltrados.length} jugador${jugadoresFiltrados.length === 1 ? '' : 'es'}` : `${jugadoresFiltrados.length} jugador${jugadoresFiltrados.length === 1 ? '' : 'es'} en el plantel`;

  useEffect(() => setBusqueda(''), [state.selectedEquipoDeportivoId]);

  const descargarCsv = () => {
    const filas = [
      ['Nombre', 'Apellido', 'Fecha de nacimiento', 'Edad', 'Teléfono', 'Estado'],
      ...jugadoresFiltrados.map((jugador) => [jugador.nombre, jugador.apellido, jugador.fechaNacimiento, edad(jugador.fechaNacimiento), jugador.telefono, jugador.estado === 'disponible' ? 'Disponible' : 'Lesionado']),
    ];
    const contenido = `\uFEFF${filas.map((fila) => fila.map(csvCell).join(',')).join('\r\n')}`;
    const enlace = document.createElement('a');
    const url = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }));
    enlace.href = url;
    enlace.download = `plantel-${slug(equipo?.nombre || 'club')}-${fechaLocalISO()}.csv`;
    enlace.style.display = 'none';
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="roster-screen" style={{ animation: 'fadeIn .3s ease' }}>
      <div className="no-print">
        <div className="roster-header">
          <div><div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Planteles</div><div style={{ color: '#6b7488', fontSize: 14, marginTop: 3 }}>Jugadores del equipo y su disponibilidad actual.</div></div>
          <button onClick={actions.openAgregarJugador} style={addButton}>+ Agregar jugador</button>
        </div>

        <section style={toolbar}>
          <div style={{ display: 'flex', alignItems: 'end', gap: 8, flexWrap: 'wrap' }}>
            <label style={{ color: '#4b5468', fontWeight: 700, fontSize: 13 }}>
              Equipo o categoría
              <select value={state.selectedEquipoDeportivoId} onChange={(e) => actions.selectEquipoDeportivo(Number(e.target.value))} style={selectStyle}>
                {state.equiposDeportivos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
              </select>
            </label>
            <button onClick={actions.openAgregarEquipoDeportivo} style={newTeamButton}>+ Nuevo plantel</button>
          </div>
          <div style={{ display: 'flex', gap: 18, paddingBottom: 3 }}>
            <div><div style={statNumber}>{jugadores.length}</div><div style={statLabel}>JUGADORES</div></div>
            <div><div style={{ ...statNumber, color: '#1a7d43' }}>{disponibles}</div><div style={statLabel}>DISPONIBLES</div></div>
          </div>
        </section>

        {jugadores.length > 0 && <div className="roster-controls">
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o apellido" aria-label="Buscar jugador" className="roster-search" />
          <div className="roster-actions">
            <div className="view-toggle" role="group" aria-label="Cambiar vista">
              <button aria-pressed={vista === 'lista'} className={vista === 'lista' ? 'active' : ''} onClick={() => setVista('lista')}>Lista</button>
              <button aria-pressed={vista === 'grilla'} className={vista === 'grilla' ? 'active' : ''} onClick={() => setVista('grilla')}>Grilla</button>
            </div>
            <button type="button" disabled={!jugadoresFiltrados.length} onClick={descargarCsv} className="roster-utility">Exportar CSV</button>
            <button type="button" disabled={!jugadoresFiltrados.length} onClick={() => window.print()} className="roster-utility">Imprimir / PDF</button>
          </div>
        </div>}

        {jugadoresFiltrados.length ? vista === 'lista' ? <ListaJugadores jugadores={jugadoresFiltrados} /> : <GrillaJugadores jugadores={jugadoresFiltrados} /> : <div style={empty}><div style={{ fontWeight: 800, color: '#16203a', fontSize: 16 }}>{jugadores.length ? 'No encontramos jugadores con esa búsqueda' : 'Todavía no hay jugadores en este plantel'}</div><div style={{ color: '#6b7488', fontSize: 14, marginTop: 5 }}>{jugadores.length ? 'Probá con otro nombre o apellido.' : 'Agregá el primero para comenzar a organizarlo.'}</div></div>}
      </div>
      <VistaImpresion jugadores={jugadoresFiltrados} plantel={equipo?.nombre || 'Plantel'} filtro={descripcionFiltro} />
    </div>
  );
}

function ListaJugadores({ jugadores }: { jugadores: Jugador[] }) {
  const { actions } = useApp();
  return <div className="player-list">
    <div className="player-list-head"><span>Jugador</span><span>Edad</span><span>Teléfono</span><span>Estado</span><span>Acciones</span></div>
    {jugadores.map((jugador) => <div key={jugador.id} className="player-list-row">
      <div className="player-identity">{jugador.foto ? <img src={jugador.foto} alt="" className="player-list-photo" /> : <div className="player-list-avatar">{iniciales(jugador)}</div>}<div><strong>{jugador.nombre} {jugador.apellido}</strong><small>Fecha nac.: {jugador.fechaNacimiento}</small><small className="player-compact-details">{edad(jugador.fechaNacimiento)} años · Tel. {jugador.telefono}</small></div></div>
      <span className="player-list-age">{edad(jugador.fechaNacimiento)} años</span>
      <span className="player-list-phone">{jugador.telefono}</span>
      <span className={jugador.estado === 'disponible' ? 'player-status available' : 'player-status injured'}>{jugador.estado === 'disponible' ? 'Disponible' : 'Lesionado'}</span>
      <div className="player-list-actions"><a aria-label={`Contactar a ${jugador.nombre} ${jugador.apellido} por WhatsApp`} href={`https://wa.me/${telefonoWhatsApp(jugador.telefono)}`} target="_blank" rel="noreferrer">WhatsApp</a><button aria-label={`Editar a ${jugador.nombre} ${jugador.apellido}`} onClick={() => actions.openEditarJugador(jugador.id)}>Editar</button><button aria-label={`Eliminar a ${jugador.nombre} ${jugador.apellido}`} className="delete" onClick={() => window.confirm(`¿Eliminar a ${jugador.nombre} ${jugador.apellido} del plantel?`) && actions.eliminarJugador(jugador.id)}>Eliminar</button></div>
    </div>)}
  </div>;
}

function GrillaJugadores({ jugadores }: { jugadores: Jugador[] }) {
  const { actions } = useApp();
  return <div className="roster-grid">{jugadores.map((jugador) => <article key={jugador.id} className="player-card">
    <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
      {jugador.foto ? <img src={jugador.foto} alt={`${jugador.nombre} ${jugador.apellido}`} className="player-photo" /> : <div className="player-avatar">{iniciales(jugador)}</div>}
      <div style={{ minWidth: 0, flex: 1 }}><div style={{ color: '#16203a', fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{jugador.nombre} {jugador.apellido}</div><div style={{ color: '#6b7488', fontSize: 13, marginTop: 3 }}>{edad(jugador.fechaNacimiento)} años</div></div>
      <span className={jugador.estado === 'disponible' ? 'player-status available' : 'player-status injured'}>{jugador.estado === 'disponible' ? 'Disponible' : 'Lesionado'}</span>
    </div>
    <div style={{ color: '#6b7488', fontSize: 13, margin: '16px 0 14px' }}>Tel. {jugador.telefono}</div>
    <div style={{ display: 'flex', gap: 8 }}><a aria-label={`Contactar a ${jugador.nombre} ${jugador.apellido} por WhatsApp`} href={`https://wa.me/${telefonoWhatsApp(jugador.telefono)}`} target="_blank" rel="noreferrer" style={whatsappButton}>Contactar por WhatsApp</a><button aria-label={`Editar a ${jugador.nombre} ${jugador.apellido}`} onClick={() => actions.openEditarJugador(jugador.id)} style={iconButton}>Editar</button><button aria-label={`Eliminar a ${jugador.nombre} ${jugador.apellido}`} onClick={() => window.confirm(`¿Eliminar a ${jugador.nombre} ${jugador.apellido} del plantel?`) && actions.eliminarJugador(jugador.id)} style={{ ...iconButton, color: '#b32b3d' }}>Eliminar</button></div>
  </article>)}</div>;
}

function VistaImpresion({ jugadores, plantel, filtro }: { jugadores: Jugador[]; plantel: string; filtro: string }) {
  return <section className="print-roster"><h1>{plantel}</h1><p>{filtro}</p><p className="print-date">Listado generado el {fechaLocalISO()}</p><table><thead><tr><th>Jugador</th><th>Fecha de nacimiento</th><th>Edad</th><th>Teléfono</th><th>Estado</th></tr></thead><tbody>{jugadores.map((jugador) => <tr key={jugador.id}><td>{jugador.nombre} {jugador.apellido}</td><td>{jugador.fechaNacimiento}</td><td>{edad(jugador.fechaNacimiento)} años</td><td>{jugador.telefono}</td><td>{jugador.estado === 'disponible' ? 'Disponible' : 'Lesionado'}</td></tr>)}</tbody></table></section>;
}

const toolbar = { margin: '22px 0 18px', padding: '14px 16px', border: '1px solid #e3e7ef', borderRadius: 13, background: '#fff', display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' as const };
const selectStyle = { display: 'block', marginTop: 7, minWidth: 220, height: 40, border: '1px solid #d7dce6', borderRadius: 8, color: '#16203a', background: '#fff', padding: '0 10px', fontSize: 14 };
const newTeamButton = { height: 40, border: '1px solid #b7d9d4', borderRadius: 8, padding: '0 11px', background: '#fff', color: '#087f75', fontWeight: 800, fontSize: 12, cursor: 'pointer' };
const addButton = { border: 'none', borderRadius: 9, padding: '11px 14px', background: '#087f75', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' };
const statNumber = { color: '#16203a', fontSize: 20, fontWeight: 800, lineHeight: 1 };
const statLabel = { color: '#8b93a5', fontSize: 10, fontWeight: 800, letterSpacing: '.06em', marginTop: 5 };
const whatsappButton = { flex: 1, textAlign: 'center' as const, textDecoration: 'none', borderRadius: 8, padding: '9px 8px', background: '#e0f3f0', color: '#087f75', fontWeight: 800, fontSize: 12 };
const iconButton = { border: '1px solid #e3e7ef', borderRadius: 8, padding: '8px 8px', color: '#4b5468', background: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' };
const empty = { padding: 28, border: '1px dashed #cbd3df', borderRadius: 14, background: '#fff', textAlign: 'center' as const };
