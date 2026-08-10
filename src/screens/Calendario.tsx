import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../state/AppContext';
import type { Formacion } from '../types';
import { emptyActa, readSportsCalendarData, writeSportsCalendarData } from '../lib/sportsCalendar';
import type { Acta, Competencia, EstadoPartido, Evento, Prefs, TipoEvento } from '../lib/sportsCalendar';

const COLORS = ['#087f75', '#6d5bd0', '#d05d24', '#b84b78', '#1776bb', '#8b6c16'];
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function isoDate(year: number, month: number, day: number) { return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }
function addDays(date: Date, amount: number) { const next = new Date(date); next.setDate(next.getDate() + amount); return next; }
function dateFromIso(iso: string) { return new Date(`${iso}T12:00:00`); }
function eventTitle(evento: Evento) {
  if (evento.tipo === 'Partido') return `${evento.condicion === 'Visitante' ? 'vs.' : 'vs.'} ${evento.rival || 'Rival a definir'}`;
  return evento.titulo || evento.tipo;
}
function resultadoPartido(evento: Evento, actas: Record<string, Acta>) {
  const acta = actas[String(evento.id)];
  if (evento.tipo !== 'Partido' || evento.estado !== 'finalizado' || !acta || acta.resultadoClub === undefined || acta.resultadoRival === undefined) return null;
  const club = Number(acta.resultadoClub); const rival = Number(acta.resultadoRival);
  if (!Number.isFinite(club) || !Number.isFinite(rival)) return null;
  return { club, rival, clase: club > rival ? 'win' : club === rival ? 'draw' : 'loss' };
}
function status(evento: Evento) {
  if (evento.tipo !== 'Partido') return null;
  if (evento.estado === 'finalizado' || evento.estado === 'suspendido' || evento.estado === 'postergado') return evento.estado;
  if (!evento.horaInicio) return 'programado';
  const limite = new Date(`${evento.fecha}T${evento.horaInicio}:00`).getTime() + 2 * 60 * 60 * 1000;
  return Date.now() >= limite ? 'pendiente' : 'programado';
}
function expandEventos(eventos: Evento[], desde: string, hasta: string) {
  const result: Evento[] = [];
  eventos.forEach((evento) => {
    if (!evento.recurrencia) { if (evento.fecha >= desde && evento.fecha <= hasta) result.push(evento); return; }
    const inicio = dateFromIso(evento.fecha); const limite = evento.recurrencia.hasta ? dateFromIso(evento.recurrencia.hasta) : dateFromIso(hasta);
    for (let fecha = inicio; fecha <= limite && isoDate(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) <= hasta; fecha = addDays(fecha, 1)) {
      const iso = isoDate(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
      if (iso >= desde && evento.recurrencia.dias.includes(fecha.getDay()) && !evento.exclusiones?.includes(iso)) {
        result.push({ ...evento, ...(evento.overrides?.[iso] || {}), fecha: iso, ocurrenciaDe: { id: evento.id, fecha: iso } });
      }
    }
  });
  return result.sort((a, b) => `${a.fecha}${a.horaInicio || ''}`.localeCompare(`${b.fecha}${b.horaInicio || ''}`));
}

export default function Calendario() {
  const { state, actions } = useApp();
  const calendarDataRef = useRef<ReturnType<typeof readSportsCalendarData> | null>(null);
  if (calendarDataRef.current === null) calendarDataRef.current = readSportsCalendarData();
  const initialData = calendarDataRef.current;
  const initialActaEvento = state.actaEventoPendienteId === null
    ? null
    : initialData.eventos.find((item) => item.id === state.actaEventoPendienteId && item.tipo === 'Partido') || null;
  const [cursor, setCursor] = useState(() => {
    const fecha = initialActaEvento ? dateFromIso(initialActaEvento.fecha) : new Date(2026, 7, 5);
    return { year: fecha.getFullYear(), month: fecha.getMonth(), day: fecha.getDate() };
  });
  const [vista, setVista] = useState<'mes' | 'semana'>('mes');
  const [eventos, setEventos] = useState<Evento[]>(() => initialData.eventos);
  const [actas, setActas] = useState<Record<string, Acta>>(() => initialData.actas);
  const [prefs, setPrefs] = useState<Prefs>(() => initialData.prefs);
  const [editor, setEditor] = useState<Evento | null>(null);
  const [detalleDia, setDetalleDia] = useState<string | null>(null);
  const [actaEvento, setActaEvento] = useState<Evento | null>(() => initialActaEvento);
  const [hydrated, setHydrated] = useState(false);
  const [, setClock] = useState(0);

  useEffect(() => {
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) writeSportsCalendarData({ eventos, actas, prefs }); }, [eventos, actas, prefs, hydrated]);
  useEffect(() => { if (hydrated) setPrefs((prev) => prev.configurado ? prev : { ...prev, visibles: state.equiposDeportivos.map((equipo) => equipo.id), configurado: true }); }, [state.equiposDeportivos, hydrated]);
  useLayoutEffect(() => {
    if (state.actaEventoPendienteId === null) return;
    const evento = eventos.find((item) => item.id === state.actaEventoPendienteId && item.tipo === 'Partido');
    actions.limpiarActaEventoPendiente();
    if (!evento) return;
    const fecha = dateFromIso(evento.fecha);
    setCursor({ year: fecha.getFullYear(), month: fecha.getMonth(), day: fecha.getDate() });
    setVista('mes');
    setDetalleDia(null);
    setEditor(null);
    setActaEvento(evento);
  }, [actions, eventos, state.actaEventoPendienteId]);
  useEffect(() => { const interval = window.setInterval(() => setClock((value) => value + 1), 60000); return () => window.clearInterval(interval); }, []);

  const inicioMes = isoDate(cursor.year, cursor.month, 1);
  const finMes = isoDate(cursor.year, cursor.month + 1, 0);
  const cursorDate = new Date(cursor.year, cursor.month, cursor.day);
  const inicioSemanaDate = addDays(cursorDate, -cursorDate.getDay());
  const finSemanaDate = addDays(inicioSemanaDate, 6);
  const rango = vista === 'mes' ? { desde: inicioMes, hasta: finMes } : { desde: isoDate(inicioSemanaDate.getFullYear(), inicioSemanaDate.getMonth(), inicioSemanaDate.getDate()), hasta: isoDate(finSemanaDate.getFullYear(), finSemanaDate.getMonth(), finSemanaDate.getDate()) };
  const visibles = useMemo(() => expandEventos(eventos, rango.desde, rango.hasta).filter((evento) => prefs.visibles.includes(evento.equipoId)), [eventos, rango.desde, rango.hasta, prefs.visibles]);
  const pending = eventos.filter((evento) => prefs.visibles.includes(evento.equipoId) && status(evento) === 'pendiente');
  const color = (equipoId: number) => prefs.colores[equipoId] || COLORS[state.equiposDeportivos.findIndex((equipo) => equipo.id === equipoId) % COLORS.length] || COLORS[0];
  const openEvent = (evento: Evento) => resultadoPartido(evento, actas) ? setActaEvento(evento) : setEditor(evento);
  const openEditor = (fecha?: string, evento?: Evento) => setEditor(evento || { id: Date.now(), esNuevo: true, equipoId: state.equiposDeportivos[0]?.id || 1, tipo: 'Entrenamiento', fecha: fecha || inicioMes, horaInicio: '19:00', horaFin: '21:00' });
  const saveEvent = (evento: Evento, scope: 'uno' | 'serie' = evento.ocurrenciaDe && window.confirm('¿Aplicar los cambios a toda la serie? Aceptar = toda la serie; Cancelar = solo este evento.') ? 'serie' : 'uno') => {
    if (!evento.fecha || !evento.equipoId || (evento.tipo === 'Partido' && (!evento.rival?.trim() || !evento.horaInicio)) || (evento.tipo === 'Otro' && !evento.titulo?.trim()) || (evento.recurrencia && (!evento.recurrencia.dias.length || (evento.recurrencia.hasta && evento.recurrencia.hasta < evento.fecha)))) { actions.mostrarToast('Completá los campos obligatorios'); return; }
    const normalized = { ...evento, titulo: evento.titulo?.trim(), rival: evento.rival?.trim(), descripcion: evento.descripcion?.trim() };
    setEventos((prev) => evento.ocurrenciaDe && scope === 'uno'
      ? prev.map((item) => item.id === evento.ocurrenciaDe!.id ? { ...item, overrides: { ...item.overrides, [evento.ocurrenciaDe!.fecha]: { ...normalized, recurrencia: undefined, ocurrenciaDe: undefined, id: item.id } } } : item)
      : prev.some((item) => item.id === evento.id) ? prev.map((item) => item.id === evento.id ? evento.ocurrenciaDe && scope === 'serie' ? { ...item, ...normalized, fecha: item.fecha, recurrencia: item.recurrencia, ocurrenciaDe: undefined } : { ...normalized, ocurrenciaDe: undefined, esNuevo: undefined } : item) : [...prev, { ...normalized, esNuevo: undefined }]);
    setEditor(null); actions.mostrarToast('Evento guardado');
  };
  const deleteEvent = (evento: Evento, scope: 'uno' | 'serie') => { setEventos((prev) => evento.ocurrenciaDe && scope === 'uno' ? prev.map((item) => item.id === evento.ocurrenciaDe!.id ? { ...item, exclusiones: [...(item.exclusiones || []), evento.ocurrenciaDe!.fecha] } : item) : prev.filter((item) => item.id !== evento.id)); setEditor(null); actions.mostrarToast(scope === 'uno' ? 'Ocurrencia eliminada' : 'Evento eliminado'); };

  const changeMonth = (amount: number) => setCursor((current) => { const date = new Date(current.year, current.month + (vista === 'mes' ? amount : 0), current.day + (vista === 'semana' ? amount * 7 : 0)); return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() }; });
  if (state.activeModule !== 'deportivo') return <CalendarioAdministrativo />;
  return <div className="sports-calendar-screen" style={{ animation: 'fadeIn .3s ease' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 18 }}>
      <div><h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#16203a' }}>Calendario deportivo</h1><p style={{ color: '#6b7488', margin: '4px 0 0' }}>Agenda de todos los planteles</p></div>
      <button className="calendar-primary" onClick={() => openEditor()}>+ Nuevo evento</button>
    </header>
    {pending.length > 0 && <div style={{ background: '#fff4e5', border: '1px solid #f4c878', borderRadius: 11, padding: '12px 14px', color: '#774d12', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><strong>Hay {pending.length} {pending.length === 1 ? 'partido pendiente' : 'partidos pendientes'} de resultado.</strong>{pending.map((evento) => <button className="calendar-link" key={String(evento.id)} onClick={() => setActaEvento(evento)}>Cargar acta: {eventTitle(evento)}</button>)}</div>}
    <section className="calendar-card" style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: 20 }}>
      <div className="calendar-toolbar">
        <div className="calendar-segment"><button className={vista === 'mes' ? 'active' : ''} onClick={() => setVista('mes')}>Mes</button><button className={vista === 'semana' ? 'active' : ''} onClick={() => setVista('semana')}>Semana</button></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><button aria-label="Período anterior" className="calendar-nav" onClick={() => changeMonth(-1)}>&lsaquo;</button><strong style={{ minWidth: 150, textAlign: 'center' }}>{vista === 'mes' ? `${MESES[cursor.month]} ${cursor.year}` : `${inicioSemanaDate.getDate()}/${inicioSemanaDate.getMonth() + 1} – ${finSemanaDate.getDate()}/${finSemanaDate.getMonth() + 1}`}</strong><button aria-label="Período siguiente" className="calendar-nav" onClick={() => changeMonth(1)}>&rsaquo;</button></div>
      </div>
      <SquadFilters equipos={state.equiposDeportivos} prefs={prefs} color={color} onChange={setPrefs} />
      {vista === 'mes' ? <MonthView year={cursor.year} month={cursor.month} eventos={visibles} actas={actas} color={color} onNew={openEditor} onEvent={openEvent} onMore={setDetalleDia} /> : <WeekView start={inicioSemanaDate} eventos={visibles} actas={actas} color={color} onEvent={openEvent} />}
    </section>
    {detalleDia && <DayDetailWithResults fecha={detalleDia} eventos={visibles.filter((evento) => evento.fecha === detalleDia)} actas={actas} color={color} onClose={() => setDetalleDia(null)} onEvent={openEvent} onNew={() => openEditor(detalleDia)} />}
    {editor && <EventEditor evento={editor} equipos={state.equiposDeportivos} onChange={setEditor} onSave={saveEvent} onDelete={() => deleteEvent(editor, editor.ocurrenciaDe && window.confirm('¿Eliminar toda la serie? Aceptar = toda la serie; Cancelar = solo este evento.') ? 'serie' : 'uno')} onOpenActa={() => { setActaEvento(editor); setEditor(null); }} onClose={() => setEditor(null)} />}
    {actaEvento && typeof document !== 'undefined' && createPortal(<ActaEditor evento={actaEvento} acta={actas[String(actaEvento.id)] || emptyActa()} equipos={state.equiposDeportivos} jugadores={state.jugadores} formaciones={state.formaciones} onClose={() => setActaEvento(null)} onSave={(acta, finaliza, estado, motivo, nuevaFecha) => {
      const resultado = [acta.resultadoClub, acta.resultadoRival].map(Number);
      const puntajeInvalido = Object.values(acta.puntajes).some((valor) => {
        const puntaje = Number(valor);
        return valor !== '' && (!Number.isFinite(puntaje) || puntaje < 1 || puntaje > 10);
      });
      const formacion = acta.formacionSnapshot || state.formaciones.find((item) => item.id === acta.formacionId);
      const suplenteIds = new Set((formacion?.jugadores || []).filter((item) => item.zona === 'suplente').map((item) => String(item.jugadorId)));
      const entranteInvalido = acta.cambios.some((cambio) => {
        const entraId = String(cambio.entraId ?? '');
        return entraId !== '' && !suplenteIds.has(entraId);
      });
      const resultadoInvalido = finaliza && estado === 'finalizado' && ((acta.resultadoClub ?? '') === '' || (acta.resultadoRival ?? '') === '' || resultado.some((valor) => !Number.isInteger(valor) || valor < 0));
      if (resultadoInvalido) { actions.mostrarToast('Ingresá un resultado válido'); return; }
      if (puntajeInvalido) { actions.mostrarToast('Los puntajes deben estar entre 1 y 10'); return; }
      if (entranteInvalido) { actions.mostrarToast('El jugador que entra debe ser suplente de la formación'); return; }
      if (finaliza && estado === 'finalizado' && (acta.goles.length !== resultado[0] || acta.goles.some((gol) => !gol.jugadorId))) { actions.mostrarToast('Cargá un goleador por cada gol del club'); return; }
      setActas((prev) => ({ ...prev, [String(actaEvento.id)]: acta }));
      if (finaliza) setEventos((prev) => prev.map((item) => item.id === actaEvento.id ? { ...item, estado, motivo, nuevaFecha } : item));
      setActaEvento(null);
      actions.mostrarToast(finaliza ? 'Acta guardada' : 'Borrador guardado');
    }} />, document.body)}
  </div>;
}

