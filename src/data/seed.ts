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
  EquipoDeportivo,
  Jugador,
  Torneo,
  EquipoTorneo,
  PartidoTorneo,
} from '../types';
import brunoFernandez from '../assets/players/bruno-fernandez.jpg';
import facundoHerrera from '../assets/players/facundo-herrera.jpg';
import joaquinLopez from '../assets/players/joaquin-lopez.jpg';
import lucasDominguez from '../assets/players/lucas-dominguez.jpg';
import mateoBenitez from '../assets/players/mateo-benitez.jpg';
import nicolasCabrera from '../assets/players/nicolas-cabrera.jpg';
import santiagoGimenez from '../assets/players/santiago-gimenez.jpg';
import tomasAcosta from '../assets/players/tomas-acosta.jpg';
import valentinIbarra from '../assets/players/valentin-ibarra.jpg';
import martinSosa from '../assets/players/martin-sosa.jpg';
import emilianoRivero from '../assets/players/emiliano-rivero.jpg';
import agustinPereyra from '../assets/players/agustin-pereyra.jpg';
import ramiroVega from '../assets/players/ramiro-vega.jpg';
import lautaroNavarro from '../assets/players/lautaro-navarro.jpg';
import federicoRios from '../assets/players/federico-rios.jpg';
import alanMedina from '../assets/players/alan-medina.jpg';
import ignacioFarias from '../assets/players/ignacio-farias.jpg';

export const fotosJugadoresDemo = [
  brunoFernandez, facundoHerrera, joaquinLopez, lucasDominguez, mateoBenitez,
  nicolasCabrera, santiagoGimenez, tomasAcosta, valentinIbarra, martinSosa,
  emilianoRivero, agustinPereyra, ramiroVega, lautaroNavarro, federicoRios,
  alanMedina, ignacioFarias,
];

export const CUOTA = 12000;
export const PRECIO_TURNO = 8000;
export const HOY_ISO = '2026-07-29';

export const seedSocios: Socio[] = [
  { id: 1, numero: 101, nombre: 'Martina', apellido: 'Gómez', estado: 'al_dia', deuda: 0, ultimoPago: '05/07/2026', debitoAutomatico: true, telefono: '+54 9 223 455-1201' },
  { id: 2, numero: 102, nombre: 'Lucas', apellido: 'Fernández', estado: 'al_dia', deuda: 0, ultimoPago: '03/07/2026', debitoAutomatico: true, telefono: '+54 9 223 455-1202' },
  { id: 3, numero: 103, nombre: 'Sofía', apellido: 'Rodríguez', estado: 'al_dia', deuda: 0, ultimoPago: '07/07/2026', debitoAutomatico: true, telefono: '+54 9 223 455-1203' },
  { id: 4, numero: 104, nombre: 'Mateo', apellido: 'Álvarez', estado: 'al_dia', deuda: 0, ultimoPago: '02/07/2026', debitoAutomatico: false, telefono: '+54 9 223 455-1204' },
  { id: 5, numero: 105, nombre: 'Valentina', apellido: 'Torres', estado: 'por_vencer', deuda: 0, ultimoPago: '05/06/2026', debitoAutomatico: false, telefono: '+54 9 223 455-1205' },
  { id: 6, numero: 106, nombre: 'Benjamín', apellido: 'Sosa', estado: 'al_dia', deuda: 0, ultimoPago: '10/07/2026', debitoAutomatico: true, telefono: '+54 9 223 455-1206' },
  { id: 7, numero: 107, nombre: 'Catalina', apellido: 'Romero', estado: 'al_dia', deuda: 0, ultimoPago: '08/07/2026', debitoAutomatico: false, telefono: '+54 9 223 455-1207' },
  { id: 8, numero: 108, nombre: 'Thiago', apellido: 'Díaz', estado: 'moroso', deuda: 24000, ultimoPago: '12/05/2026', debitoAutomatico: false, telefono: '+54 9 223 455-1208' },
  { id: 9, numero: 109, nombre: 'Emma', apellido: 'Acosta', estado: 'al_dia', deuda: 0, ultimoPago: '04/07/2026', debitoAutomatico: true, telefono: '+54 9 223 455-1209' },
  { id: 10, numero: 110, nombre: 'Joaquín', apellido: 'Medina', estado: 'por_vencer', deuda: 0, ultimoPago: '05/06/2026', debitoAutomatico: false, telefono: '+54 9 223 455-1210' },
  { id: 11, numero: 111, nombre: 'Isabella', apellido: 'Herrera', estado: 'al_dia', deuda: 0, ultimoPago: '06/07/2026', debitoAutomatico: true, telefono: '+54 9 223 455-1211' },
  { id: 12, numero: 112, nombre: 'Santino', apellido: 'Molina', estado: 'moroso', deuda: 36000, ultimoPago: '20/04/2026', debitoAutomatico: false, telefono: '+54 9 223 455-1212' },
  { id: 13, numero: 113, nombre: 'Renata', apellido: 'Ortiz', estado: 'al_dia', deuda: 0, ultimoPago: '09/07/2026', debitoAutomatico: true, telefono: '+54 9 223 455-1213' },
  { id: 14, numero: 114, nombre: 'Bautista', apellido: 'Castro', estado: 'al_dia', deuda: 0, ultimoPago: '01/07/2026', debitoAutomatico: true, telefono: '+54 9 223 455-1214' },
  { id: 15, numero: 115, nombre: 'Delfina', apellido: 'Núñez', estado: 'por_vencer', deuda: 0, ultimoPago: '05/06/2026', debitoAutomatico: false, telefono: '+54 9 223 455-1215' },
  { id: 16, numero: 116, nombre: 'Facundo', apellido: 'Ríos', estado: 'al_dia', deuda: 0, ultimoPago: '11/07/2026', debitoAutomatico: true, telefono: '+54 9 223 455-1216' },
  { id: 17, numero: 117, nombre: 'Pilar', apellido: 'Vega', estado: 'al_dia', deuda: 0, ultimoPago: '05/07/2026', debitoAutomatico: false, telefono: '+54 9 223 455-1217' },
  { id: 18, numero: 118, nombre: 'Agustín', apellido: 'Paz', estado: 'moroso', deuda: 12000, ultimoPago: '15/06/2026', debitoAutomatico: false, telefono: '+54 9 223 455-1218' },
];

