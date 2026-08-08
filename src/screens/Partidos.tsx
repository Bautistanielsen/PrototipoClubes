import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { parseFinalizedResult, readSportsCalendarData } from '../lib/sportsCalendar';
import type { Acta, Evento, FinalizedResult } from '../lib/sportsCalendar';

type FiltroEstado = 'todos' | 'finalizado' | 'programado' | 'suspendido' | 'postergado';
type DatosCalendario = { eventos: Evento[]; actas: Record<string, Acta> };

const nombreJugador = (nombre: string, apellido: string) => `${nombre} ${apellido}`;
function nombreEstado(estado: FiltroEstado) {
  if (estado === 'finalizado') return 'Finalizado';
  if (estado === 'suspendido') return 'Suspendido';
  if (estado === 'postergado') return 'Postergado';
  return 'Programado';
}
const fechaLarga = (fecha: string) => new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${fecha}T12:00:00`));

function estadoDe(evento: Evento): FiltroEstado {
  return evento.estado === 'finalizado' || evento.estado === 'suspendido' || evento.estado === 'postergado' ? evento.estado : 'programado';
}

function classResultado(resultado: Pick<FinalizedResult, 'club' | 'rival'>) {
  if (resultado.club > resultado.rival) return 'win';
  if (resultado.club < resultado.rival) return 'loss';
  return 'draw';
}

export default function Partidos() {
  const { state, actions } = useApp();
  const [datos, setDatos] = useState<DatosCalendario>({ eventos: [], actas: {} });
  const [competencia, setCompetencia] = useState('todas');
  const [estado, setEstado] = useState<FiltroEstado>('todos');
  const [actaAbierta, setActaAbierta] = useState<number | null>(null);

  useEffect(() => {
    setDatos(readSportsCalendarData());
  }, []);
  useEffect(() => {
    setCompetencia('todas');
    setEstado('todos');
    setActaAbierta(null);
  }, [state.selectedEquipoDeportivoId]);

  const equipo = state.equiposDeportivos.find((item) => item.id === state.selectedEquipoDeportivoId);
  const partidosEquipo = useMemo(() => datos.eventos
    .filter((evento) => evento.tipo === 'Partido' && evento.equipoId === state.selectedEquipoDeportivoId)
    .sort((a, b) => `${b.fecha}${b.horaInicio || ''}`.localeCompare(`${a.fecha}${a.horaInicio || ''}`)), [datos.eventos, state.selectedEquipoDeportivoId]);
  const competencias = [...new Set(partidosEquipo.map((partido) => partido.competencia || 'Liga'))];
  const partidos = partidosEquipo.filter((partido) => (competencia === 'todas' || (partido.competencia || 'Liga') === competencia) && (estado === 'todos' || estadoDe(partido) === estado));
  const resumen = partidosEquipo.reduce((acumulado, partido) => {
    const resultado = parseFinalizedResult(partido, datos.actas[String(partido.id)]);
    if (!resultado) return acumulado;
    acumulado.pj += 1; acumulado.gf += resultado.club; acumulado.gc += resultado.rival;
    if (resultado.club > resultado.rival) acumulado.v += 1;
    else if (resultado.club < resultado.rival) acumulado.d += 1;
    else acumulado.e += 1;
    return acumulado;
  }, { pj: 0, v: 0, e: 0, d: 0, gf: 0, gc: 0 });

  return <section className="matches-screen">
    <header className="matches-header">
      <div><span className="matches-kicker">GESTIÓN DEPORTIVA</span><h1>Partidos</h1><p>Historial, resultados y actas de cada plantel.</p></div>
      <label className="matches-team-select">Plantel<select value={state.selectedEquipoDeportivoId} onChange={(event) => actions.selectEquipoDeportivo(Number(event.target.value))}>{state.equiposDeportivos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
    </header>

    <div className="matches-filters" aria-label="Filtros de partidos">
      <label>Competencia<select value={competencia} onChange={(event) => setCompetencia(event.target.value)}><option value="todas">Todas las competencias</option>{competencias.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Estado<select value={estado} onChange={(event) => setEstado(event.target.value as FiltroEstado)}><option value="todos">Todos los estados</option><option value="finalizado">Finalizados</option><option value="programado">Programados</option><option value="suspendido">Suspendidos</option><option value="postergado">Postergados</option></select></label>
    </div>

    <div className="matches-summary" aria-label="Resumen de resultados">
      <div><span>Partidos jugados</span><b>{resumen.pj}</b></div>
      <div className="positive"><span>Victorias</span><b>{resumen.v}</b></div>
      <div className="neutral"><span>Empates</span><b>{resumen.e}</b></div>
      <div className="negative"><span>Derrotas</span><b>{resumen.d}</b></div>
      <div className="goals"><span>Goles a favor</span><b>{resumen.gf}</b></div>
      <div className="goals-against"><span>Goles en contra</span><b>{resumen.gc}</b></div>
    </div>

    <div className="matches-list-heading"><div><h2>Historial de partidos</h2><p>{equipo ? equipo.nombre : 'Plantel'} · más recientes primero</p></div><button className="matches-agenda-link" onClick={() => actions.navigate('calendario')}>Ir a Agenda deportiva →</button></div>
    {!partidos.length ? <div className="matches-empty"><h2>No hay partidos para estos filtros</h2><p>Cuando cargues un partido en Agenda deportiva, va a aparecer acá junto con su acta.</p><button onClick={() => actions.navigate('calendario')}>Abrir Agenda deportiva</button></div> : <div className="matches-list">{partidos.map((partido) => <PartidoCard key={partido.id} partido={partido} acta={datos.actas[String(partido.id)]} abierta={actaAbierta === partido.id} onToggle={() => setActaAbierta((actual) => actual === partido.id ? null : partido.id)} onAgenda={() => actions.navigate('calendario')} onCompletarActa={() => actions.abrirActaEnCalendario(partido.id)} jugadores={state.jugadores} clubNombre={state.clubNombre} />)}</div>}
  </section>;
}

function PartidoCard({ partido, acta, abierta, onToggle, onAgenda, onCompletarActa, jugadores, clubNombre }: { partido: Evento; acta?: Acta; abierta: boolean; onToggle: () => void; onAgenda: () => void; onCompletarActa: () => void; jugadores: ReturnType<typeof useApp>['state']['jugadores']; clubNombre: string }) {
  const estado = estadoDe(partido);
  const resultado = parseFinalizedResult(partido, acta);
  const resultadoClase = resultado ? classResultado(resultado) : estado;
  const etiquetaResultado = resultadoClase === 'win' ? 'Victoria' : resultadoClase === 'draw' ? 'Empate' : resultadoClase === 'loss' ? 'Derrota' : nombreEstado(estado);
  const puedeVerActa = !!acta;
  const detalleId = `acta-partido-${partido.id}`;
  return <article className={`match-card-detail ${resultadoClase}`}>
    <div className="match-card-main">
      <header className="match-competition"><span>{partido.competencia || 'Liga'}</span><span>{partido.condicion || 'Local'} · {fechaLarga(partido.fecha)}</span></header>
      <div className="match-scoreboard">
        <span className={`match-status ${resultadoClase}`}>{etiquetaResultado}</span>
        <h3><span>{clubNombre}</span><b>{resultado ? `${resultado.club} — ${resultado.rival}` : 'vs.'}</b><span>{partido.rival || 'Rival a definir'}</span></h3>
      </div>
      <div className="match-details"><span><b>Número de fecha</b>{partido.numeroFecha ? `Fecha ${partido.numeroFecha}` : 'No informado'}</span><span><b>Lugar</b>{partido.lugar || 'A definir'}</span><span><b>Horario</b>{partido.horaInicio || 'A definir'}</span></div>
      {(partido.motivo || partido.nuevaFecha) && <p className="match-extra-detail">{partido.motivo || ''}{partido.motivo && partido.nuevaFecha ? ' · ' : ''}{partido.nuevaFecha ? `Nueva fecha: ${fechaLarga(partido.nuevaFecha)}` : ''}</p>}
      <div className="match-card-actions"><button aria-expanded={puedeVerActa ? abierta : undefined} aria-controls={puedeVerActa ? detalleId : undefined} onClick={puedeVerActa ? onToggle : onCompletarActa}>{puedeVerActa ? (abierta ? 'Ocultar acta ↑' : 'Ver acta ↓') : 'Completar acta →'}</button></div>
    </div>
    {abierta && acta && <ActaDetalle id={detalleId} acta={acta} equipoId={partido.equipoId} jugadores={jugadores} onAgenda={onAgenda} />}
  </article>;
}

function ActaDetalle({ id, acta, equipoId, jugadores, onAgenda }: { id: string; acta: Acta; equipoId: number; jugadores: ReturnType<typeof useApp>['state']['jugadores']; onAgenda: () => void }) {
  const mapa = new Map(Object.entries(acta.jugadoresSnapshot || {}).filter(([, player]) => player.equipoId === equipoId && player.displayName).map(([playerId, player]) => [playerId, player.displayName]));
  jugadores.filter((jugador) => jugador.equipoId === equipoId).forEach((jugador) => { if (!mapa.has(String(jugador.id))) mapa.set(String(jugador.id), nombreJugador(jugador.nombre, jugador.apellido)); });
  const nombre = (id: string) => mapa.get(String(id)) || 'Jugador no disponible';
  const formacion = acta.formacionSnapshot;
  const filas = formacion?.jugadores.map((entrada) => ({ ...entrada, nombre: nombre(String(entrada.jugadorId)), puntaje: acta.puntajes[String(entrada.jugadorId)] })) || [];
  const titulares = filas.filter((item) => item.zona === 'titular'); const suplentes = filas.filter((item) => item.zona === 'suplente');
  const hayIncidencias = Boolean(acta.goles.length || acta.amarillas.length || acta.rojas.length || acta.cambios.length);
  return <div className="match-minutes" id={id}>
    <div className="match-lineup"><div className="match-section-title"><span>FORMACIÓN Y RENDIMIENTO</span><h4>{formacion ? `${formacion.nombre} · ${formacion.sistema}` : 'Sin formación registrada'}</h4></div>{formacion ? <div className="match-lineup-columns"><ListaJugadores titulo="Titulares" jugadores={titulares} /><ListaJugadores titulo="Suplentes" jugadores={suplentes} /></div> : <p className="match-muted">El acta todavía no tiene una formación asociada.</p>}</div>
    {hayIncidencias && <div className="match-incidents"><div className="match-section-title"><span>INCIDENCIAS</span><h4>Detalle del partido</h4></div>{acta.goles.length > 0 && <DetalleIncidencia titulo="Goles">{acta.goles.map((gol, index) => <li key={index}><b>⚽ {nombre(gol.jugadorId)}</b>{gol.asistenciaId && <span>Asistió {nombre(gol.asistenciaId)}</span>}<em>{gol.minuto ? `${gol.minuto}'` : '—'}</em></li>)}</DetalleIncidencia>}{(acta.amarillas.length > 0 || acta.rojas.length > 0) && <DetalleIncidencia titulo="Tarjetas">{acta.amarillas.map((tarjeta, index) => <li key={`a-${index}`}><b><i className="match-card-icon yellow" /> {nombre(tarjeta.jugadorId)}</b><span>Amarilla</span><em>{tarjeta.minuto ? `${tarjeta.minuto}'` : '—'}</em></li>)}{acta.rojas.map((tarjeta, index) => <li key={`r-${index}`}><b><i className="match-card-icon red" /> {nombre(tarjeta.jugadorId)}</b><span>Roja</span><em>{tarjeta.minuto ? `${tarjeta.minuto}'` : '—'}</em></li>)}</DetalleIncidencia>}{acta.cambios.length > 0 && <DetalleIncidencia titulo="Cambios">{acta.cambios.map((cambio, index) => <li key={index}><b>⇄ {nombre(cambio.entraId)}</b><span>por {nombre(cambio.saleId)}</span><em>{cambio.minuto ? `${cambio.minuto}'` : '—'}</em></li>)}</DetalleIncidencia>}</div>}
    {acta.observaciones && <div className="match-notes"><span>OBSERVACIONES TÉCNICAS</span><p>{acta.observaciones}</p></div>}
    <div className="match-detail-footer"><button onClick={onAgenda}>Ir a Agenda deportiva →</button></div>
  </div>;
}

function ListaJugadores({ titulo, jugadores }: { titulo: string; jugadores: Array<{ dorsal: string; nombre: string; puntaje?: string }> }) {
  if (!jugadores.length) return null;
  return <section className="match-players"><h5>{titulo}</h5>{jugadores.map((jugador, index) => <div key={`${jugador.nombre}-${index}`}><b>{jugador.dorsal || '—'}</b><span>{jugador.nombre}</span>{jugador.puntaje && <em>{jugador.puntaje}</em>}</div>)}</section>;
}

function DetalleIncidencia({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return <section className="match-incident"><h5>{titulo}</h5><ul>{children}</ul></section>;
}