function CalendarioAdministrativo() {
  const { state, actions } = useApp();
  return <div><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}><div><h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#16203a' }}>Calendario</h1><p style={{ margin: '4px 0 0', color: '#6b7488' }}>Partidos programados del club</p></div><button className="calendar-primary" onClick={() => actions.openAgregarPartido()}>+ Agregar partido</button></div><div className="calendar-card" style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: 20 }}>{state.partidos.map((partido) => <button key={partido.id} onClick={() => actions.openVerPartido(partido.id)} className="day-detail-event"><strong>{partido.fecha.split('-').reverse().join('/')} · {partido.hora} · {partido.rival}</strong><span>{partido.tipo} · {partido.condicion}</span></button>)}</div></div>;
}

function SquadFilters({ equipos, prefs, color, onChange }: { equipos: { id: number; nombre: string }[]; prefs: Prefs; color: (id: number) => string; onChange: (prefs: Prefs) => void }) {
  const toggle = (id: number) => onChange({ ...prefs, visibles: prefs.visibles.includes(id) ? prefs.visibles.filter((item) => item !== id) : [...prefs.visibles, id] });
  return <div className="calendar-filters"><span>Planteles:</span>{equipos.map((equipo) => <label key={equipo.id} className="calendar-squad"><input type="checkbox" checked={prefs.visibles.includes(equipo.id)} onChange={() => toggle(equipo.id)} /><input aria-label={`Color ${equipo.nombre}`} type="color" value={color(equipo.id)} onChange={(e) => onChange({ ...prefs, colores: { ...prefs.colores, [equipo.id]: e.target.value } })} /><span>{equipo.nombre}</span></label>)}</div>;
}