export const seedCanchas: Cancha[] = [
  { id: 1, nombre: 'Fútbol 5', numero: 1, precio: 15000 },
  { id: 2, nombre: 'Fútbol 5', numero: 2, precio: 15000 },
  { id: 3, nombre: 'Pádel', numero: 1, precio: 9000 },
  { id: 4, nombre: 'Pádel', numero: 2, precio: 9000 },
  { id: 5, nombre: 'Tenis', numero: 1, precio: 7000 },
];

export const seedReservas: Reserva[] = [
  { id: 1, canchaId: 1, dia: '2026-07-29', hora: '18:00', nombre: 'Martina Gómez', medioPago: 'Efectivo' },
  { id: 2, canchaId: 1, dia: '2026-07-29', hora: '19:00', nombre: 'Benjamín Sosa', medioPago: 'Transferencia' },
  { id: 3, canchaId: 2, dia: '2026-07-30', hora: '20:00', nombre: 'Emma Acosta', medioPago: 'Efectivo' },
  { id: 4, canchaId: 3, dia: '2026-07-29', hora: '17:00', nombre: 'Sofía Rodríguez', medioPago: 'Transferencia' },
  { id: 5, canchaId: 3, dia: '2026-07-29', hora: '20:00', nombre: 'Isabella Herrera', medioPago: 'Efectivo' },
  { id: 6, canchaId: 4, dia: '2026-07-30', hora: '09:00', nombre: 'Renata Ortiz', medioPago: 'Transferencia' },
  { id: 7, canchaId: 5, dia: '2026-07-29', hora: '10:00', nombre: 'Lucas Fernández', medioPago: 'Efectivo' },
  { id: 8, canchaId: 5, dia: '2026-08-02', hora: '11:00', nombre: 'Bautista Castro', medioPago: 'Transferencia' },
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
  {
    id: 1,
    nombre: 'Buzo oficial',
    precio: 18000,
    categoria: 'Indumentaria',
    stock: 8,
    variantes: [
      { id: 1, talle: 'M', color: 'Negro', stock: 5 },
      { id: 2, talle: 'L', color: 'Azul', stock: 3 },
    ],
  },
  {
    id: 2,
    nombre: 'Remera oficial',
    precio: 9000,
    categoria: 'Indumentaria',
    stock: 12,
    variantes: [
      { id: 3, talle: 'S', color: 'Blanco', stock: 4 },
      { id: 4, talle: 'M', color: 'Blanco', stock: 5 },
      { id: 5, talle: 'L', color: 'Negro', stock: 3 },
    ],
  },
  { id: 3, nombre: 'Gorra', precio: 6000, categoria: 'Accesorio', stock: 3 },
  { id: 4, nombre: 'Botella deportiva', precio: 6000, categoria: 'Accesorio', stock: 20 },
  { id: 5, nombre: 'Bufanda', precio: 5000, categoria: 'Accesorio', stock: 2 },
  { id: 6, nombre: 'Llavero', precio: 2500, categoria: 'Accesorio', stock: 15 },
  { id: 7, nombre: 'Mochila', precio: 15000, categoria: 'Accesorio', stock: 5 },
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
    hora: '09:15',
  },
  {
    id: 2,
    titulo: 'Nuevo horario de pileta de verano',
    cuerpo: 'A partir de esta semana la pileta abre de 9 a 20 hs de lunes a domingo.',
    destinatario: 'Todos los socios',
    fecha: '15/06/2026',
    hora: '11:40',
  },
  {
    id: 3,
    titulo: 'Inscripciones abiertas para la Copa Aniversario',
    cuerpo: 'Ya podés anotar a tu equipo para el torneo de Fútbol 5 del 15 y 16 de agosto. Cupos limitados.',
    destinatario: 'Todos los socios',
    fecha: '20/07/2026',
    hora: '18:05',
  },
  {
    id: 4,
    titulo: 'Nuevo menú en el buffet',
    cuerpo: 'Sumamos opciones vegetarianas y descuentos especiales para socios todos los mediodías.',
    destinatario: 'Todos los socios',
    hora: '13:20',
    fecha: '24/07/2026',
  },
];

