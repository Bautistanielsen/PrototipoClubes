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

export type EstadoFilter = 'todos' | EstadoSocio;

export type Screen =
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

export type EstadoRecordatorio = 'enviado' | 'pendiente';