function MonthView({ year, month, eventos, actas, color, onNew, onEvent, onMore }: { year: number; month: number; eventos: Evento[]; actas: Record<string, Acta>; color: (id: number) => string; onNew: (fecha: string) => void; onEvent: (evento: Evento) => void; onMore: (fecha: string) => void }) {
  const monthFirst = new Date(year, month, 1).getDay(); const monthDays = new Date(year, month + 1, 0).getDate();
  const renderMonthEvent = (evento: Evento) => { const result = resultadoPartido(evento, actas); return <button key={String(evento.id)} className={`sports-event${result ? ` match-${result.clase}` : ''}`} style={{ borderLeftColor: color(evento.equipoId) }} onClick={() => onEvent(evento)}>{result ? <span className="match-result-chip">{result.club}–{result.rival} vs {evento.rival || 'Rival a definir'}</span> : <><span>{evento.horaInicio || 'Todo el día'}</span>{eventTitle(evento)}</>}</button>; };
  return <><div className="calendar-weekdays">{DIAS.map((dia) => <div key={dia}>{dia}</div>)}</div><div className="sports-month-grid">{Array.from({ length: monthFirst }, (_, index) => <div key={`blank-${index}`} className="sports-day blank" />)}{Array.from({ length: monthDays }, (_, index) => { const day = index + 1; const fecha = isoDate(year, month, day); const list = eventos.filter((evento) => evento.fecha === fecha); return <div key={fecha} className="sports-day" onDoubleClick={() => onNew(fecha)}><div className="sports-day-number">{day}</div>{list.slice(0, 3).map(renderMonthEvent)}{list.length > 3 && <button className="calendar-text-button" onClick={() => onMore(fecha)}>+{list.length - 3} más</button>}<button className="sports-add-day" onClick={() => onNew(fecha)}>+</button></div>; })}</div></>;
}

