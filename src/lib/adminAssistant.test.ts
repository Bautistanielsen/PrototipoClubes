import { describe, expect, it } from 'vitest';
import { answerAdminAssistant } from './adminAssistant';
import type { AdminAssistantContext } from './adminAssistant';
import type { Socio, Categoria, Pago, Egreso, Reserva, Cancha, ProductoBuffet, ProductoShop, Comunicado } from '../types';

function socio(overrides: Partial<Socio> = {}): Socio {
  return { id: 1, numero: 101, nombre: 'Ana', apellido: 'Pérez', estado: 'al_dia', deuda: 0, ultimoPago: '01/07/2026', debitoAutomatico: false, telefono: '111', categoriaId: 1, ...overrides };
}

const CATEGORIAS: Categoria[] = [{ id: 1, nombre: 'Socio activo', monto: 12000 }];
const CANCHAS: Cancha[] = [{ id: 1, nombre: 'Fútbol 5', numero: 1, precio: 15000 }];

function context(overrides: Partial<AdminAssistantContext> = {}): AdminAssistantContext {
  return {
    clubNombre: 'Club Atlético Modelo',
    socios: [],
    categorias: CATEGORIAS,
    pagosHoy: [],
    egresos: [],
    reservas: [],
    canchas: CANCHAS,
    ventasShop: [],
    ventasBuffet: [],
    inscripcionesTorneo: [],
    productosBuffet: [],
    productosShop: [],
    comunicados: [],
    hoyIso: '2026-07-29',
    ...overrides,
  };
}

describe('admin assistant responses', () => {
  it('summarizes the socios padrón by estado', () => {
    const reply = answerAdminAssistant('¿cuántos socios tenemos?', context({
      socios: [socio({ id: 1, estado: 'al_dia' }), socio({ id: 2, estado: 'moroso', deuda: 12000 })],
    }));
    expect(reply.intent).toBe('socios-resumen');
    expect(reply.text).toContain('2 socios registrados');
    expect(reply.text).toContain('1 al día');
    expect(reply.text).toContain('1 morosos');
  });

  it('reports no payments collected today when pagosHoy is empty', () => {
    const reply = answerAdminAssistant('¿cuánto se cobró hoy?', context());
    expect(reply.intent).toBe('cobranza-hoy');
    expect(reply.text).toBe('Todavía no se registraron pagos hoy.');
  });

  it('totals today\'s collected payments', () => {
    const pagos: Pago[] = [{ id: 1, socioId: 1, nombre: 'Ana Pérez', monto: 12000, medio: 'Efectivo', hora: '09:00', estadoAnterior: 'por_vencer', deudaAnterior: 0, ultimoPagoAnterior: '01/06/2026' }];
    const reply = answerAdminAssistant('cobranza de hoy', context({ pagosHoy: pagos }));
    expect(reply.intent).toBe('cobranza-hoy');
    expect(reply.text).toContain('1 pago');
    expect(reply.text).toContain('$12.000');
  });

  it('computes the month balance from income and expenses', () => {
    const egresos: Egreso[] = [{ id: 1, categoria: 'Insumos y equipamiento', monto: 5000, fecha: '2026-07-01', hora: '09:00', medioPago: 'Efectivo' }];
    const reply = answerAdminAssistant('¿cómo venimos de balance?', context({
      socios: [socio({ estado: 'al_dia' })],
      egresos,
    }));
    expect(reply.intent).toBe('balance-mes');
    expect(reply.text).toContain('ingresos $12.000');
    expect(reply.text).toContain('egresos $5.000');
    expect(reply.text).toContain('positivo');
  });

  it('identifies the largest expense category', () => {
    const egresos: Egreso[] = [
      { id: 1, categoria: 'Jugadores', monto: 5000, fecha: '2026-07-01', hora: '09:00', medioPago: 'Efectivo' },
      { id: 2, categoria: 'Cuerpo técnico', monto: 20000, fecha: '2026-07-01', hora: '09:00', medioPago: 'Efectivo' },
    ];
    const reply = answerAdminAssistant('¿cuál es el mayor gasto?', context({ egresos }));
    expect(reply.intent).toBe('mayor-gasto');
    expect(reply.text).toContain('Cuerpo técnico');
    expect(reply.text).toContain('$20.000');
  });

  it('lists low-stock buffet and shop products', () => {
    const productosBuffet: ProductoBuffet[] = [{ id: 1, nombre: 'Gaseosa', precioSocio: 1000, precioNoSocio: 1300, stock: 2, stockMin: 10 }];
    const productosShop: ProductoShop[] = [{ id: 1, nombre: 'Gorra', precio: 6000, categoria: 'Accesorio', stock: 2 }];
    const reply = answerAdminAssistant('¿hay stock bajo?', context({ productosBuffet, productosShop }));
    expect(reply.intent).toBe('stock-bajo');
    expect(reply.text).toContain('Gaseosa');
    expect(reply.text).toContain('Gorra');
  });

  it('reports no low stock when everything is above threshold', () => {
    const productosBuffet: ProductoBuffet[] = [{ id: 1, nombre: 'Gaseosa', precioSocio: 1000, precioNoSocio: 1300, stock: 50, stockMin: 10 }];
    const reply = answerAdminAssistant('que falta reponer', context({ productosBuffet }));
    expect(reply.intent).toBe('stock-bajo');
    expect(reply.text).toBe('No hay productos con stock bajo por ahora.');
  });

  it('counts free court slots for today', () => {
    const reservas: Reserva[] = [{ id: 1, canchaId: 1, dia: '2026-07-29', hora: '09:00', nombre: 'Ana', monto: 15000, medioPago: 'Efectivo' }];
    const reply = answerAdminAssistant('¿hay turnos libres hoy?', context({ reservas }));
    expect(reply.intent).toBe('turnos-libres');
    expect(reply.text).toMatch(/de \d+ turnos libres/);
  });

  it('returns the most recent comunicado', () => {
    const comunicados: Comunicado[] = [{ id: 1, titulo: 'Corte de luz', cuerpo: '...', destinatario: 'Todos los socios', fecha: '20/07/2026', hora: '10:00' }];
    const reply = answerAdminAssistant('¿cuál fue el último comunicado?', context({ comunicados }));
    expect(reply.intent).toBe('ultimo-comunicado');
    expect(reply.text).toContain('Corte de luz');
  });

  it('falls back on an unrecognized question', () => {
    const reply = answerAdminAssistant('¿qué clima hace hoy?', context());
    expect(reply.intent).toBe('fallback');
    expect(reply.text).toContain('Club Atlético Modelo');
  });
});
