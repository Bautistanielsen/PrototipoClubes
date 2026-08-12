import { describe, expect, it } from 'vitest';
import { answerHinchaAssistant } from './hinchaAssistant';
import type { HinchaAssistantContext } from './hinchaAssistant';
import type { Socio, Reserva, Torneo, InscripcionTorneo, Comunicado, EquipoDeportivo } from '../types';
import type { Evento, SportsCalendarData } from './sportsCalendar';

const SOCIO: Socio = { id: 1, numero: 101, nombre: 'Ana', apellido: 'Pérez', estado: 'al_dia', deuda: 0, ultimoPago: '05/07/2026', debitoAutomatico: false, telefono: '111', categoriaId: 1 };
const EQUIPO: EquipoDeportivo = { id: 1, nombre: 'Primera', disciplina: 'Fútbol' };

function calendar(eventos: Evento[]): SportsCalendarData {
  return { eventos, actas: {}, prefs: { visibles: [], colores: {} } };
}

function match(id: number, equipoId: number, fecha: string, horaInicio: string | undefined, rival: string, estado?: Evento['estado']): Evento {
  return { id, equipoId, tipo: 'Partido', fecha, horaInicio, rival, condicion: 'Local', estado };
}

function context(overrides: Partial<HinchaAssistantContext> = {}): HinchaAssistantContext {
  return {
    clubNombre: 'Club Atlético Modelo',
    socio: SOCIO,
    esSocio: true,
    reservas: [],
    torneos: [],
    inscripcionesTorneo: [],
    comunicados: [],
    comunicadosLeidos: [],
    equiposDeportivos: [EQUIPO],
    calendar: calendar([]),
    hoyIso: '2026-07-29',
    ...overrides,
  };
}

describe('hincha assistant responses', () => {
  it('reports the cuota status for a socio al día', () => {
    const reply = answerHinchaAssistant('¿cómo está mi cuota?', context());
    expect(reply.intent).toBe('cuota');
    expect(reply.text).toContain('al día');
  });

  it('reports the debt amount for a moroso socio', () => {
    const reply = answerHinchaAssistant('cuanto debo', context({ socio: { ...SOCIO, estado: 'moroso', deuda: 12000 } }));
    expect(reply.intent).toBe('cuota');
    expect(reply.text).toContain('$12.000');
  });

  it('redirects to hacete-socio info when a hincha asks about cuota', () => {
    const reply = answerHinchaAssistant('vence mi cuota', context({ esSocio: false }));
    expect(reply.intent).toBe('cuota');
    expect(reply.text).toContain('cómo me hago socio');
  });

  it('lists reservations made under the member\'s name', () => {
    const reservas: Reserva[] = [{ id: 1, canchaId: 1, dia: '2026-08-01', hora: '18:00', nombre: 'Ana Pérez', monto: 15000, medioPago: 'Efectivo' }];
    const reply = answerHinchaAssistant('¿tengo reservas?', context({ reservas }));
    expect(reply.intent).toBe('mis-reservas');
    expect(reply.text).toContain('18:00');
  });

  it('reports no reservations when there are none for the member', () => {
    const reply = answerHinchaAssistant('mi cancha reservada', context());
    expect(reply.intent).toBe('mis-reservas');
    expect(reply.text).toBe('No tenés reservas de cancha registradas.');
  });

  it('reports the latest comunicado and unread count', () => {
    const comunicados: Comunicado[] = [
      { id: 1, titulo: 'Corte de luz', cuerpo: '...', destinatario: 'Todos los socios', fecha: '20/07/2026', hora: '10:00' },
      { id: 2, titulo: 'Vieja novedad', cuerpo: '...', destinatario: 'Todos los socios', fecha: '01/07/2026', hora: '09:00' },
    ];
    const reply = answerHinchaAssistant('¿hay novedades?', context({ comunicados, comunicadosLeidos: [2] }));
    expect(reply.intent).toBe('novedades');
    expect(reply.text).toContain('Corte de luz');
    expect(reply.text).toContain('1 novedad');
  });

  it('lists open tournaments and marks the one the fan is registered for', () => {
    const torneos: Torneo[] = [{ id: 1, nombre: 'Copa Aniversario', deporte: 'Fútbol 5', fechaInicio: '2026-08-15', fechaFin: '2026-08-16', lugar: 'Cancha 1', cupo: 12, valorInscripcion: 15000, descripcion: '', premio: '' }];
    const inscripcionesTorneo: InscripcionTorneo[] = [{ id: 1, torneoId: 1, nombreEquipo: 'Los Halcones', integrantes: '...', monto: 15000, medioPago: 'Efectivo' }];
    const reply = answerHinchaAssistant('¿hay torneos abiertos?', context({ torneos, inscripcionesTorneo }));
    expect(reply.intent).toBe('torneos');
    expect(reply.text).toContain('Copa Aniversario');
    expect(reply.text).toContain('Los Halcones');
  });

  it('finds the next match across every squad', () => {
    const reply = answerHinchaAssistant('¿cuándo es el próximo partido?', context({
      calendar: calendar([match(1, 1, '2026-08-02', '16:00', 'Deportivo Belgrano')]),
    }));
    expect(reply.intent).toBe('proximo-partido');
    expect(reply.text).toContain('Deportivo Belgrano');
    expect(reply.text).toContain('Primera');
  });

  it('explains how to become a member when the fan is not yet a socio', () => {
    const reply = answerHinchaAssistant('¿cómo me hago socio?', context({ esSocio: false }));
    expect(reply.intent).toBe('hacete-socio');
    expect(reply.text).toContain('Hacete socio');
  });

  it('falls back on an unrecognized question', () => {
    const reply = answerHinchaAssistant('¿qué clima hace hoy?', context());
    expect(reply.intent).toBe('fallback');
  });
});
