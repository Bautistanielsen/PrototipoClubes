import type {
  Socio,
  Cancha,
  Reserva,
  Partido,
  Pago,
  VentaShop,
  ProductoShop,
  ProductoBuffet,
  VentaBuffet,
  Egreso,
  Comunicado,
  Categoria,
} from '../types';

export const CUOTA = 12000;
export const PRECIO_TURNO = 8000;
export const HOY_ISO = '2026-07-29';

export const seedSocios: Socio[] = [
  { id: 1, numero: 101, nombre: 'Martina', apellido: 'Gómez', estado: 'al_dia', deuda: 0, ultimoPago: '05/07/2026', debitoAutomatico: true },
  { id: 2, numero: 102, nombre: 'Lucas', apellido: 'Fernández', estado: 'al_dia', deuda: 0, ultimoPago: '03/07/2026', debitoAutomatico: true },
  { id: 3, numero: 103, nombre: 'Sofía', apellido: 'Rodríguez', estado: 'al_dia', deuda: 0, ultimoPago: '07/07/2026', debitoAutomatico: true },
  { id: 4, numero: 104, nombre: 'Mateo', apellido: 'Álvarez', estado: 'al_dia', deuda: 0, ultimoPago: '02/07/2026', debitoAutomatico: false },
  { id: 5, numero: 105, nombre: 'Valentina', apellido: 'Torres', estado: 'por_vencer', deuda: 0, ultimoPago: '05/06/2026', debitoAutomatico: false },
  { id: 6, numero: 106, nombre: 'Benjamín', apellido: 'Sosa', estado: 'al_dia', deuda: 0, ultimoPago: '10/07/2026', debitoAutomatico: true },
  { id: 7, numero: 107, nombre: 'Catalina', apellido: 'Romero', estado: 'al_dia', deuda: 0, ultimoPago: '08/07/2026', debitoAutomatico: false },
  { id: 8, numero: 108, nombre: 'Thiago', apellido: 'Díaz', estado: 'moroso', deuda: 24000, ultimoPago: '12/05/2026', debitoAutomatico: false },
  { id: 9, numero: 109, nombre: 'Emma', apellido: 'Acosta', estado: 'al_dia', deuda: 0, ultimoPago: '04/07/2026', debitoAutomatico: true },
  { id: 10, numero: 110, nombre: 'Joaquín', apellido: 'Medina', estado: 'por_vencer', deuda: 0, ultimoPago: '05/06/2026', debitoAutomatico: false },
  { id: 11, numero: 111, nombre: 'Isabella', apellido: 'Herrera', estado: 'al_dia', deuda: 0, ultimoPago: '06/07/2026', debitoAutomatico: true },
  { id: 12, numero: 112, nombre: 'Santino', apellido: 'Molina', estado: 'moroso', deuda: 36000, ultimoPago: '20/04/2026', debitoAutomatico: false },
  { id: 13, numero: 113, nombre: 'Renata', apellido: 'Ortiz', estado: 'al_dia', deuda: 0, ultimoPago: '09/07/2026', debitoAutomatico: true },
  { id: 14, numero: 114, nombre: 'Bautista', apellido: 'Castro', estado: 'al_dia', deuda: 0, ultimoPago: '01/07/2026', debitoAutomatico: true },
  { id: 15, numero: 115, nombre: 'Delfina', apellido: 'Núñez', estado: 'por_vencer', deuda: 0, ultimoPago: '05/06/2026', debitoAutomatico: false },
  { id: 16, numero: 116, nombre: 'Facundo', apellido: 'Ríos', estado: 'al_dia', deuda: 0, ultimoPago: '11/07/2026', debitoAutomatico: true },
  { id: 17, numero: 117, nombre: 'Pilar', apellido: 'Vega', estado: 'al_dia', deuda: 0, ultimoPago: '05/07/2026', debitoAutomatico: false },
  { id: 18, numero: 118, nombre: 'Agustín', apellido: 'Paz', estado: 'moroso', deuda: 12000, ultimoPago: '15/06/2026', debitoAutomatico: false },
];

export const seedCanchas: Cancha[] = [
  { id: 1, nombre: 'Fútbol 5' },
  { id: 2, nombre: 'Pádel' },
  { id: 3, nombre: 'Tenis' },
];

export const seedReservas: Reserva[] = [
  { id: 1, canchaId: 1, dia: '2026-07-29', hora: '18:00', nombre: 'Martina Gómez' },
  { id: 2, canchaId: 1, dia: '2026-07-29', hora: '19:00', nombre: 'Benjamín Sosa' },
  { id: 3, canchaId: 1, dia: '2026-07-30', hora: '20:00', nombre: 'Emma Acosta' },
  { id: 4, canchaId: 2, dia: '2026-07-29', hora: '17:00', nombre: 'Sofía Rodríguez' },
  { id: 5, canchaId: 2, dia: '2026-07-29', hora: '20:00', nombre: 'Isabella Herrera' },
  { id: 6, canchaId: 2, dia: '2026-07-30', hora: '09:00', nombre: 'Renata Ortiz' },
  { id: 7, canchaId: 3, dia: '2026-07-29', hora: '10:00', nombre: 'Lucas Fernández' },
  { id: 8, canchaId: 3, dia: '2026-08-02', hora: '11:00', nombre: 'Bautista Castro' },
];

