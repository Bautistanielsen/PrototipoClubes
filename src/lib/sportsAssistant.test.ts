import { describe, expect, it } from 'vitest';
import { answerSportsAssistant } from './sportsAssistant';
import { expandSportsEventos } from './sportsCalendar';
import type { Acta, Evento, SportsCalendarData } from './sportsCalendar';
import type { SportsAssistantContext } from './sportsAssistant';

const PRIMARY_TEAM = { id: 1, nombre: 'Primera', disciplina: 'Fútbol' };

function calendar(eventos: Evento[], actas: Record<string, Acta> = {}): SportsCalendarData {
  return { eventos, actas, prefs: { visibles: [], colores: {} } };
}

function context(overrides: Partial<SportsAssistantContext> = {}): SportsAssistantContext {
  return {
    team: PRIMARY_TEAM,
    players: [],
    formations: [],
    selectedFormationId: null,
    calendar: calendar([]),
    currentDateTime: new Date(2026, 7, 11, 12, 0, 0),
    ...overrides,
  };
}

function match(id: number, equipoId: number, fecha: string, horaInicio: string | undefined, rival: string, estado?: Evento['estado']): Evento {
  return { id, equipoId, tipo: 'Partido', fecha, horaInicio, rival, condicion: 'Local', estado };
}

function finalizedActa(resultadoClub: number, resultadoRival: number): Acta {
  return {
    resultadoClub: String(resultadoClub),
    resultadoRival: String(resultadoRival),
    goles: [],
    amarillas: [],
    rojas: [],
    cambios: [],
    puntajes: {},
    observaciones: '',
  };
}

describe('sports assistant responses', () => {
  it('selects the next future match and excludes an elapsed same-day match', () => {
    const reply = answerSportsAssistant('¿Cuándo es el próximo partido?', context({
      calendar: calendar([
        match(1, 1, '2026-08-11', '08:00', 'Rival temprano'),
        match(2, 1, '2026-08-11', '19:00', 'Rival nocturno'),
      ]),
    }));

    expect(reply.intent).toBe('next-match');
    expect(reply.text).toContain('Rival nocturno');
    expect(reply.text).not.toContain('Rival temprano');
  });

  it('keeps an undated same-day kickoff eligible as upcoming', () => {
    const reply = answerSportsAssistant('próximo partido', context({
      calendar: calendar([match(1, 1, '2026-08-11', undefined, 'Rival sin horario')]),
    }));

    expect(reply.text).toContain('Rival sin horario');
  });

  it('isolates responses to the active squad', () => {
    const reply = answerSportsAssistant('próximo partido', context({
      calendar: calendar([
        match(1, 2, '2026-08-11', '13:00', 'Rival ajeno'),
        match(2, 1, '2026-08-11', '14:00', 'Rival propio'),
      ]),
    }));

    expect(reply.text).toContain('Rival propio');
    expect(reply.text).not.toContain('Rival ajeno');
  });

  it('returns the fallback for unsupported questions', () => {
    const reply = answerSportsAssistant('¿Cómo está el césped?', context());

    expect(reply.intent).toBe('fallback');
    expect(reply.text).toContain('Puedo consultar los datos registrados');
  });

  it('formats recent results as plain-text bullets', () => {
    const reply = answerSportsAssistant('últimos resultados', context({
      calendar: calendar([
        match(1, 1, '2026-08-01', '16:00', 'Rival uno', 'finalizado'),
        match(2, 1, '2026-08-08', '16:00', 'Rival dos', 'finalizado'),
      ], {
        '1': finalizedActa(2, 0),
        '2': finalizedActa(1, 1),
      }),
    }));

    expect(reply.text).toMatch(/^Últimos resultados:\n• /);
    expect(reply.text).toContain('Rival uno');
    expect(reply.text).toContain('Rival dos');
    expect(reply.text).not.toContain(';');
  });
});

describe('sports calendar recurrence expansion', () => {
  it('applies exclusions, overrides, and occurrence lineage', () => {
    const events: Evento[] = [{
      id: 10,
      equipoId: 1,
      tipo: 'Entrenamiento',
      fecha: '2026-08-03',
      titulo: 'Trabajo físico',
      recurrencia: { dias: [1, 3], hasta: '2026-08-10' },
      exclusiones: ['2026-08-03'],
      overrides: { '2026-08-05': { titulo: 'Trabajo táctico' } },
    }];

    const occurrences = expandSportsEventos(events, '2026-08-03', '2026-08-10');

    expect(occurrences.map((event) => event.fecha)).toEqual(['2026-08-05', '2026-08-10']);
    expect(occurrences[0].titulo).toBe('Trabajo táctico');
    expect(occurrences[0].ocurrenciaDe).toEqual({ id: 10, fecha: '2026-08-05' });
  });
});