export const seedCategorias: Categoria[] = [
  { id: 1, nombre: 'Socio activo', monto: 12000 },
  { id: 2, nombre: 'Socio jubilado', monto: 6000 },
  { id: 3, nombre: 'Socio infantil', monto: 8000 },
];

export const seedEquiposDeportivos: EquipoDeportivo[] = [
  { id: 1, nombre: 'Primera división', disciplina: 'Fútbol' },
  { id: 2, nombre: 'Sub 17', disciplina: 'Fútbol' },
  { id: 3, nombre: 'Reserva', disciplina: 'Fútbol' },
  { id: 4, nombre: 'Primera', disciplina: 'Básquet' },
];

export const seedJugadores: Jugador[] = [
  { id: 1, equipoId: 1, nombre: 'Bruno', apellido: 'Fernández', fechaNacimiento: '2001-04-18', telefono: '223 555 0141', estado: 'disponible', foto: brunoFernandez },
  { id: 2, equipoId: 1, nombre: 'Facundo', apellido: 'Herrera', fechaNacimiento: '1999-11-03', telefono: '223 555 0182', estado: 'disponible', foto: facundoHerrera },
  { id: 3, equipoId: 1, nombre: 'Joaquín', apellido: 'López', fechaNacimiento: '2002-07-21', telefono: '223 555 0115', estado: 'lesionado', foto: joaquinLopez },
  { id: 4, equipoId: 1, nombre: 'Lucas', apellido: 'Domínguez', fechaNacimiento: '1998-01-30', telefono: '223 555 0167', estado: 'disponible', foto: lucasDominguez },
  { id: 5, equipoId: 1, nombre: 'Mateo', apellido: 'Benítez', fechaNacimiento: '2000-09-12', telefono: '223 555 0109', estado: 'disponible', foto: mateoBenitez },
  { id: 6, equipoId: 1, nombre: 'Nicolás', apellido: 'Cabrera', fechaNacimiento: '1997-06-25', telefono: '223 555 0134', estado: 'disponible', foto: nicolasCabrera },
  { id: 7, equipoId: 1, nombre: 'Santiago', apellido: 'Giménez', fechaNacimiento: '2003-02-14', telefono: '223 555 0176', estado: 'disponible', foto: santiagoGimenez },
  { id: 8, equipoId: 2, nombre: 'Tomás', apellido: 'Acosta', fechaNacimiento: '2009-08-09', telefono: '223 555 0123', estado: 'disponible', foto: tomasAcosta },
  { id: 9, equipoId: 2, nombre: 'Valentín', apellido: 'Ibarra', fechaNacimiento: '2008-12-02', telefono: '223 555 0194', estado: 'disponible', foto: valentinIbarra },
  { id: 10, equipoId: 1, nombre: 'Martín', apellido: 'Sosa', fechaNacimiento: '1999-03-16', telefono: '223 555 0158', estado: 'disponible', foto: martinSosa },
  { id: 11, equipoId: 1, nombre: 'Emiliano', apellido: 'Rivero', fechaNacimiento: '2001-10-27', telefono: '223 555 0121', estado: 'disponible', foto: emilianoRivero },
  { id: 12, equipoId: 1, nombre: 'Agustín', apellido: 'Pereyra', fechaNacimiento: '1998-05-08', telefono: '223 555 0172', estado: 'disponible', foto: agustinPereyra },
  { id: 13, equipoId: 1, nombre: 'Ramiro', apellido: 'Vega', fechaNacimiento: '2002-01-19', telefono: '223 555 0148', estado: 'disponible', foto: ramiroVega },
  { id: 14, equipoId: 1, nombre: 'Lautaro', apellido: 'Navarro', fechaNacimiento: '2000-07-03', telefono: '223 555 0191', estado: 'disponible', foto: lautaroNavarro },
  { id: 15, equipoId: 1, nombre: 'Federico', apellido: 'Ríos', fechaNacimiento: '1997-12-11', telefono: '223 555 0163', estado: 'disponible', foto: federicoRios },
  { id: 16, equipoId: 1, nombre: 'Alan', apellido: 'Medina', fechaNacimiento: '2003-04-24', telefono: '223 555 0118', estado: 'disponible', foto: alanMedina },
  { id: 17, equipoId: 1, nombre: 'Ignacio', apellido: 'Farías', fechaNacimiento: '2001-08-30', telefono: '223 555 0139', estado: 'lesionado', foto: ignacioFarias },
];

