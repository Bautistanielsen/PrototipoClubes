import { useEffect, useRef, useState } from 'react';
import type { Formacion, Jugador, RolFormacion, SistemaFormacion } from '../types';
import { useApp } from '../state/AppContext';

const SISTEMAS: SistemaFormacion[] = ['4-4-2', '4-3-3', '4-2-3-1', '4-1-4-1', '4-3-1-2', '4-1-2-1-2', '4-2-2-2', '4-5-1', '3-5-2', '3-4-3', '3-4-2-1', '3-4-1-2', '3-2-4-1', '5-3-2', '5-4-1'];
const ROLES: Array<{ key: RolFormacion; label: string }> = [{ key: 'capitan', label: 'Capitán' }, { key: 'penales', label: 'Penales' }, { key: 'tiros_libres', label: 'Tiros libres' }, { key: 'corner_izquierdo', label: 'Córner izquierdo' }, { key: 'corner_derecho', label: 'Córner derecho' }];
const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const nombreJugador = (nombre: string, apellido: string) => `${nombre} ${apellido}`;
const inicialesJugador = (jugador: Jugador) => `${jugador.nombre[0] || ''}${jugador.apellido[0] || ''}`.toUpperCase();

function AvatarJugador({ jugador }: { jugador: Jugador }) {
  const [fotoError, setFotoError] = useState(false);
  return <span className="formation-player-avatar" aria-hidden="true">
    {jugador.foto && !fotoError ? <img src={jugador.foto} alt="" onError={() => setFotoError(true)} /> : inicialesJugador(jugador)}
  </span>;
}

function MarcadoCancha() {
  return <svg className="pitch-markings" viewBox="0 0 100 145" preserveAspectRatio="none" aria-hidden="true">
    <g className="pitch-lines">
      <rect x="1.25" y="1.25" width="97.5" height="142.5" />
      <path d="M1.25 72.5h97.5M20 1.25v20h60v-20M35 1.25v8h30v-8M20 143.75v-20h60v20M35 143.75v-8h30v8" />
      <circle cx="50" cy="72.5" r="12" />
      <circle className="pitch-spot" cx="50" cy="72.5" r=".8" />
      <circle className="pitch-spot" cx="50" cy="15" r=".8" />
      <circle className="pitch-spot" cx="50" cy="130" r=".8" />
      <path d="M40.7 21.25a10.5 10.5 0 0 0 18.6 0M40.7 123.75a10.5 10.5 0 0 1 18.6 0" />
      <path d="M1.25 5.5a4.25 4.25 0 0 1 4.25-4.25M98.75 5.5A4.25 4.25 0 0 0 94.5 1.25M1.25 139.5a4.25 4.25 0 0 0 4.25 4.25M98.75 139.5a4.25 4.25 0 0 1-4.25 4.25" />
      <path className="pitch-goal" d="M43 1.25v3.75h14v-3.75M43 143.75v-3.75h14v3.75" />
    </g>
  </svg>;
}

function fichaSvg(formacion: Formacion) {
  const { principal, secundaria } = formacion.camiseta;
  return `<circle r="29" fill="${esc(principal)}" stroke="${esc(secundaria)}" stroke-width="6"/>`;
}

function dividirNombre(nombre: string) {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (nombre.length <= 17 || palabras.length < 2) return [nombre];
  const puntoMedio = Math.ceil(palabras.length / 2);
  return [palabras.slice(0, puntoMedio).join(' '), palabras.slice(puntoMedio).join(' ')];
}

function acotarLineaNombre(nombre: string) {
  return nombre.length > 19 ? `${nombre.slice(0, 18).trimEnd()}…` : nombre;
}

