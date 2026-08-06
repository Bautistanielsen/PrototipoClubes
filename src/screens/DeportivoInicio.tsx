import { useEffect, useState } from 'react';
import { HOY_ISO, useApp } from '../state/AppContext';
import { readSportsCalendarData } from '../lib/sportsCalendar';
import type { Evento } from '../lib/sportsCalendar';

export default function DeportivoInicio() {
  const { state, actions } = useApp();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [calendarioInicializado, setCalendarioInicializado] = useState(false);
  useEffect(() => {
    setEventos(readSportsCalendarData().eventos);
    setCalendarioInicializado(true);
  }, []);
  const partidosCalendario = eventos.filter((evento) => evento.tipo === 'Partido' && !['finalizado', 'suspendido', 'postergado'].includes(evento.estado || '')).map((evento) => ({ fecha: evento.fecha, hora: evento.horaInicio || '', rival: evento.rival || 'Rival a definir', condicion: evento.condicion || 'Local', tipo: evento.competencia || 'Amistoso' }));
  const partidos = calendarioInicializado ? partidosCalendario : state.partidos;
  const nextMatch = [...partidos]
    .filter((partido) => partido.fecha >= HOY_ISO)
    .sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`))[0];
  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 22 }}><div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Inicio deportivo</div><div style={{ color: '#6b7488', fontSize: 14, marginTop: 3 }}>Organizá la actividad deportiva del club.</div></div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={card}><div style={label}>PARTIDOS PROGRAMADOS</div><div style={number}>{partidos.length}</div><button onClick={() => actions.navigate('calendario')} style={link}>Ver agenda deportiva</button></div>
        <div style={card}><div style={label}>EQUIPOS ACTIVOS</div><div style={number}>{state.equiposDeportivos.length}</div><button onClick={() => actions.navigate('equipos')} style={link}>Ver planteles</button></div>
        <div style={card}><div style={label}>JUGADORES REGISTRADOS</div><div style={number}>{state.jugadores.length}</div><button onClick={() => actions.navigate('equipos')} style={link}>Gestionar planteles</button></div>
        <div style={{ ...card, flex: 2 }}><div style={label}>PRÓXIMO PARTIDO</div><div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginTop: 12 }}>{nextMatch ? `${nextMatch.condicion} vs. ${nextMatch.rival}` : 'Sin partidos programados'}</div>{nextMatch && <div style={{ color: '#6b7488', marginTop: 5, fontSize: 14 }}>{nextMatch.fecha} · {nextMatch.hora} · {nextMatch.tipo}</div>}</div>
      </div>
    </div>
  );
}
const card = { flex: 1, minWidth: 220, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: 20 };
const label = { fontSize: 11, letterSpacing: '.06em', fontWeight: 800, color: '#087f75' };
const number = { fontSize: 32, color: '#16203a', fontWeight: 800, margin: '8px 0 12px' };
const link = { border: 'none', background: 'transparent', padding: 0, color: '#087f75', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