function WeekView({ start, eventos, actas, color, onEvent }: { start: Date; eventos: Evento[]; actas: Record<string, Acta>; color: (id: number) => string; onEvent: (evento: Evento) => void }) {
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(start, index));
  const renderWeekEvent = (evento: Evento) => { const result = resultadoPartido(evento, actas); return <button className={`sports-week-event${result ? ` match-${result.clase}` : ''}`} key={String(evento.id)} style={{ borderLeftColor: color(evento.equipoId) }} onClick={() => onEvent(evento)}>{result ? <span className="match-result-chip">{result.club}–{result.rival} vs {evento.rival || 'Rival a definir'}</span> : <><span>{evento.horaInicio || 'Todo el día'}</span>{eventTitle(evento)}</>}</button>; };
  return <div className="sports-week">{weekDays.map((dia) => { const fecha = isoDate(dia.getFullYear(), dia.getMonth(), dia.getDate()); const list = eventos.filter((evento) => evento.fecha === fecha); return <div className="sports-week-day" key={fecha}><strong>{DIAS[dia.getDay()]} <span>{dia.getDate()}</span></strong>{list.length ? list.map(renderWeekEvent) : <small>Sin actividades</small>}</div>; })}</div>;
}

function DayDetailWithResults({ fecha, eventos, actas, color, onClose, onEvent, onNew }: { fecha: string; eventos: Evento[]; actas: Record<string, Acta>; color: (id: number) => string; onClose: () => void; onEvent: (evento: Evento) => void; onNew: () => void }) {
  return <div className="calendar-overlay" onClick={onClose}><div className="calendar-day-detail" onClick={(event) => event.stopPropagation()}><button className="calendar-close" onClick={onClose}>×</button><h2>Agenda del {fecha.split('-').reverse().join('/')}</h2>{eventos.map((evento) => { const result = resultadoPartido(evento, actas); return <button key={String(evento.id)} className={`day-detail-event${result ? ` match-${result.clase}` : ''}`} style={{ borderLeftColor: color(evento.equipoId) }} onClick={() => { onClose(); onEvent(evento); }}><strong>{result ? `${eventTitle(evento)} · ${result.club} — ${result.rival}` : `${evento.horaInicio || 'Todo el día'} · ${eventTitle(evento)}`}</strong><span>{evento.tipo}</span></button>; })}<button className="calendar-primary" onClick={onNew}>+ Nuevo evento</button></div></div>;
}