function fichasSvg(formacion: Formacion, jugadores: Jugador[], anchoCancha: number, altoCancha: number, xCancha: number, yCancha: number) {
  const titulares = formacion.jugadores.filter((item) => item.zona === 'titular');
  return titulares.map((item) => {
    const jugador = jugadores.find((entry) => entry.id === item.jugadorId);
    if (!jugador) return '';
    const posicion = limitarPosicionFicha((item.x / 100) * anchoCancha, (item.y / 100) * altoCancha, anchoCancha, altoCancha);
    const x = xCancha + posicion.x;
    const y = yCancha + posicion.y;
    const nombre = dividirNombre(nombreJugador(jugador.nombre, jugador.apellido));
    const lineasNombre = nombre.map((linea, indice) => '<text y="' + (52 + indice * 19) + '" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#ffffff">' + esc(acotarLineaNombre(linea)) + '</text>').join('');
    const capitan = formacion.roles.capitan === item.jugadorId
      ? '<circle cx="25" cy="-25" r="12" fill="#f8fafc"/><text x="25" y="-20" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="900" fill="#101418">C</text>'
      : '';
    return '<g transform="translate(' + x + ' ' + y + ')">' + fichaSvg(formacion) + '<text y="7" text-anchor="middle" font-family="Arial, sans-serif" font-size="21" font-weight="900" fill="' + esc(formacion.camiseta.texto) + '">' + esc(item.dorsal || '') + '</text>' + capitan + lineasNombre + '</g>';
  }).join('');
}

function lineasCanchaSvg(anchoCancha: number, altoCancha: number, xCancha: number, yCancha: number) {
  return '<g transform="translate(' + xCancha + ' ' + yCancha + ') scale(' + (anchoCancha / 100) + ' ' + (altoCancha / 145) + ')" fill="none" stroke="#d9f5df" stroke-width=".75" vector-effect="non-scaling-stroke"><rect x="1.25" y="1.25" width="97.5" height="142.5"/><path d="M1.25 72.5h97.5M20 1.25v20h60v-20M35 1.25v8h30v-8M20 143.75v-20h60v20M35 143.75v-8h30v8"/><circle cx="50" cy="72.5" r="12"/><circle cx="50" cy="72.5" r=".8" fill="#d9f5df" stroke="none"/><circle cx="50" cy="15" r=".8" fill="#d9f5df" stroke="none"/><circle cx="50" cy="130" r=".8" fill="#d9f5df" stroke="none"/><path d="M40.7 21.25a10.5 10.5 0 0 0 18.6 0M40.7 123.75a10.5 10.5 0 0 1 18.6 0M1.25 5.5a4.25 4.25 0 0 1 4.25-4.25M98.75 5.5A4.25 4.25 0 0 0 94.5 1.25M1.25 139.5a4.25 4.25 0 0 0 4.25 4.25M98.75 139.5a4.25 4.25 0 0 1-4.25 4.25"/><path d="M43 1.25v3.75h14v-3.75M43 143.75v-3.75h14v3.75"/></g>';
}

function construirSvgFormacion(formacion: Formacion, equipo: { nombre: string }, jugadores: Jugador[], clubNombre: string) {
  const altoCancha = 930;
  const anchoCancha = altoCancha / 145 * 100;
  const xCancha = (900 - anchoCancha) / 2;
  const yCancha = 195;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">',
    '<rect width="900" height="1200" fill="#101418"/><rect x="0" y="151" width="900" height="1" fill="#2a323a"/>',
    '<text x="450" y="58" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="2.5" fill="#a9b4bc">FORMACIÓN</text>',
    '<text x="450" y="101" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#f8fafc">' + esc(clubNombre) + '</text>',
    '<text x="450" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="600" fill="#c7d0d6">' + esc(equipo.nombre) + ' · ' + esc(formacion.nombre) + '</text>',
    '<rect x="' + xCancha + '" y="' + yCancha + '" width="' + anchoCancha + '" height="' + altoCancha + '" rx="20" fill="#158b50"/>',
    lineasCanchaSvg(anchoCancha, altoCancha, xCancha, yCancha),
    fichasSvg(formacion, jugadores, anchoCancha, altoCancha, xCancha, yCancha),
    '<text x="450" y="1165" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="600" fill="#8a969f">Gestión deportiva</text></svg>',
  ].join('');
}

