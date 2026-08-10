import { useState } from 'react';
import { HOY_ISO, useApp } from '../state/AppContext';
import { readSportsCalendarData } from '../lib/sportsCalendar';
import { derivePlayerHighlights, deriveSportsStatistics, selectFinalizedMatches, type PlayerStatistics } from '../lib/sportsStatistics';
import type { Jugador } from '../types';
import PlayerAvatar from './estadisticas/PlayerAvatar';
import { displayName, playerPhoto } from './estadisticas/types';

const normalizeName = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR').trim();

const formatDate = (value: string) => new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date(`${value}T12:00:00`));

const playerAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(`${birthDate}T12:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age -= 1;
  return age;
};

export default function DeportivoInicio() {
  const { state, actions } = useApp();
  const [calendarData] = useState(readSportsCalendarData);
  const team = state.equiposDeportivos.find((item) => normalizeName(item.nombre) === 'primera division');
  const teamName = team?.nombre || 'Primera división';
  const teamId = team?.id;
  const teamPlayers = teamId === undefined ? [] : state.jugadores.filter((player) => player.equipoId === teamId);
  const injuredPlayers = teamPlayers.filter((player) => player.estado === 'lesionado');
  const filters = { equipoId: teamId ?? -1 };
  const finalizedMatches = teamId === undefined ? [] : selectFinalizedMatches(calendarData, filters)
    .sort((a, b) => `${b.evento.fecha}${b.evento.horaInicio || ''}`.localeCompare(`${a.evento.fecha}${a.evento.horaInicio || ''}`))
    .slice(0, 3);
  const nextMatch = teamId === undefined ? undefined : calendarData.eventos
    .filter((event) => event.equipoId === teamId && event.tipo === 'Partido' && !['finalizado', 'suspendido', 'postergado'].includes(event.estado || '') && event.fecha >= HOY_ISO)
    .sort((a, b) => `${a.fecha}${a.horaInicio || ''}`.localeCompare(`${b.fecha}${b.horaInicio || ''}`))[0];
  const stats = deriveSportsStatistics(calendarData, filters, state.jugadores);
  const highlights = derivePlayerHighlights(stats.players);

  return (
    <main className="sports-home">
      <header className="sports-home-header">
        <div><h1>Inicio deportivo</h1><p>Resumen de la actividad de Primera división.</p></div>
      </header>

      {nextMatch ? <section className="sports-home-next match-card-detail programado">
        <div className="match-card-main">
          <header className="match-competition"><span>{nextMatch.competencia || 'Liga'}</span><span>{nextMatch.condicion || 'Local'} · {formatDate(nextMatch.fecha)}</span></header>
          <div className="match-scoreboard">
            <span className="match-status programado">Programado</span>
            <h3><span>{teamName}</span><b>vs.</b><span>{nextMatch.rival || 'Rival a definir'}</span></h3>
          </div>
          <div className="match-details"><span><b>Número de fecha</b>{nextMatch.numeroFecha ? `Fecha ${nextMatch.numeroFecha}` : 'No informado'}</span><span><b>Lugar</b>{nextMatch.lugar || 'A definir'}</span><span><b>Horario</b>{nextMatch.horaInicio || 'A definir'}</span></div>
          <div className="match-card-actions"><button type="button" onClick={() => actions.navigate('calendario')}>Ver Agenda deportiva →</button></div>
        </div>
      </section> : <section className="sports-home-next sports-home-next-empty match-card-detail">
        <div><span className="sports-home-eyebrow">PRÓXIMO PARTIDO</span><h2>Sin próximos partidos programados</h2><p>La agenda de Primera división no tiene encuentros futuros confirmados.</p></div>
        <button type="button" onClick={() => actions.navigate('calendario')}>Programar en Agenda</button>
      </section>}

      <div className="sports-home-content-grid">
        <section className="sports-home-section sports-home-results">
          <SectionHeading title="Últimos resultados" action="Ver Partidos" onClick={() => actions.navigate('partidos')} />
          {finalizedMatches.length ? <div className="sports-home-result-list">
            {finalizedMatches.map(({ evento, result }) => <article key={evento.id} className="sports-home-result">
              <span className={`sports-home-outcome ${result.outcome}`}>{result.outcome === 'win' ? 'G' : result.outcome === 'draw' ? 'E' : 'P'}</span>
              <div><strong>{evento.condicion === 'Visitante' ? evento.rival || 'Rival' : teamName} <b>{evento.condicion === 'Visitante' ? result.rival : result.club}</b> - <b>{evento.condicion === 'Visitante' ? result.club : result.rival}</b> {evento.condicion === 'Visitante' ? teamName : evento.rival || 'Rival'}</strong><small>{formatDate(evento.fecha)} · {evento.competencia || 'Sin competencia'}{evento.lugar ? ` · ${evento.lugar}` : ''}</small></div>
            </article>)}
          </div> : <EmptyState title="Todavía no hay resultados finalizados" detail="Los partidos cerrados desde Agenda deportiva aparecerán acá." />}
        </section>

        <section className="sports-home-section sports-home-highlights">
          <SectionHeading title="Jugadores destacados" action="Ver Estadísticas" onClick={() => actions.navigate('estadisticas')} />
          <div className="sports-home-highlight-grid">
            <Highlight title="Mejor jugador" players={highlights.bestRated} teamPlayers={state.jugadores} teamId={filters.equipoId} value={(player) => player.rating === null ? '' : `${player.rating.toFixed(1)} promedio`} empty="Se necesitan 3 partidos calificados por jugador." />
            <Highlight title="Máximo goleador" players={highlights.topScorers} teamPlayers={state.jugadores} teamId={filters.equipoId} value={(player) => `${player.goals} ${player.goals === 1 ? 'gol' : 'goles'}`} empty="Todavía no hay goles observados en las actas." />
          </div>
        </section>

        <section className="sports-home-section sports-home-injured">
          <SectionHeading title="Jugadores lesionados" action="Gestionar Plantel" onClick={() => actions.navigate('equipos')} />
          {injuredPlayers.length ? <div className="sports-home-injured-grid">{injuredPlayers.map((player) => <InjuredPlayer key={player.id} player={player} />)}</div> : <EmptyState title="No hay jugadores lesionados" detail="Todo el plantel de Primera división figura disponible." />}
        </section>
      </div>
    </main>
  );
}

function SectionHeading({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) {
  return <div className="sports-home-section-heading"><h2>{title}</h2>{action && <button type="button" onClick={onClick}>{action}</button>}</div>;
}

function Highlight({ title, players, teamPlayers, teamId, value, empty }: { title: string; players: PlayerStatistics[]; teamPlayers: Jugador[]; teamId: number; value: (player: PlayerStatistics) => string; empty: string }) {
  return <article className="sports-home-highlight"><span>{title}</span>{players.length ? players.map((player) => { const name = displayName(player.player.displayName, player.player.playerId, teamPlayers, teamId); return <div className="sports-home-player" key={player.player.playerId}><PlayerAvatar name={name} photo={playerPhoto(player.player.playerId, player.player.foto, teamPlayers, teamId)} /><div><strong>{name}</strong><small>{value(player)}</small></div></div>; }) : <p>{empty}</p>}</article>;
}

function InjuredPlayer({ player }: { player: Jugador }) {
  const name = `${player.nombre} ${player.apellido}`.trim();
  const age = `${playerAge(player.fechaNacimiento)} años`;
  const details = player.posicion ? `${player.posicion} · ${age}` : age;
  return <article className="sports-home-player sports-home-injured-player"><PlayerAvatar name={name} photo={player.foto} /><div><strong>{name}</strong><small>{details}</small></div><span>Lesionado</span></article>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="sports-home-empty"><strong>{title}</strong><p>{detail}</p></div>;
}