function EventEditor({ evento, equipos, onChange, onSave, onDelete, onOpenActa, onClose }: { evento: Evento; equipos: { id: number; nombre: string }[]; onChange: (event: Evento) => void; onSave: (event: Evento) => void; onDelete: () => void; onOpenActa: () => void; onClose: () => void }) {
  const patch = (values: Partial<Evento>) => onChange({ ...evento, ...values }); const recurrente = !!evento.recurrencia;
  return <div className="calendar-overlay"><aside className="calendar-drawer"><div className="drawer-header"><h2>{evento.esNuevo ? 'Nuevo evento' : 'Editar evento'}</h2><button className="calendar-close" onClick={onClose}>×</button></div><label>Tipo<select value={evento.tipo} onChange={(e) => patch({ tipo: e.target.value as TipoEvento, recurrencia: undefined })}>{(['Partido', 'Entrenamiento', 'Descanso', 'Otro'] as TipoEvento[]).map((tipo) => <option key={tipo}>{tipo}</option>)}</select></label><label>Plantel<select value={evento.equipoId} onChange={(e) => patch({ equipoId: Number(e.target.value) })}>{equipos.map((equipo) => <option key={equipo.id} value={equipo.id}>{equipo.nombre}</option>)}</select></label><div className="drawer-grid"><label>Fecha<input type="date" value={evento.fecha} onChange={(e) => patch({ fecha: e.target.value })} /></label>{evento.tipo !== 'Descanso' && <label>Hora inicio{evento.tipo === 'Partido' && ' *'}<input type="time" value={evento.horaInicio || ''} onChange={(e) => patch({ horaInicio: e.target.value })} /></label>}{evento.tipo === 'Entrenamiento' && <label>Hora fin<input type="time" value={evento.horaFin || ''} onChange={(e) => patch({ horaFin: e.target.value })} /></label>}</div>{evento.tipo === 'Partido' && <><label>Rival *<input value={evento.rival || ''} onChange={(e) => patch({ rival: e.target.value })} /></label><div className="drawer-grid"><label>Competencia<select value={evento.competencia || 'Liga'} onChange={(e) => patch({ competencia: e.target.value as Competencia })}><option>Liga</option><option>Copa</option><option>Amistoso</option></select></label><label>Condición<select value={evento.condicion || 'Local'} onChange={(e) => patch({ condicion: e.target.value as 'Local' | 'Visitante' })}><option>Local</option><option>Visitante</option></select></label></div></>}{evento.tipo === 'Otro' && <label>Título *<input value={evento.titulo || ''} onChange={(e) => patch({ titulo: e.target.value })} /></label>}{evento.tipo === 'Entrenamiento' && <label>Objetivo / título<input value={evento.titulo || ''} onChange={(e) => patch({ titulo: e.target.value })} /></label>}{evento.tipo !== 'Descanso' && <label>Lugar<input value={evento.lugar || ''} onChange={(e) => patch({ lugar: e.target.value })} /></label>}<label>Descripción / observaciones<textarea value={evento.descripcion || ''} onChange={(e) => patch({ descripcion: e.target.value })} /></label>{(evento.tipo === 'Entrenamiento' || evento.tipo === 'Descanso') && <div className="recurrence"><label className="check-label"><input type="checkbox" checked={recurrente} onChange={(e) => patch({ recurrencia: e.target.checked ? { dias: [dateFromIso(evento.fecha).getDay()] } : undefined, serieId: e.target.checked ? evento.id : undefined })} /> Repetir semanalmente</label>{recurrente && <><div className="weekday-picker">{DIAS.map((dia, index) => <label key={dia}><input type="checkbox" checked={evento.recurrencia!.dias.includes(index)} onChange={() => patch({ recurrencia: { ...evento.recurrencia!, dias: evento.recurrencia!.dias.includes(index) ? evento.recurrencia!.dias.filter((item) => item !== index) : [...evento.recurrencia!.dias, index] } })} />{dia}</label>)}</div><label>Hasta (vacío = sin fin)<input type="date" value={evento.recurrencia?.hasta || ''} onChange={(e) => patch({ recurrencia: { ...evento.recurrencia!, hasta: e.target.value || undefined } })} /></label></>}</div>}<div className="drawer-actions"><button className="calendar-primary" onClick={() => onSave(evento)}>Guardar</button>{evento.tipo === 'Partido' && !evento.esNuevo && <button className="calendar-secondary" onClick={onOpenActa}>Abrir acta</button>}<button className="calendar-secondary" onClick={onClose}>Cancelar</button>{!evento.esNuevo && <button className="calendar-danger" onClick={onDelete}>Eliminar</button>}</div></aside></div>;
}