function construirSvgCanchaSolo(formacion: Formacion, jugadores: Jugador[]) {
  const anchoCancha = 700;
  const altoCancha = anchoCancha / 100 * 145;
  return {
    width: anchoCancha,
    height: altoCancha,
    svg: [
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + anchoCancha + '" height="' + altoCancha + '" viewBox="0 0 ' + anchoCancha + ' ' + altoCancha + '">',
      '<rect width="' + anchoCancha + '" height="' + altoCancha + '" rx="20" fill="#158b50"/>',
      lineasCanchaSvg(anchoCancha, altoCancha, 0, 0),
      fichasSvg(formacion, jugadores, anchoCancha, altoCancha, 0, 0),
      '</svg>',
    ].join(''),
  };
}

function renderizarFormacionPng(svg: string, width = 900, height = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas no disponible');
        context.drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo cargar la imagen')); };
    image.src = url;
  });
}

function limitarPosicionFicha(x: number, y: number, width: number, height: number) {
  const horizontalPadding = Math.min(64, width / 2);
  const verticalTopPadding = Math.min(40, height / 2);
  const verticalBottomPadding = Math.min(72, height / 2);
  return {
    x: Math.max(horizontalPadding, Math.min(width - horizontalPadding, x)),
    y: Math.max(verticalTopPadding, Math.min(height - verticalBottomPadding, y)),
  };
}

