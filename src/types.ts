export type EstadoSocio = 'al_dia' | 'por_vencer' | 'moroso';

export type MedioPago = 'Efectivo' | 'Transferencia';

export interface Socio {
  id: number;
  numero: number;
  nombre: string;
  apellido: string;
  estado: EstadoSocio;
  deuda: number;
  ultimoPago: string;
  debitoAutomatico: boolean;
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

export interface ProductoShop {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
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
}

export interface Comunicado {
  id: number;
  titulo: string;
  cuerpo: string;
  destinatario: string;
  fecha: string;
}

export interface Cancha {
  id: number;
  nombre: string;
}

export interface Reserva {
  id: number;
  canchaId: number;
  dia: string;
  hora: string;
  nombre: string;
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
}

export interface Jugador {
  id: number;
  equipoId: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
  estado: EstadoJugador;
  foto?: string;
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
  | 'reportes'
  | 'egresos'
  | 'comunicados'
  | 'config';

export type DeportivoScreen = 'deportivo_inicio' | 'equipos' | 'calendario';
export type PortalScreen = 'portal_inicio' | 'portal_cuota' | 'portal_reservas' | 'portal_mas' | 'portal_novedades' | 'portal_perfil';
export type Screen = AdminScreen | DeportivoScreen | PortalScreen;

export type Modulo = 'administrativo' | 'deportivo' | 'socio';

export type EstadoRecordatorio = 'enviado' | 'pendiente';