function BallIcon() { return <svg className="acta-ball" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 7l4.76 3.45L15 16H9l-1.76-5.55L12 7"/><path d="M12 7V3m3 13 2.5 3m-.74-8.55L20.5 9M9.06 16.05 6.5 19m.74-8.55L3.5 9"/></svg>; }

function ActaEditor({ evento, acta, jugadores, formaciones, onClose, onSave }: { evento: Evento; acta: Acta; equipos: { id: number; nombre: string }[]; jugadores: { id: number; equipoId: number; nombre: string; apellido: string }[]; formaciones: Formacion[]; onClose: () => void; onSave: (acta: Acta, finaliza: boolean, estado: EstadoPartido, motivo?: string, nuevaFecha?: string) => void }) {
  const [draft, setDraft] = useState<Acta>(acta); const [estado, setEstado] = useState<EstadoPartido>(evento.estado && evento.estado !== 'programado' ? evento.estado : 'finalizado'); const [motivo, setMotivo] = useState(evento.motivo || ''); const [nuevaFecha, setNuevaFecha] = useState(evento.nuevaFecha || '');
  const teamPlayers = jugadores.filter((jugador) => jugador.equipoId === evento.equipoId);
  const formation = draft.formacionSnapshot || formaciones.find((item) => item.id === draft.formacionId);
  const entries = formation?.jugadores || []; const titulares = entries.filter((item) => item.zona === 'titular'); const suplentes = entries.filter((item) => item.zona === 'suplente');
  const name = (id: string | number) => { const player = jugadores.find((item) => item.id === Number(id)); return player ? `${player.nombre} ${player.apellido}` : 'Jugador'; };
  const playerOptions = <><option value="">Jugador</option>{teamPlayers.map((player) => <option key={player.id} value={player.id}>{player.nombre} {player.apellido}</option>)}</>;
  const substituteOptions = <><option value="">Suplente</option>{suplentes.map((entry) => <option key={entry.jugadorId} value={entry.jugadorId}>{name(entry.jugadorId)}</option>)}</>;
  const resultadoClubTexto = String(draft.resultadoClub ?? ''); const golesClub = Number(resultadoClubTexto); const limiteGoleadores = resultadoClubTexto.trim() !== '' && Number.isInteger(golesClub) && golesClub >= 0 ? golesClub : null;
  const updateList = <K extends 'goles' | 'amarillas' | 'rojas' | 'cambios'>(key: K, index: number, value: Acta[K][number]) => setDraft({ ...draft, [key]: draft[key].map((item, itemIndex) => itemIndex === index ? value : item) });
  const add = (key: 'goles' | 'amarillas' | 'rojas' | 'cambios') => setDraft((current) => ({ ...current, [key]: [...current[key], key === 'cambios' ? { saleId: '', entraId: '', minuto: '' } : key === 'goles' ? { jugadorId: '', minuto: '', asistenciaId: '' } : { jugadorId: '', minuto: '' }] }));
  const remove = (key: 'goles' | 'amarillas' | 'rojas' | 'cambios', index: number) => setDraft({ ...draft, [key]: draft[key].filter((_, itemIndex) => itemIndex !== index) });
  const selectFormation = (id: string) => { const selected = formaciones.find((item) => item.id === Number(id)); setDraft({ ...draft, formacionId: selected?.id, formacionSnapshot: selected ? { ...selected, jugadores: selected.jugadores.map((item) => ({ ...item })), roles: { ...selected.roles }, camiseta: { ...selected.camiseta } } : undefined, puntajes: {} }); };
  const ratingClass = (value: string) => { const score = Number(value); return !value ? '' : score > 7 ? 'good' : score >= 6 ? 'regular' : 'bad'; };
  return <div className="calendar-overlay acta-overlay" onMouseDown={onClose}><section className="acta-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Acta del partido">
    <header className="acta-header"><div><span className="acta-kicker">ACTA DEL PARTIDO</span><h2>{evento.competencia || 'Partido'} · {evento.fecha.split('-').reverse().join('/')} {evento.horaInicio && `· ${evento.horaInicio}`}</h2></div><div className="acta-header-actions"><select aria-label="Estado del partido" value={estado} onChange={(event) => setEstado(event.target.value as EstadoPartido)}><option value="finalizado">Finalizado</option><option value="suspendido">Suspendido</option><option value="postergado">Postergado</option></select><button className="calendar-close" onClick={onClose}>×</button></div></header>
    {estado === 'finalizado' ? <div className="acta-scoreboard"><strong>Club Atlético Modelo</strong><input aria-label="Goles de Club Atlético Modelo" type="number" min="0" value={draft.resultadoClub || ''} onChange={(event) => setDraft({ ...draft, resultadoClub: event.target.value })}/><b>—</b><input aria-label={`Goles de ${evento.rival || 'rival'}`} type="number" min="0" value={draft.resultadoRival || ''} onChange={(event) => setDraft({ ...draft, resultadoRival: event.target.value })}/><strong>{evento.rival || 'Rival a definir'}</strong></div> : <div className="acta-status-fields"><label>Motivo<textarea value={motivo} onChange={(event) => setMotivo(event.target.value)} /></label>{estado === 'postergado' && <label>Nueva fecha<input type="date" value={nuevaFecha} onChange={(event) => setNuevaFecha(event.target.value)} /></label>}</div>}
    <div className="acta-body"><section className="acta-ratings"><div className="acta-section-heading"><div><span>FORMACIÓN Y RENDIMIENTO</span><h3>{formation ? `${formation.nombre} · ${formation.sistema}` : 'Calificaciones'}</h3></div><select value={draft.formacionId || ''} onChange={(event) => selectFormation(event.target.value)}><option value="">Seleccionar formación</option>{formaciones.filter((item) => item.equipoId === evento.equipoId).map((item) => <option key={item.id} value={item.id}>{item.nombre} · {item.sistema}</option>)}</select></div>{formation ? <><p className="acta-ratings-help">Asigná un puntaje de 1 a 10 a quienes participaron.</p><RatingList title="Titulares" entries={titulares} name={name} puntajes={draft.puntajes} onChange={(id, value) => setDraft({ ...draft, puntajes: { ...draft.puntajes, [id]: value } })} ratingClass={ratingClass}/><RatingList title="Suplentes" entries={suplentes} name={name} puntajes={draft.puntajes} onChange={(id, value) => setDraft({ ...draft, puntajes: { ...draft.puntajes, [id]: value } })} ratingClass={ratingClass}/></> : <div className="acta-empty-formation">Elegí una formación para listar titulares y suplentes.</div>}</section>
      <section className="acta-incidents"><IncidentCard title="Goleadores" icon={<BallIcon/>} onAdd={() => add('goles')} disabled={limiteGoleadores !== null && draft.goles.length >= limiteGoleadores}>{draft.goles.map((item, index) => <div className="acta-incident-row goal-row" key={index}><BallIcon/><div className="acta-incident-fields"><label>Goleador<select value={item.jugadorId} onChange={(event) => updateList('goles', index, { ...item, jugadorId: event.target.value })}>{playerOptions}</select></label><label>Asistente<select value={item.asistenciaId} onChange={(event) => updateList('goles', index, { ...item, asistenciaId: event.target.value })}><option value="">Sin asistencia</option>{teamPlayers.map((player) => <option key={player.id} value={player.id}>{player.nombre} {player.apellido}</option>)}</select></label></div><label className="incident-minute">Min.<input value={item.minuto} onChange={(event) => updateList('goles', index, { ...item, minuto: event.target.value })}/></label><button aria-label="Quitar gol" onClick={() => remove('goles', index)}>×</button></div>)}</IncidentCard><IncidentCard title="Tarjetas" icon={<span className="card-icons"><i className="yellow"/><i className="red"/></span>} actions={<div className="card-actions"><button className="card-action yellow" onClick={() => add('amarillas')}>+ Amarilla</button><button className="card-action red" onClick={() => add('rojas')}>+ Roja</button></div>}>{(['amarillas', 'rojas'] as const).flatMap((key) => draft[key].map((item, index) => <div className="acta-incident-row card-row" key={`${key}-${index}`}><i className={`match-card ${key === 'rojas' ? 'red' : 'yellow'}`}/><label>Jugador<select value={item.jugadorId} onChange={(event) => updateList(key, index, { ...item, jugadorId: event.target.value })}>{playerOptions}</select></label><label className="incident-minute">Min.<input value={item.minuto} onChange={(event) => updateList(key, index, { ...item, minuto: event.target.value })}/></label><button aria-label="Quitar tarjeta" onClick={() => remove(key, index)}>×</button></div>))}</IncidentCard><IncidentCard title="Cambios" icon={<span className="substitution-icon">⇄</span>} onAdd={() => add('cambios')}>{draft.cambios.map((item, index) => <div className="acta-incident-row substitution-row" key={index}><span className="substitution-icon">⇄</span><div className="acta-incident-fields"><label>Sale<select value={item.saleId} onChange={(event) => updateList('cambios', index, { ...item, saleId: event.target.value })}>{playerOptions}</select></label><label>Entra<select value={item.entraId} onChange={(event) => updateList('cambios', index, { ...item, entraId: event.target.value })}>{substituteOptions}</select></label></div><label className="incident-minute">Min.<input value={item.minuto} onChange={(event) => updateList('cambios', index, { ...item, minuto: event.target.value })}/></label><button aria-label="Quitar cambio" onClick={() => remove('cambios', index)}>×</button></div>)}</IncidentCard></section></div>
    <label className="acta-notes"><span>Observaciones</span><textarea value={draft.observaciones} onChange={(event) => setDraft({ ...draft, observaciones: event.target.value })} placeholder="Notas del cuerpo técnico..."/></label>
    <footer className="acta-footer"><button className="calendar-secondary" onClick={() => evento.estado === 'finalizado' ? onSave(draft, true, 'finalizado', motivo, nuevaFecha) : onSave(draft, false, 'programado')}>{evento.estado === 'finalizado' ? 'Guardar cambios' : 'Guardar borrador'}</button><button className="calendar-primary" onClick={() => onSave(draft, true, estado, motivo, nuevaFecha)}>Finalizar acta</button></footer>
  </section></div>;
}

function RatingList({ title, entries, name, puntajes, onChange, ratingClass }: { title: string; entries: Formacion['jugadores']; name: (id: number) => string; puntajes: Record<string, string>; onChange: (id: number, value: string) => void; ratingClass: (value: string) => string }) { return <div className="rating-list"><h4>{title}</h4>{entries.length ? entries.map((item) => { const value = puntajes[String(item.jugadorId)] || ''; return <label key={item.jugadorId}><span><b>{item.dorsal}</b>{name(item.jugadorId)}</span><input className={ratingClass(value)} type="number" min="1" max="10" step="0.5" value={value} onChange={(event) => onChange(item.jugadorId, event.target.value)}/></label>; }) : <p>Sin jugadores.</p>}</div>; }

function IncidentCard({ title, icon, action = '+ Agregar', onAdd, actions, children, disabled = false }: { title: string; icon: React.ReactNode; action?: string; onAdd?: () => void; actions?: React.ReactNode; children: React.ReactNode; disabled?: boolean }) { return <section className="acta-incident-card"><header><div>{icon}<h3>{title}</h3></div>{actions || <button className="calendar-text-button" onClick={onAdd} disabled={disabled}>{action}</button>}</header>{children}</section>; }