export default function Formaciones() {
  const { state, actions } = useApp();
  const [tamanoCancha, setTamanoCancha] = useState({ width: 0, height: 0 });
  const canchaRef = useRef<HTMLDivElement>(null);
  const equipoId = state.activeEquipoDeportivoId ?? -1;
  const equipo = state.equiposDeportivos.find((item) => item.id === equipoId);
  const formaciones = state.formaciones.filter((item) => item.equipoId === equipoId);
  const formacion = formaciones.find((item) => item.id === state.selectedFormacionId) || formaciones[0];
  const jugadores = state.jugadores.filter((item) => item.equipoId === equipoId);

  useEffect(() => {
    const cancha = canchaRef.current;
    if (!cancha) return undefined;
    const actualizarTamano = () => setTamanoCancha({ width: cancha.clientWidth, height: cancha.clientHeight });
    actualizarTamano();
    const observador = new ResizeObserver(actualizarTamano);
    observador.observe(cancha);
    return () => observador.disconnect();
  }, [formacion?.id]);

  const posicionVisible = (x: number, y: number) => {
    const width = tamanoCancha.width || 440;
    const height = tamanoCancha.height || 475;
    const posicion = limitarPosicionFicha((x / 100) * width, (y / 100) * height, width, height);
    return {
      left: `${posicion.x / width * 100}%`,
      top: `${posicion.y / height * 100}%`,
    };
  };

  const moverEnCancha = (jugadorId: number, event: React.PointerEvent<HTMLButtonElement>) => {
    const cancha = canchaRef.current;
    if (!cancha || !formacion) return;
    const pointerId = event.pointerId;
    event.currentTarget.setPointerCapture(pointerId);
    const mover = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      const rect = cancha.getBoundingClientRect();
      const posicion = limitarPosicionFicha(moveEvent.clientX - rect.left, moveEvent.clientY - rect.top, rect.width, rect.height);
      actions.moverJugadorFormacion(formacion.id, jugadorId, 'titular', (posicion.x / rect.width) * 100, (posicion.y / rect.height) * 100);
    };
    const limpiar = (endEvent?: PointerEvent) => { if (endEvent && endEvent.pointerId !== pointerId) return; window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', limpiar); window.removeEventListener('pointercancel', limpiar); window.removeEventListener('lostpointercapture', limpiar); };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', limpiar);
    window.addEventListener('pointercancel', limpiar);
    window.addEventListener('lostpointercapture', limpiar);
  };

  const exportar = async () => {
    if (!formacion || !equipo) return;
    try {
      const svg = construirSvgFormacion(formacion, equipo, jugadores, state.clubNombre);
      const dataUrl = await renderizarFormacionPng(svg);
      const link = document.createElement('a');
      link.download = `${formacion.nombre.replace(/\s+/g, '-').toLowerCase() || 'formacion'}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      actions.mostrarToast('PNG exportado');
    } catch {
      actions.mostrarToast('No se pudo exportar la formación');
    }
  };

  const avisarASocios = async () => {
    if (!formacion || !equipo) return;
    try {
      const { svg, width, height } = construirSvgCanchaSolo(formacion, jugadores);
      const dataUrl = await renderizarFormacionPng(svg, width, height);
      actions.publicarFormacionComoNovedad(formacion.id, dataUrl);
    } catch {
      actions.publicarFormacionComoNovedad(formacion.id);
    }
  };

  const normalizarNombre = () => { if (formacion) actions.normalizarNombreFormacion(formacion.id); };
  const jugadorAsignado = (jugadorId: number) => formacion.jugadores.some((item) => item.jugadorId === jugadorId);
  const FilaAsignada = ({ item }: { item: Formacion['jugadores'][number] }) => {
    const jugador = jugadores.find((entry) => entry.id === item.jugadorId);
    if (!jugador) return null;
    const nombre = nombreJugador(jugador.nombre, jugador.apellido);
    const esTitular = item.zona === 'titular';
    return <div className="bench-player" key={item.jugadorId}>
      <AvatarJugador jugador={jugador} />
      <span>{nombre}</span>
      <input aria-label={`Dorsal de ${nombre}`} inputMode="numeric" value={item.dorsal} maxLength={3} onChange={(event) => actions.actualizarFormacion(formacion.id, { jugadores: formacion.jugadores.map((entry) => entry.jugadorId === item.jugadorId ? { ...entry, dorsal: event.target.value.replace(/\D/g, '').slice(0, 3) } : entry) })}/>
      <button aria-label={esTitular ? `Bajar a ${nombre} a suplentes` : `Subir a ${nombre} a titulares`} onClick={() => actions.moverJugadorFormacion(formacion.id, jugador.id, esTitular ? 'suplente' : 'titular', 50, 50)}>{esTitular ? 'Supl.' : 'Cancha'}</button>
      <button aria-label={`Quitar a ${nombre} de la formación`} onClick={() => actions.quitarJugadorFormacion(formacion.id, jugador.id)}>×</button>
    </div>;
  };
  const FilaDisponible = ({ jugador, lesionado = false }: { jugador: Jugador; lesionado?: boolean }) => {
    const nombre = nombreJugador(jugador.nombre, jugador.apellido);
    return <button aria-label={`Agregar a ${nombre} como suplente`} className={`formation-player${lesionado ? ' injured' : ''}`} onClick={() => actions.moverJugadorFormacion(formacion.id, jugador.id, 'suplente')}>
      <AvatarJugador jugador={jugador} />
      <b>{nombre}</b>
      {lesionado && <em>Lesionado</em>}
      <i>+ supl.</i>
    </button>;
  };
  return <section className="formation-screen">
    <header className="formation-header"><div><h1>Formaciones</h1><p>Prepará tu once de {equipo?.nombre || 'este plantel'}.</p></div></header>
    <div className="formation-tabs">{formaciones.map((item) => <button className={formacion?.id === item.id ? 'active' : ''} key={item.id} onClick={() => actions.seleccionarFormacion(item.id)}>{item.nombre}</button>)}{formacion && <button aria-label="Crear una nueva formación" className="new" onClick={() => actions.crearFormacion(formacion.sistema)}>+ Nueva formación</button>}</div>
    {!formacion ? <div className="formation-empty"><h2>Tu primera pizarra está lista</h2><p>Creá “Formación 1”. Después podés elegir el sistema y mover todo libremente.</p><button onClick={() => actions.crearFormacion('4-3-3')}>+ Nueva formación</button></div> : <div className="formation-layout">
      <aside className="formation-panel">
        <div className="panel-title"><span>Jugadores</span><small>{formacion.jugadores.filter((item) => item.zona === 'titular').length}/11 titulares</small></div>
        <div className="player-zone-title">Disponibles</div>
        {jugadores.filter((jugador) => jugador.estado === 'disponible' && !jugadorAsignado(jugador.id)).map((jugador) => <FilaDisponible key={jugador.id} jugador={jugador} />)}
        <div className="player-zone-title">Titulares</div>
        {formacion.jugadores.filter((item) => item.zona === 'titular').map((item) => <FilaAsignada key={item.jugadorId} item={item} />)}
        <div className="player-zone-title">Suplentes</div>
        {formacion.jugadores.filter((item) => item.zona === 'suplente').map((item) => <FilaAsignada key={item.jugadorId} item={item} />)}
        <div className="player-zone-title">Lesionados</div>
        {jugadores.filter((jugador) => jugador.estado === 'lesionado' && !jugadorAsignado(jugador.id)).map((jugador) => <FilaDisponible key={jugador.id} jugador={jugador} lesionado />)}
      </aside>
      <div className="formation-board"><div className="formation-board-tools"><input aria-label="Nombre de la formación" value={formacion.nombre} onChange={(event) => actions.actualizarFormacion(formacion.id, { nombre: event.target.value })} onBlur={normalizarNombre}/><label>Sistema<select value={formacion.sistema} onChange={(event) => actions.cambiarSistemaFormacion(formacion.id, event.target.value as SistemaFormacion)}>{SISTEMAS.map((item) => <option key={item}>{item}</option>)}</select></label><button aria-label="Duplicar formación" onClick={() => actions.duplicarFormacion(formacion.id)}>Duplicar</button><button aria-label="Eliminar formación" className="danger" onClick={() => actions.eliminarFormacion(formacion.id)}>Eliminar</button></div><div className="pitch" ref={canchaRef}><MarcadoCancha />{formacion.jugadores.filter((item) => item.zona === 'titular').map((item) => { const jugador = jugadores.find((entry) => entry.id === item.jugadorId); const posicion = posicionVisible(item.x, item.y); return jugador && <button aria-label={`Mover a ${nombreJugador(jugador.nombre, jugador.apellido)} en la cancha`} key={item.jugadorId} className="player-marker" onPointerDown={(event) => moverEnCancha(item.jugadorId, event)} style={{ ...posicion, '--marker-main': formacion.camiseta.principal, '--marker-border': formacion.camiseta.secundaria, '--marker-text': formacion.camiseta.texto } as React.CSSProperties}><span className="player-marker-disc"><span className="player-marker-number">{item.dorsal}</span></span>{formacion.roles.capitan === item.jugadorId && <strong className="player-marker-captain">C</strong>}<span className="player-marker-name">{nombreJugador(jugador.nombre, jugador.apellido)}</span></button>; })}</div><button className="export-button" onClick={exportar}>Exportar PNG</button><button aria-label="Avisar a los socios" className="publish-button" onClick={avisarASocios}>Avisar a los socios</button></div>
      <aside className="formation-panel formation-settings"><div className="panel-title">Ficha de jugador</div>{([['principal', 'Color principal'], ['secundaria', 'Color del borde'], ['texto', 'Color del dorsal']] as const).map(([key, label]) => <label key={key}>{label}<input type="color" value={formacion.camiseta[key]} onChange={(event) => actions.actualizarFormacion(formacion.id, { camiseta: { ...formacion.camiseta, [key]: event.target.value } })}/></label>)}<div className="panel-title roles-title">Roles</div>{ROLES.map((rol) => <label key={rol.key}>{rol.label}<select value={formacion.roles[rol.key] || ''} onChange={(event) => actions.actualizarFormacion(formacion.id, { roles: { ...formacion.roles, [rol.key]: event.target.value ? Number(event.target.value) : undefined } })}><option value="">Sin asignar</option>{formacion.jugadores.map((item) => { const jugador = jugadores.find((entry) => entry.id === item.jugadorId); return jugador && <option key={jugador.id} value={jugador.id}>{nombreJugador(jugador.nombre, jugador.apellido)}</option>; })}</select></label>)}</aside>
    </div>}
  </section>;
}