export const seedTorneos: Torneo[] = [
  { id: 1, nombre: 'Copa de Tenis Interna', deporte: 'Tenis', fechaInicio: '2026-07-10', fechaFin: '2026-07-20', lugar: 'Cancha de Tenis', cupo: 8, valorInscripcion: 5000, descripcion: 'Torneo finalizado, formato eliminación directa.', premio: 'Trofeo y medalla para el campeón' },
  { id: 2, nombre: 'Torneo Relámpago de Pádel', deporte: 'Pádel', fechaInicio: '2026-07-28', fechaFin: '2026-07-31', lugar: 'Canchas de Pádel', cupo: 16, valorInscripcion: 8000, descripcion: 'Categorías A, B y C.', premio: 'Kit deportivo del club + $20.000' },
  { id: 3, nombre: 'Copa Aniversario de Fútbol 5', deporte: 'Fútbol 5', fechaInicio: '2026-08-15', fechaFin: '2026-08-16', lugar: 'Cancha Fútbol 5', cupo: 12, valorInscripcion: 15000, descripcion: 'Torneo relámpago para socios, equipos de 7 jugadores.', premio: 'Copa + entradas para el próximo partido del primer equipo' },
];

export const seedEquiposTorneo: EquipoTorneo[] = [
  { id: 1, torneoId: 2, nombre: 'Los Halcones' },
  { id: 2, torneoId: 2, nombre: 'Dupla Norte' },
  { id: 3, torneoId: 2, nombre: 'Set Point' },
  { id: 4, torneoId: 2, nombre: 'Los Zurdos' },
];

export const seedPartidosTorneo: PartidoTorneo[] = [
  { id: 1, torneoId: 2, equipoLocalId: 1, equipoVisitanteId: 2, golesLocal: 6, golesVisitante: 3 },
  { id: 2, torneoId: 2, equipoLocalId: 3, equipoVisitanteId: 4, golesLocal: 4, golesVisitante: 4 },
  { id: 3, torneoId: 2, equipoLocalId: 1, equipoVisitanteId: 3, golesLocal: null, golesVisitante: null },
];
