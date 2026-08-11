export type EstadoSocio = 'al_dia' | 'por_vencer' | 'moroso';

export type MedioPago = 'Efectivo' | 'Transferencia' | 'MercadoPago' | 'Tarjeta';

export interface Socio {
  id: number;
  numero: number;
  nombre: string;
  apellido: string;
  estado: EstadoSocio;
  deuda: number;
  ultimoPago: string;
  debitoAutomatico: boolean;
  telefono: string;
  categoriaId: number;
  medioPago?: MedioPago;
  dni?: string;
  domicilio?: string;
  email?: string;
  fechaNacimiento?: string;
  fotoPerfil?: string;
}

export interface Pago {
  id: number;
  nombre: string;
  monto: number;
  medio: MedioPago;
  hora: string;
}

export interface VentaShop {
  id: number;
  producto: string;
  precio: number;
  medio: MedioPago;
  hora: string;
}

export interface VarianteShop {
  id: number;
  talle: string;
  color: string;
  stock: number;
}

export interface ProductoShop {
  id: number;
  nombre: string;
  precio: number;
  categoria: 'Indumentaria' | 'Accesorio';
  stock: number;
  variantes?: VarianteShop[];
}

export interface ProductoBuffet {
  id: number;
  nombre: string;
  precioSocio: number;
  precioNoSocio: number;
  stock: number;
  stockMin: number;
}

export type TipoCliente = 'Socio' | 'No socio';

export interface VentaBuffet {
  id: number;
  productoId: number;
  producto: string;
  tipoCliente: TipoCliente;
  precio: number;
  medio: MedioPago;
  hora: string;
}

export interface Egreso {
  id: number;
  categoria: string;
  monto: number;
  fecha: string;
  hora: string;
  medioPago: MedioPago;
  detalle?: string;
}

export interface Comunicado {
  id: number;
  titulo: string;
  cuerpo: string;
  destinatario: string;
  fecha: string;
  hora: string;
  imagen?: string;
}

export interface Cancha {
  id: number;
  nombre: string;
  numero: number;
  precio: number;
}

export interface Reserva {
  id: number;
  canchaId: number;
  dia: string;
  hora: string;
  nombre: string;
  monto: number;
  medioPago?: MedioPago;
}

export type TipoPartido = 'Liga' | 'Amistoso' | 'Copa' | 'Torneo';
export type Condicion = 'Local' | 'Visitante';

export interface Partido {
  id: number;
  fecha: string;
  hora: string;
  tipo: TipoPartido;
  rival: string;
  condicion: Condicion;
}

export interface Categoria {
  id: number;
  nombre: string;
  monto: number;
}

export type EstadoJugador = 'disponible' | 'lesionado';

export interface EquipoDeportivo {
  id: number;
  nombre: string;
  disciplina: string;
}

export interface Jugador {
  id: number;
  equipoId: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
  estado: EstadoJugador;
  motivoLesion?: string;
  fechaEstimadaRecuperacion?: string;
  foto?: string;
  posicion?: string;
}

export type StatisticsView = 'summary' | 'players' | 'tactics';

export type SistemaFormacion =
  | '4-4-2' | '4-3-3' | '4-2-3-1' | '4-1-4-1' | '4-3-1-2' | '4-1-2-1-2'
  | '4-2-2-2' | '4-5-1' | '3-5-2' | '3-4-3' | '3-4-2-1' | '3-4-1-2'
  | '3-2-4-1' | '5-3-2' | '5-4-1';

export type RolFormacion = 'capitan' | 'penales' | 'tiros_libres' | 'corner_izquierdo' | 'corner_derecho';

export interface JugadorFormacion {
  jugadorId: number;
  zona: 'titular' | 'suplente';
  x: number;
  y: number;
  dorsal: string;
}

export interface Formacion {
  id: number;
  equipoId: number;
  nombre: string;
  sistema: SistemaFormacion;
  jugadores: JugadorFormacion[];
  roles: Partial<Record<RolFormacion, number>>;
  camiseta: { estilo: 'lisa' | 'franja' | 'rayas'; principal: string; secundaria: string; texto: string };
}

export type EstadoFilter = 'todos' | EstadoSocio;

export type AdminScreen =
  | 'dashboard'
  | 'socios'
  | 'cobranza'
  | 'ventas'
  | 'buffet'
  | 'canchas'
  | 'calendario'
  | 'torneos'
  | 'reportes'
  | 'egresos'
  | 'comunicados'
  | 'config';

export type DeportivoScreen = 'deportivo_inicio' | 'equipos' | 'formaciones' | 'partidos' | 'calendario' | 'estadisticas';
export type PortalScreen = 'portal_login' | 'portal_inicio' | 'portal_cuota' | 'portal_reservas' | 'portal_novedades' | 'portal_perfil' | 'portal_hacete_socio' | 'portal_mis_reservas' | 'portal_torneos' | 'portal_partidos';
export type Screen = AdminScreen | DeportivoScreen | PortalScreen;

export type Modulo = 'administrativo' | 'deportivo' | 'socio';

export type EstadoRecordatorio = 'enviado' | 'pendiente';

export type EstadoTorneo = 'Próximo' | 'En curso' | 'Finalizado';

export interface Torneo {
  id: number;
  nombre: string;
  deporte: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  cupo: number;
  valorInscripcion: number;
  descripcion: string;
  premio: string;
}

export interface EquipoTorneo {
  id: number;
  torneoId: number;
  nombre: string;
}

export interface PartidoTorneo {
  id: number;
  torneoId: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  golesLocal: number | null;
  golesVisitante: number | null;
}

export interface InscripcionTorneo {
  id: number;
  torneoId: number;
  nombreEquipo: string;
  integrantes: string;
  monto: number;
  medioPago: MedioPago;
}