export const seedPartidos: Partido[] = [
  { id: 1, fecha: '2026-08-02', hora: '16:00', tipo: 'Liga', rival: 'Deportivo Belgrano', condicion: 'Local' },
  { id: 2, fecha: '2026-08-09', hora: '15:30', tipo: 'Amistoso', rival: 'Club Social San Martín', condicion: 'Visitante' },
  { id: 3, fecha: '2026-08-16', hora: '16:00', tipo: 'Liga', rival: 'Atlético Peñarol', condicion: 'Local' },
  { id: 4, fecha: '2026-08-23', hora: '14:00', tipo: 'Copa', rival: 'Unión Progresista', condicion: 'Visitante' },
];

export const seedRecordatorios: Record<number, 'enviado' | 'pendiente'> = {
  8: 'enviado',
  12: 'pendiente',
  18: 'pendiente',
};

export const seedPagosHoy: Pago[] = [
  { id: 1, nombre: 'Facundo Ríos', monto: 12000, medio: 'Efectivo', hora: '09:15' },
  { id: 2, nombre: 'Pilar Vega', monto: 12000, medio: 'Transferencia', hora: '10:40' },
];

export const seedProductosShop: ProductoShop[] = [
  { id: 1, nombre: 'Buzo oficial', precio: 18000, stock: 8 },
  { id: 2, nombre: 'Remera oficial', precio: 9000, stock: 12 },
  { id: 3, nombre: 'Gorra', precio: 6000, stock: 3 },
  { id: 4, nombre: 'Botella deportiva', precio: 6000, stock: 20 },
  { id: 5, nombre: 'Bufanda', precio: 5000, stock: 2 },
  { id: 6, nombre: 'Llavero', precio: 2500, stock: 15 },
  { id: 7, nombre: 'Mochila', precio: 15000, stock: 5 },
];

export const seedVentasShop: VentaShop[] = [
  { id: 1, producto: 'Buzo oficial', precio: 18000, medio: 'Efectivo', hora: '10:20' },
  { id: 2, producto: 'Botella deportiva', precio: 6000, medio: 'Transferencia', hora: '11:05' },
];

export const seedProductosBuffet: ProductoBuffet[] = [
  { id: 1, nombre: 'Gaseosa 500ml', precioSocio: 1500, precioNoSocio: 2000, stock: 8, stockMin: 10 },
  { id: 2, nombre: 'Agua mineral', precioSocio: 1000, precioNoSocio: 1300, stock: 20, stockMin: 10 },
  { id: 3, nombre: 'Alfajor', precioSocio: 1200, precioNoSocio: 1500, stock: 6, stockMin: 10 },
  { id: 4, nombre: 'Choripán', precioSocio: 3500, precioNoSocio: 4200, stock: 15, stockMin: 8 },
  { id: 5, nombre: 'Café', precioSocio: 1000, precioNoSocio: 1300, stock: 30, stockMin: 10 },
];

export const seedVentasBuffet: VentaBuffet[] = [
  { id: 1, productoId: 4, producto: 'Choripán', tipoCliente: 'Socio', precio: 3500, medio: 'Efectivo', hora: '12:30' },
  { id: 2, productoId: 1, producto: 'Gaseosa 500ml', tipoCliente: 'No socio', precio: 2000, medio: 'Transferencia', hora: '13:10' },
];

export const seedEgresos: Egreso[] = [
  { id: 1, categoria: 'Cuerpo técnico', monto: 80000 },
  { id: 2, categoria: 'Jugadores', monto: 35000 },
  { id: 3, categoria: 'Mantenimiento de predio', monto: 45000 },
  { id: 4, categoria: 'Servicios (luz, agua, gas)', monto: 28000 },
  { id: 5, categoria: 'Insumos y equipamiento', monto: 15000 },
];

export const seedComunicados: Comunicado[] = [
  {
    id: 1,
    titulo: 'Recordatorio de pago de cuota de julio',
    cuerpo:
      'Recordamos a los socios que la cuota de julio vence el día 5. Podés abonarla en secretaría o por transferencia.',
    destinatario: 'Todos los socios',
    fecha: '02/07/2026',
  },
  {
    id: 2,
    titulo: 'Nuevo horario de pileta de verano',
    cuerpo: 'A partir de esta semana la pileta abre de 9 a 20 hs de lunes a domingo.',
    destinatario: 'Todos los socios',
    fecha: '15/06/2026',
  },
];

export const seedCategorias: Categoria[] = [
  { id: 1, nombre: 'Socio activo', monto: 12000 },
  { id: 2, nombre: 'Socio jubilado', monto: 6000 },
  { id: 3, nombre: 'Socio infantil', monto: 8000 },
];
