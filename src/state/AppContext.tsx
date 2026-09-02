import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type {
  Screen,
  Socio,
  Cancha,
  Reserva,
  Partido,
  TipoPartido,
  Condicion,
  Pago,
  VentaShop,
  ProductoShop,
  VarianteShop,
  ProductoBuffet,
  VentaBuffet,
  Egreso,
  Sponsor,
  UbicacionSponsor,
  Comunicado,
  Categoria,
  MedioPago,
  TipoCliente,
  EstadoFilter,
  EstadoRecordatorio,
  Modulo,
  EquipoDeportivo,
  Jugador,
  EstadoJugador,
  Formacion,
  SistemaFormacion,
  JugadorFormacion,
  Torneo,
  EquipoTorneo,
  PartidoTorneo,
  InscripcionTorneo,
  StatisticsView,
  EstadoTorneoFilter,
  CanalEnvio,
} from '../types';
import {
  seedSocios,
  seedCanchas,
  seedReservas,
  seedPartidos,
  seedRecordatorios,
  seedPagosHoy,
  seedVentasShop,
  seedProductosShop,
  seedProductosBuffet,
  seedVentasBuffet,
  seedEgresos,
  seedSponsors,
  seedComunicados,
  seedCategorias,
  seedEquiposDeportivos,
  seedJugadores,
  seedTorneos,
  seedEquiposTorneo,
  seedPartidosTorneo,
  HOY_ISO,
} from '../data/seed';
import { cuotaDeSocio } from '../lib/derive';
import { formatFechaCorta, formatMoney } from '../lib/format';
import { interpretarCSVSocios } from '../lib/importSocios';
import type { ResultadoImportacionSocios } from '../lib/importSocios';
import {
  CANONICAL_DEMO_FORMATIONS_SEED_VERSION,
  cloneCanonicalPrimeraFormations,
  migrateCanonicalPrimeraFormations,
  PRIMERA_433_FORMATION_ID,
} from '../data/formaciones';
import { readSportsCalendarData, removeSportsCalendarTeam, writeSportsCalendarData } from '../lib/sportsCalendar';

const SPORTS_ROSTER_STORAGE = 'club-formaciones-v1';

function fechaLocalISO(fecha = new Date()) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function esFechaISO(fecha: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const valor = new Date(anio, mes - 1, dia);
  return valor.getFullYear() === anio && valor.getMonth() === mes - 1 && valor.getDate() === dia;
}

function posicionesIniciales(sistema: SistemaFormacion) {
  const lineas = sistema.split('-').map(Number);
  const posiciones = [{ x: 50, y: 91 }];
  lineas.forEach((cantidad, indice) => {
    const y = 75 - indice * (57 / Math.max(lineas.length - 1, 1));
    for (let i = 0; i < cantidad; i++) posiciones.push({ x: ((i + 1) * 100) / (cantidad + 1), y });
  });
  return posiciones;
}

function siguienteNombreFormacion(formaciones: Formacion[], equipoId: number) {
  const nombres = new Set(formaciones.filter((item) => item.equipoId === equipoId).map((item) => item.nombre.trim().toLocaleLowerCase('es-AR')));
  let numero = 1;
  while (nombres.has(`formación ${numero}`)) numero++;
  return `Formación ${numero}`;
}

function recuperarFormaciones() {
  const formacionesDemo = cloneCanonicalPrimeraFormations();
  const vacio = { formaciones: formacionesDemo, selectedFormacionId: formacionesDemo[0]?.id ?? null, equiposDeportivos: seedEquiposDeportivos, jugadores: seedJugadores, activeEquipoDeportivoId: null };
  if (typeof window === 'undefined') return vacio;
  try {
    const guardado = window.localStorage.getItem(SPORTS_ROSTER_STORAGE);
    if (!guardado) return vacio;
    const datos: unknown = JSON.parse(guardado);
    if (!datos || typeof datos !== 'object') return vacio;
    const valor = datos as Record<string, unknown>;
    const equipos = Array.isArray(valor.equiposDeportivos)
      ? valor.equiposDeportivos
          .filter((item): item is EquipoDeportivo => !!item && typeof item === 'object' && typeof (item as EquipoDeportivo).id === 'number' && typeof (item as EquipoDeportivo).nombre === 'string')
          .map((item) => ({ ...item, disciplina: typeof item.disciplina === 'string' && item.disciplina.trim() ? item.disciplina : 'Fútbol' }))
      : seedEquiposDeportivos;
    const equipoIds = new Set(equipos.map((equipo) => equipo.id));
    const jugadores = Array.isArray(valor.jugadores)
      ? valor.jugadores.filter((item): item is Jugador => !!item && typeof item === 'object' && typeof (item as Jugador).id === 'number' && typeof (item as Jugador).equipoId === 'number' && equipoIds.has((item as Jugador).equipoId) && typeof (item as Jugador).nombre === 'string' && typeof (item as Jugador).apellido === 'string' && ((item as Jugador).estado === 'disponible' || (item as Jugador).estado === 'lesionado'))
      : seedJugadores;
    const jugadoresPorId = new Map(jugadores.map((jugador) => [jugador.id, jugador]));
    const formacionesGuardadas = !Array.isArray(valor.formaciones) ? [] : valor.formaciones.flatMap((item): Formacion[] => {
      if (!item || typeof item !== 'object') return [];
      const formacion = item as Partial<Formacion>;
      if (typeof formacion.id !== 'number' || typeof formacion.equipoId !== 'number' || !equipoIds.has(formacion.equipoId) || typeof formacion.nombre !== 'string' || typeof formacion.sistema !== 'string' || !Array.isArray(formacion.jugadores) || !formacion.camiseta || typeof formacion.camiseta !== 'object') return [];
      const camiseta = formacion.camiseta as Formacion['camiseta'];
      if (!['lisa', 'franja', 'rayas'].includes(camiseta.estilo) || typeof camiseta.principal !== 'string' || typeof camiseta.secundaria !== 'string' || typeof camiseta.texto !== 'string') return [];
      const miembros = formacion.jugadores.filter((jugador): jugador is JugadorFormacion => !!jugador && typeof jugador === 'object' && typeof (jugador as JugadorFormacion).jugadorId === 'number' && ((jugador as JugadorFormacion).zona === 'titular' || (jugador as JugadorFormacion).zona === 'suplente') && typeof (jugador as JugadorFormacion).x === 'number' && typeof (jugador as JugadorFormacion).y === 'number' && typeof (jugador as JugadorFormacion).dorsal === 'string' && jugadoresPorId.get((jugador as JugadorFormacion).jugadorId)?.equipoId === formacion.equipoId);
      const miembroIds = new Set(miembros.map((jugador) => jugador.jugadorId));
      const roles = Object.fromEntries(Object.entries(formacion.roles || {}).filter(([, jugadorId]) => typeof jugadorId === 'number' && miembroIds.has(jugadorId))) as Formacion['roles'];
      return [{ id: formacion.id, equipoId: formacion.equipoId, nombre: formacion.nombre, sistema: formacion.sistema as SistemaFormacion, jugadores: miembros, roles, camiseta }];
    });
    const migration = equipoIds.has(1)
      ? migrateCanonicalPrimeraFormations(formacionesGuardadas, valor.demoFormationsSeedVersion)
      : { formaciones: formacionesGuardadas, seeded: false };
    const formaciones = migration.formaciones;
    const selectedFormacionId = typeof valor.selectedFormacionId === 'number' && formaciones.some((formacion) => formacion.id === valor.selectedFormacionId)
      ? valor.selectedFormacionId
      : migration.seeded ? PRIMERA_433_FORMATION_ID : null;
    const activeEquipoDeportivoId = typeof valor.activeEquipoDeportivoId === 'number' && equipoIds.has(valor.activeEquipoDeportivoId)
      ? valor.activeEquipoDeportivoId
      : null;
    return { formaciones, selectedFormacionId, equiposDeportivos: equipos, jugadores, activeEquipoDeportivoId };
  } catch { return vacio; }
}

export interface AppState {
  isMobile: boolean;
  screen: Screen;
  activeModule: Modulo | null;
  moreOpen: boolean;
  showMediosPago: boolean;
  cobranzaMediosPagoVisto: boolean;
  showInfoCanchas: boolean;
  canchasInfoVisto: boolean;
  showAjustarPreciosCanchas: boolean;
  modificarProductoBuffetId: number | null;
  modificarProductoShopId: number | null;
  showAgregarPartido: boolean;
  showVerPartido: boolean;
  verPartidoId: number | null;
  toast: string | null;
  ingresosMenuOpen: boolean;
  canchas: Cancha[];
  selectedCanchaId: number;
  selectedDia: string;
  reservas: Reserva[];
  showReservaModal: boolean;
  reservaHoraSel: string;
  reservaNombre: string;
  reservaMedioPago: MedioPago;
  reservaBienvenidaVista: boolean;
  portalRol: 'socio' | 'hincha';
  portalLoggedIn: boolean;
  partidos: Partido[];
  nuevoPartidoFecha: string;
  nuevoPartidoHora: string;
  nuevoPartidoTipo: TipoPartido;
  nuevoPartidoCondicion: Condicion;
  nuevoPartidoRival: string;
  calendarMonth: number;
  calendarYear: number;
  socios: Socio[];
  searchQuery: string;
  estadoFilter: EstadoFilter;
  showSocioModal: boolean;
  socioEditandoId: number | null;
  showImportarSociosModal: boolean;
  importarSociosNombreArchivo: string;
  importarSociosResultado: ResultadoImportacionSocios | null;
  nuevoSocioNombre: string;
  nuevoSocioApellido: string;
  nuevoSocioTelefono: string;
  nuevoSocioCategoriaId: string;
  nuevoSocioMedioPago: MedioPago;
  nuevoSocioDebitoAutomatico: boolean;
  recordatorios: Record<number, EstadoRecordatorio>;
  pagosHoy: Pago[];
  nuevoPagoSocioId: string;
  nuevoPagoMedio: MedioPago;
  ventasShop: VentaShop[];
  productosShop: ProductoShop[];
  nuevaVentaProductoId: string;
  nuevaVentaVarianteId: string;
  nuevaVentaMedio: MedioPago;
  nuevoStockShopCantidad: string;
  nuevoStockShopTalle: string;
  nuevoStockShopColor: string;
  showNuevoProductoShopModal: boolean;
  nuevoProductoShopNombre: string;
  nuevoProductoShopPrecio: string;
  nuevoProductoShopCategoria: 'Indumentaria' | 'Accesorio';
  nuevoProductoShopStock: string;
  nuevoProductoShopStockMin: string;
  nuevoProductoShopFoto: string;
  productosBuffet: ProductoBuffet[];
  ventasBuffet: VentaBuffet[];
  nuevaVentaBuffetProductoId: string;
  nuevaVentaBuffetTipo: TipoCliente;
  nuevaVentaBuffetMedio: MedioPago;
  nuevoStockBuffetCantidad: string;
  showNuevoProductoBuffetModal: boolean;
  nuevoProductoBuffetNombre: string;
  nuevoProductoBuffetPrecioSocio: string;
  nuevoProductoBuffetPrecioNoSocio: string;
  nuevoProductoBuffetStock: string;
  nuevoProductoBuffetStockMin: string;
  nuevoProductoBuffetFoto: string;
  egresos: Egreso[];
  nuevoEgresoCategoria: string;
  nuevoEgresoDetalle: string;
  nuevoEgresoMonto: string;
  nuevoEgresoMedioPago: MedioPago;
  egresoFiltroCategoria: string;
  cajaFiltroTipo: 'todos' | 'ingreso' | 'egreso';
  cajaFiltroMedio: 'todos' | MedioPago;
  cajaFiltroFuente: string;
  sponsors: Sponsor[];
  showSponsorModal: boolean;
  sponsorEditandoId: number | null;
  nuevoSponsorNombre: string;
  nuevoSponsorRubro: string;
  nuevoSponsorMonto: string;
  nuevoSponsorUbicacion: UbicacionSponsor;
  nuevoSponsorFechaInicio: string;
  nuevoSponsorFechaFin: string;
  nuevoSponsorContacto: string;
  nuevoSponsorLogo: string;
  comunicados: Comunicado[];
  comunicadosLeidos: number[];
  nuevoTitulo: string;
  nuevoCuerpo: string;
  nuevoDestinatario: string;
  nuevoCanalEnvio: CanalEnvio;
  clubNombre: string;
  clubDireccion: string;
  diaVencimiento: string;
  debitoAutomaticoHabilitado: boolean;
  categorias: Categoria[];
  torneos: Torneo[];
  nuevoTorneoNombre: string;
  nuevoTorneoDeporte: string;
  nuevoTorneoFechaInicio: string;
  nuevoTorneoFechaFin: string;
  nuevoTorneoLugar: string;
  nuevoTorneoCupo: string;
  nuevoTorneoValorInscripcion: string;
  nuevoTorneoDescripcion: string;
  nuevoTorneoPremio: string;
  showDifundirTorneo: boolean;
  difundirTorneoId: number | null;
  mensajeDifusionTorneo: string;
  equiposTorneo: EquipoTorneo[];
  partidosTorneo: PartidoTorneo[];
  torneoExpandidoId: number | null;
  torneoFiltroEstado: EstadoTorneoFilter;
  inscripcionesTorneo: InscripcionTorneo[];
  nuevoEquipoNombre: string;
  nuevoPartidoEquipoLocalId: string;
  nuevoPartidoEquipoVisitanteId: string;
  equiposDeportivos: EquipoDeportivo[];
  jugadores: Jugador[];
  activeEquipoDeportivoId: number | null;
  estadisticasVista: StatisticsView;
  actaEventoPendienteId: number | null;
  novedadPendienteId: number | null;
  showJugadorModal: boolean;
  jugadorEditandoId: number | null;
  nuevoJugadorNombre: string;
  nuevoJugadorApellido: string;
  nuevoJugadorFechaNacimiento: string;
  nuevoJugadorTelefono: string;
  nuevoJugadorPosicion: string;
  nuevoJugadorEstado: EstadoJugador;
  nuevoJugadorMotivoLesion: string;
  nuevoJugadorFechaEstimadaRecuperacion: string;
  nuevoJugadorFoto: string;
  showEquipoDeportivoModal: boolean;
  nuevoEquipoDeportivoNombre: string;
  formaciones: Formacion[];
  selectedFormacionId: number | null;
}

const initialState: AppState = {
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 900 : false,
  screen: 'dashboard',
  activeModule: null,
  moreOpen: false,
  showMediosPago: false,
  cobranzaMediosPagoVisto: false,
  showInfoCanchas: false,
  canchasInfoVisto: false,
  showAjustarPreciosCanchas: false,
  modificarProductoBuffetId: null,
  modificarProductoShopId: null,
  showAgregarPartido: false,
  showVerPartido: false,
  verPartidoId: null,
  toast: null,
  ingresosMenuOpen: true,
  canchas: seedCanchas,
  selectedCanchaId: 1,
  selectedDia: '2026-07-29',
  reservas: seedReservas,
  showReservaModal: false,
  reservaHoraSel: '',
  reservaNombre: '',
  reservaMedioPago: 'Efectivo',
  reservaBienvenidaVista: false,
  portalRol: 'socio',
  portalLoggedIn: true,
  partidos: seedPartidos,
  nuevoPartidoFecha: '2026-08-02',
  nuevoPartidoHora: '16:00',
  nuevoPartidoTipo: 'Liga',
  nuevoPartidoCondicion: 'Local',
  nuevoPartidoRival: '',
  calendarMonth: 7,
  calendarYear: 2026,
  socios: seedSocios,
  searchQuery: '',
  estadoFilter: 'todos',
  showSocioModal: false,
  socioEditandoId: null,
  showImportarSociosModal: false,
  importarSociosNombreArchivo: '',
  importarSociosResultado: null,
  nuevoSocioNombre: '',
  nuevoSocioApellido: '',
  nuevoSocioTelefono: '',
  nuevoSocioCategoriaId: '',
  nuevoSocioMedioPago: 'Efectivo',
  nuevoSocioDebitoAutomatico: false,
  recordatorios: seedRecordatorios,
  pagosHoy: seedPagosHoy,
  nuevoPagoSocioId: '',
  nuevoPagoMedio: 'Efectivo',
  ventasShop: seedVentasShop,
  productosShop: seedProductosShop,
  nuevaVentaProductoId: '',
  nuevaVentaVarianteId: '',
  nuevaVentaMedio: 'Efectivo',
  nuevoStockShopCantidad: '',
  nuevoStockShopTalle: '',
  nuevoStockShopColor: '',
  showNuevoProductoShopModal: false,
  nuevoProductoShopNombre: '',
  nuevoProductoShopPrecio: '',
  nuevoProductoShopCategoria: 'Indumentaria',
  nuevoProductoShopStock: '',
  nuevoProductoShopStockMin: '',
  nuevoProductoShopFoto: '',
  productosBuffet: seedProductosBuffet,
  ventasBuffet: seedVentasBuffet,
  nuevaVentaBuffetProductoId: '',
  nuevaVentaBuffetTipo: 'Socio',
  nuevaVentaBuffetMedio: 'Efectivo',
  nuevoStockBuffetCantidad: '',
  showNuevoProductoBuffetModal: false,
  nuevoProductoBuffetNombre: '',
  nuevoProductoBuffetPrecioSocio: '',
  nuevoProductoBuffetPrecioNoSocio: '',
  nuevoProductoBuffetStock: '',
  nuevoProductoBuffetStockMin: '',
  nuevoProductoBuffetFoto: '',
  egresos: seedEgresos,
  nuevoEgresoCategoria: 'Jugadores',
  nuevoEgresoDetalle: '',
  nuevoEgresoMonto: '',
  nuevoEgresoMedioPago: 'Efectivo',
  egresoFiltroCategoria: 'todas',
  cajaFiltroTipo: 'todos',
  cajaFiltroMedio: 'todos',
  cajaFiltroFuente: 'todas',
  sponsors: seedSponsors,
  showSponsorModal: false,
  sponsorEditandoId: null,
  nuevoSponsorNombre: '',
  nuevoSponsorRubro: '',
  nuevoSponsorMonto: '',
  nuevoSponsorUbicacion: 'Cancha',
  nuevoSponsorFechaInicio: HOY_ISO,
  nuevoSponsorFechaFin: HOY_ISO,
  nuevoSponsorContacto: '',
  nuevoSponsorLogo: '',
  comunicados: seedComunicados,
  comunicadosLeidos: [],
  nuevoTitulo: '',
  nuevoCuerpo: '',
  nuevoDestinatario: 'Todos los socios',
  nuevoCanalEnvio: 'app',
  clubNombre: 'Club Atlético Modelo',
  clubDireccion: 'Av. Colón 1234, Mar del Plata',
  diaVencimiento: '5',
  debitoAutomaticoHabilitado: true,
  categorias: seedCategorias,
  torneos: seedTorneos,
  nuevoTorneoNombre: '',
  nuevoTorneoDeporte: '',
  nuevoTorneoFechaInicio: '2026-08-01',
  nuevoTorneoFechaFin: '2026-08-02',
  nuevoTorneoLugar: '',
  nuevoTorneoCupo: '',
  nuevoTorneoValorInscripcion: '',
  nuevoTorneoDescripcion: '',
  nuevoTorneoPremio: '',
  showDifundirTorneo: false,
  difundirTorneoId: null,
  mensajeDifusionTorneo: '',
  equiposTorneo: seedEquiposTorneo,
  partidosTorneo: seedPartidosTorneo,
  torneoExpandidoId: null,
  torneoFiltroEstado: 'todos',
  inscripcionesTorneo: [],
  nuevoEquipoNombre: '',
  nuevoPartidoEquipoLocalId: '',
  nuevoPartidoEquipoVisitanteId: '',
  equiposDeportivos: seedEquiposDeportivos,
  jugadores: seedJugadores,
  activeEquipoDeportivoId: null,
  estadisticasVista: 'summary',
  actaEventoPendienteId: null,
  novedadPendienteId: null,
  showJugadorModal: false,
  jugadorEditandoId: null,
  nuevoJugadorNombre: '',
  nuevoJugadorApellido: '',
  nuevoJugadorFechaNacimiento: '',
  nuevoJugadorTelefono: '',
  nuevoJugadorPosicion: '',
  nuevoJugadorEstado: 'disponible',
  nuevoJugadorMotivoLesion: '',
  nuevoJugadorFechaEstimadaRecuperacion: '',
  nuevoJugadorFoto: '',
  showEquipoDeportivoModal: false,
  nuevoEquipoDeportivoNombre: '',
  formaciones: [],
  selectedFormacionId: null,
};

function persistSportsRoster(state: Pick<AppState, 'formaciones' | 'selectedFormacionId' | 'activeEquipoDeportivoId' | 'equiposDeportivos' | 'jugadores'>) {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(SPORTS_ROSTER_STORAGE, JSON.stringify({ version: 5, demoFormationsSeedVersion: CANONICAL_DEMO_FORMATIONS_SEED_VERSION, formaciones: state.formaciones, selectedFormacionId: state.selectedFormacionId, activeEquipoDeportivoId: state.activeEquipoDeportivoId, equiposDeportivos: state.equiposDeportivos, jugadores: state.jugadores }));
    return true;
  } catch {
    return false;
  }
}

function restoreStorageValue(key: string, value: string | null) {
  try { value === null ? window.localStorage.removeItem(key) : window.localStorage.setItem(key, value); return true; } catch { return false; }
}

export interface AppActions {
  selectModule: (module: Modulo) => void;
  showModuleSelector: () => void;
  navigate: (screen: Screen) => void;
  confirmarAsociacion: (datos: {
    nombre: string;
    apellido: string;
    dni: string;
    fechaNacimiento: string;
    domicilio: string;
    telefono: string;
    email: string;
    medioPago: MedioPago;
    debitoAutomatico: boolean;
  }) => void;
  toggleIngresosMenu: (e: React.MouseEvent) => void;
  toggleMore: () => void;
  closeMore: () => void;
  stopClick: (e: React.MouseEvent) => void;
  openMediosPago: () => void;
  closeMediosPago: () => void;
  closeInfoCanchas: () => void;
  openAjustarPreciosCanchas: () => void;
  closeAjustarPreciosCanchas: () => void;
  setPrecioCancha: (id: number, precio: number) => void;
  openModificarProductoBuffet: (id: number) => void;
  closeModificarProductoBuffet: () => void;
  setPrecioBuffetSocio: (id: number, precio: number) => void;
  setPrecioBuffetNoSocio: (id: number, precio: number) => void;
  eliminarProductoBuffet: (id: number) => void;
  openNuevoProductoBuffet: () => void;
  closeNuevoProductoBuffet: () => void;
  setNuevoProductoBuffetNombre: (v: string) => void;
  setNuevoProductoBuffetPrecioSocio: (v: string) => void;
  setNuevoProductoBuffetPrecioNoSocio: (v: string) => void;
  setNuevoProductoBuffetStock: (v: string) => void;
  setNuevoProductoBuffetStockMin: (v: string) => void;
  setNuevoProductoBuffetFoto: (v: string) => void;
  guardarNuevoProductoBuffet: () => void;
  setFotoProductoBuffet: (id: number, foto: string) => void;
  openModificarProductoShop: (id: number) => void;
  closeModificarProductoShop: () => void;
  setPrecioShop: (id: number, precio: number) => void;
  eliminarProductoShop: (id: number) => void;
  openNuevoProductoShop: () => void;
  closeNuevoProductoShop: () => void;
  setNuevoProductoShopNombre: (v: string) => void;
  setNuevoProductoShopPrecio: (v: string) => void;
  setNuevoProductoShopCategoria: (v: 'Indumentaria' | 'Accesorio') => void;
  setNuevoProductoShopStock: (v: string) => void;
  setNuevoProductoShopStockMin: (v: string) => void;
  setNuevoProductoShopFoto: (v: string) => void;
  guardarNuevoProductoShop: () => void;
  setFotoProductoShop: (id: number, foto: string) => void;
  selectCancha: (id: number) => void;
  onDiaChange: (v: string) => void;
  openReservar: (hora: string) => void;
  closeReservaModal: () => void;
  setReservaNombre: (v: string) => void;
  setReservaMedioPago: (v: MedioPago) => void;
  confirmarReserva: () => void;
  liberarReserva: (id: number) => void;
  reservarTurnoHincha: (canchaId: number, dia: string, hora: string, medioPago: MedioPago) => void;
  cerrarBienvenidaReservas: () => void;
  iniciarSesionPortal: () => void;
  cerrarSesionPortal: () => void;
  marcarComunicadoLeido: (id: number) => void;
  pagarCuota: (medioPago: MedioPago) => void;
  abrirNovedad: (id: number) => void;
  limpiarNovedadPendiente: () => void;
  setFotoPerfil: (dataUrl: string) => void;
  marcarTodosComunicadosLeidos: () => void;
  eliminarComunicado: (id: number) => void;
  openAgregarPartido: (fecha?: string) => void;
  closeAgregarPartido: () => void;
  setNuevoPartidoFecha: (v: string) => void;
  setNuevoPartidoHora: (v: string) => void;
  setNuevoPartidoTipo: (v: TipoPartido) => void;
  setNuevoPartidoCondicion: (v: Condicion) => void;
  setNuevoPartidoRival: (v: string) => void;
  agregarPartido: () => void;
  openVerPartido: (id: number) => void;
  closeVerPartido: () => void;
  quitarVerPartido: () => void;
  prevMonth: () => void;
  nextMonth: () => void;
  setFilter: (f: EstadoFilter) => void;
  setSearchQuery: (v: string) => void;
  enviarRecordatorioWhatsapp: (id: number) => void;
  enviarRecordatorioApp: (id: number) => void;
  cobrarMoroso: (id: number) => void;
  openAgregarSocio: () => void;
  openEditarSocio: (id: number) => void;
  closeSocioModal: () => void;
  setNuevoSocioNombre: (v: string) => void;
  setNuevoSocioApellido: (v: string) => void;
  setNuevoSocioTelefono: (v: string) => void;
  setNuevoSocioCategoriaId: (v: string) => void;
  setNuevoSocioMedioPago: (v: MedioPago) => void;
  toggleNuevoSocioDebitoAutomatico: () => void;
  guardarSocio: () => void;
  openImportarSocios: () => void;
  closeImportarSociosModal: () => void;
  procesarArchivoSocios: (texto: string, nombreArchivo: string) => void;
  confirmarImportacionSocios: () => void;
  eliminarSocio: (id: number) => void;
  setNuevoPagoSocioId: (v: string) => void;
  setNuevoPagoMedio: (v: MedioPago) => void;
  registrarPago: () => void;
  quitarPago: (id: number) => void;
  setNuevaVentaProductoId: (v: string) => void;
  setNuevaVentaVarianteId: (v: string) => void;
  setNuevaVentaMedio: (v: MedioPago) => void;
  registrarVentaShop: () => void;
  comprarProductoShopPortal: (id: number, medio: MedioPago) => void;
  quitarVentaShop: (id: number) => void;
  setNuevoStockShopCantidad: (v: string) => void;
  setNuevoStockShopTalle: (v: string) => void;
  setNuevoStockShopColor: (v: string) => void;
  reponerStockShop: () => void;
  setNuevaVentaBuffetProductoId: (v: string) => void;
  setNuevaVentaBuffetTipo: (v: TipoCliente) => void;
  setNuevaVentaBuffetMedio: (v: MedioPago) => void;
  registrarVentaBuffet: () => void;
  quitarVentaBuffet: (id: number) => void;
  setNuevoStockBuffetCantidad: (v: string) => void;
  reponerStockBuffet: () => void;
  setNuevoEgresoCategoria: (v: string) => void;
  setNuevoEgresoDetalle: (v: string) => void;
  setNuevoEgresoMonto: (v: string) => void;
  setNuevoEgresoMedioPago: (v: MedioPago) => void;
  setEgresoFiltroCategoria: (v: string) => void;
  setCajaFiltroTipo: (v: 'todos' | 'ingreso' | 'egreso') => void;
  setCajaFiltroMedio: (v: 'todos' | MedioPago) => void;
  setCajaFiltroFuente: (v: string) => void;
  agregarEgreso: () => void;
  quitarEgreso: (id: number) => void;
  openNuevoSponsor: () => void;
  openEditarSponsor: (id: number) => void;
  closeSponsorModal: () => void;
  setNuevoSponsorNombre: (v: string) => void;
  setNuevoSponsorRubro: (v: string) => void;
  setNuevoSponsorMonto: (v: string) => void;
  setNuevoSponsorUbicacion: (v: UbicacionSponsor) => void;
  setNuevoSponsorFechaInicio: (v: string) => void;
  setNuevoSponsorFechaFin: (v: string) => void;
  setNuevoSponsorContacto: (v: string) => void;
  setNuevoSponsorLogo: (v: string) => void;
  guardarSponsor: () => void;
  eliminarSponsor: (id: number) => void;
  setNuevoTitulo: (v: string) => void;
  setNuevoCuerpo: (v: string) => void;
  setNuevoDestinatario: (v: string) => void;
  setNuevoCanalEnvio: (v: CanalEnvio) => void;
  enviarComunicado: () => void;
  setClubNombre: (v: string) => void;
  setClubDireccion: (v: string) => void;
  setDiaVencimiento: (v: string) => void;
  toggleDebitoAutomatico: () => void;
  guardarConfig: () => void;
  setCategoriaMonto: (id: number, monto: number) => void;
  setNuevoTorneoNombre: (v: string) => void;
  setNuevoTorneoDeporte: (v: string) => void;
  setNuevoTorneoFechaInicio: (v: string) => void;
  setNuevoTorneoFechaFin: (v: string) => void;
  setNuevoTorneoLugar: (v: string) => void;
  setNuevoTorneoCupo: (v: string) => void;
  setNuevoTorneoValorInscripcion: (v: string) => void;
  setNuevoTorneoDescripcion: (v: string) => void;
  setNuevoTorneoPremio: (v: string) => void;
  crearTorneo: () => void;
  quitarTorneo: (id: number) => void;
  openDifundirTorneo: (id: number) => void;
  closeDifundirTorneo: () => void;
  setMensajeDifusionTorneo: (v: string) => void;
  enviarWhatsappTorneo: () => void;
  copiarMensajeTorneo: () => void;
  toggleTorneoFixture: (id: number) => void;
  setTorneoFiltroEstado: (v: EstadoTorneoFilter) => void;
  setNuevoEquipoNombre: (v: string) => void;
  agregarEquipoTorneo: (torneoId: number) => void;
  quitarEquipoTorneo: (id: number) => void;
  setNuevoPartidoEquipoLocalId: (v: string) => void;
  setNuevoPartidoEquipoVisitanteId: (v: string) => void;
  agregarPartidoTorneo: (torneoId: number) => void;
  quitarPartidoTorneo: (id: number) => void;
  setResultadoPartido: (id: number, campo: 'golesLocal' | 'golesVisitante', valor: string) => void;
  inscribirseTorneo: (datos: Omit<InscripcionTorneo, 'id'>) => void;
  cancelarInscripcionTorneo: (torneoId: number) => void;
  selectEquipoDeportivo: (id: number) => void;
  selectEstadisticasVista: (view: StatisticsView) => void;
  abrirActaEnCalendario: (eventoId: number) => void;
  limpiarActaEventoPendiente: () => void;
  openAgregarJugador: () => void;
  openEditarJugador: (id: number) => void;
  closeJugadorModal: () => void;
  setNuevoJugadorNombre: (v: string) => void;
  setNuevoJugadorApellido: (v: string) => void;
  setNuevoJugadorFechaNacimiento: (v: string) => void;
  setNuevoJugadorTelefono: (v: string) => void;
  setNuevoJugadorPosicion: (v: string) => void;
  setNuevoJugadorEstado: (v: EstadoJugador) => void;
  setNuevoJugadorMotivoLesion: (v: string) => void;
  setNuevoJugadorFechaEstimadaRecuperacion: (v: string) => void;
  setNuevoJugadorFoto: (v: string) => void;
  guardarJugador: () => void;
  eliminarJugador: (id: number) => void;
  openAgregarEquipoDeportivo: () => void;
  closeEquipoDeportivoModal: () => void;
  setNuevoEquipoDeportivoNombre: (v: string) => void;
  agregarEquipoDeportivo: () => void;
  eliminarEquipoDeportivoActivo: () => void;
  crearFormacion: (sistema: SistemaFormacion) => void;
  seleccionarFormacion: (id: number) => void;
  actualizarFormacion: (id: number, patch: Partial<Omit<Formacion, 'id' | 'equipoId'>>) => void;
  cambiarSistemaFormacion: (id: number, sistema: SistemaFormacion) => void;
  moverJugadorFormacion: (id: number, jugadorId: number, zona: JugadorFormacion['zona'], x?: number, y?: number) => void;
  quitarJugadorFormacion: (id: number, jugadorId: number) => void;
  duplicarFormacion: (id: number) => void;
  eliminarFormacion: (id: number) => void;
  normalizarNombreFormacion: (id: number) => void;
  publicarFormacionComoNovedad: (formacionId: number, imagen?: string) => void;
  mostrarToast: (mensaje: string) => void;
}

interface AppContextValue {
  state: AppState;
  actions: AppActions;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => ({ ...initialState, ...recuperarFormaciones() }));
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const update = useCallback((patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => {
    setState((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  useEffect(() => {
    const onResize = () => update({ isMobile: window.innerWidth < 900 });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [update]);

  useEffect(() => {
    persistSportsRoster(state);
  }, [state.formaciones, state.selectedFormacionId, state.activeEquipoDeportivoId, state.equiposDeportivos, state.jugadores]);

  const showToast = useCallback((msg: string) => {
    update({ toast: msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => update({ toast: null }), 2400);
  }, [update]);

  const actions: AppActions = {
    selectModule: (module) => {
      update((s) => {
        const screen: Screen =
          module === 'administrativo' ? 'dashboard' :
          module === 'deportivo' ? 'deportivo_inicio' :
          s.portalLoggedIn ? 'portal_inicio' : 'portal_login';
        return { activeModule: module, screen, moreOpen: false };
      });
    },
    showModuleSelector: () => update({ activeModule: null, moreOpen: false }),

    navigate: (screen) => {
      const opensIngresos = screen === 'ventas' || screen === 'buffet' || screen === 'canchas' || screen === 'torneos';
      update((s) => ({
        screen,
        moreOpen: false,
        ingresosMenuOpen: opensIngresos ? true : s.ingresosMenuOpen,
        showMediosPago: screen === 'cobranza' && !s.cobranzaMediosPagoVisto ? true : s.showMediosPago,
        cobranzaMediosPagoVisto: screen === 'cobranza' ? true : s.cobranzaMediosPagoVisto,
        showInfoCanchas: screen === 'canchas' && !s.canchasInfoVisto ? true : s.showInfoCanchas,
        canchasInfoVisto: screen === 'canchas' ? true : s.canchasInfoVisto,
      }));
    },
    toggleIngresosMenu: (e) => {
      e.stopPropagation();
      update((s) => ({ ingresosMenuOpen: !s.ingresosMenuOpen }));
    },
    toggleMore: () => update((s) => ({ moreOpen: !s.moreOpen })),
    closeMore: () => update({ moreOpen: false }),
    stopClick: (e) => e.stopPropagation(),

    openMediosPago: () => update({ showMediosPago: true }),
    closeMediosPago: () => update({ showMediosPago: false }),
    closeInfoCanchas: () => update({ showInfoCanchas: false }),
    openAjustarPreciosCanchas: () => update({ showAjustarPreciosCanchas: true }),
    closeAjustarPreciosCanchas: () => {
      update({ showAjustarPreciosCanchas: false });
      showToast('Precios de canchas actualizados');
    },
    setPrecioCancha: (id, precio) => update((s) => ({ canchas: s.canchas.map((c) => (c.id === id ? { ...c, precio } : c)) })),
    openModificarProductoBuffet: (id) => update({ modificarProductoBuffetId: id, nuevoStockBuffetCantidad: '' }),
    closeModificarProductoBuffet: () => update({ modificarProductoBuffetId: null, nuevoStockBuffetCantidad: '' }),
    setPrecioBuffetSocio: (id, precio) =>
      update((s) => ({ productosBuffet: s.productosBuffet.map((p) => (p.id === id ? { ...p, precioSocio: precio } : p)) })),
    setPrecioBuffetNoSocio: (id, precio) =>
      update((s) => ({ productosBuffet: s.productosBuffet.map((p) => (p.id === id ? { ...p, precioNoSocio: precio } : p)) })),
    eliminarProductoBuffet: (id) => {
      update((s) => ({
        productosBuffet: s.productosBuffet.filter((p) => p.id !== id),
        modificarProductoBuffetId: s.modificarProductoBuffetId === id ? null : s.modificarProductoBuffetId,
      }));
      showToast('Producto eliminado');
    },
    openNuevoProductoBuffet: () => update({
      showNuevoProductoBuffetModal: true,
      nuevoProductoBuffetNombre: '',
      nuevoProductoBuffetPrecioSocio: '',
      nuevoProductoBuffetPrecioNoSocio: '',
      nuevoProductoBuffetStock: '',
      nuevoProductoBuffetStockMin: '',
      nuevoProductoBuffetFoto: '',
    }),
    closeNuevoProductoBuffet: () => update({ showNuevoProductoBuffetModal: false }),
    setNuevoProductoBuffetNombre: (v) => update({ nuevoProductoBuffetNombre: v }),
    setNuevoProductoBuffetPrecioSocio: (v) => update({ nuevoProductoBuffetPrecioSocio: v }),
    setNuevoProductoBuffetPrecioNoSocio: (v) => update({ nuevoProductoBuffetPrecioNoSocio: v }),
    setNuevoProductoBuffetStock: (v) => update({ nuevoProductoBuffetStock: v }),
    setNuevoProductoBuffetStockMin: (v) => update({ nuevoProductoBuffetStockMin: v }),
    setNuevoProductoBuffetFoto: (v) => update({ nuevoProductoBuffetFoto: v }),
    guardarNuevoProductoBuffet: () => {
      setState((prev) => {
        const nombre = prev.nuevoProductoBuffetNombre.trim();
        const precioSocio = parseInt(prev.nuevoProductoBuffetPrecioSocio, 10);
        const precioNoSocio = parseInt(prev.nuevoProductoBuffetPrecioNoSocio, 10);
        const stock = parseInt(prev.nuevoProductoBuffetStock, 10);
        const stockMin = parseInt(prev.nuevoProductoBuffetStockMin, 10);
        if (!nombre || !precioSocio || !precioNoSocio || isNaN(stock) || isNaN(stockMin)) {
          showToast('Completá nombre, precios, stock y stock mínimo');
          return prev;
        }
        const nuevoProducto: ProductoBuffet = {
          id: Date.now(),
          nombre,
          precioSocio,
          precioNoSocio,
          stock,
          stockMin,
          foto: prev.nuevoProductoBuffetFoto || undefined,
        };
        showToast('Producto agregado — ' + nombre);
        return { ...prev, productosBuffet: [...prev.productosBuffet, nuevoProducto], showNuevoProductoBuffetModal: false };
      });
    },
    setFotoProductoBuffet: (id, foto) =>
      update((s) => ({ productosBuffet: s.productosBuffet.map((p) => (p.id === id ? { ...p, foto } : p)) })),
    openModificarProductoShop: (id) => update({ modificarProductoShopId: id, nuevoStockShopCantidad: '', nuevoStockShopTalle: '', nuevoStockShopColor: '' }),
    closeModificarProductoShop: () => update({ modificarProductoShopId: null, nuevoStockShopCantidad: '', nuevoStockShopTalle: '', nuevoStockShopColor: '' }),
    setPrecioShop: (id, precio) => update((s) => ({ productosShop: s.productosShop.map((p) => (p.id === id ? { ...p, precio } : p)) })),
    eliminarProductoShop: (id) => {
      update((s) => ({
        productosShop: s.productosShop.filter((p) => p.id !== id),
        modificarProductoShopId: s.modificarProductoShopId === id ? null : s.modificarProductoShopId,
      }));
      showToast('Producto eliminado');
    },
    openNuevoProductoShop: () => update({
      showNuevoProductoShopModal: true,
      nuevoProductoShopNombre: '',
      nuevoProductoShopPrecio: '',
      nuevoProductoShopCategoria: 'Indumentaria',
      nuevoProductoShopStock: '',
      nuevoProductoShopStockMin: '',
      nuevoProductoShopFoto: '',
    }),
    closeNuevoProductoShop: () => update({ showNuevoProductoShopModal: false }),
    setNuevoProductoShopNombre: (v) => update({ nuevoProductoShopNombre: v }),
    setNuevoProductoShopPrecio: (v) => update({ nuevoProductoShopPrecio: v }),
    setNuevoProductoShopCategoria: (v) => update({ nuevoProductoShopCategoria: v }),
    setNuevoProductoShopStock: (v) => update({ nuevoProductoShopStock: v }),
    setNuevoProductoShopStockMin: (v) => update({ nuevoProductoShopStockMin: v }),
    setNuevoProductoShopFoto: (v) => update({ nuevoProductoShopFoto: v }),
    guardarNuevoProductoShop: () => {
      setState((prev) => {
        const nombre = prev.nuevoProductoShopNombre.trim();
        const precio = parseInt(prev.nuevoProductoShopPrecio, 10);
        const esIndumentaria = prev.nuevoProductoShopCategoria === 'Indumentaria';
        const stock = esIndumentaria ? 0 : parseInt(prev.nuevoProductoShopStock, 10);
        const stockMin = parseInt(prev.nuevoProductoShopStockMin, 10);
        if (!nombre || !precio || isNaN(stock) || isNaN(stockMin)) {
          showToast('Completá nombre, precio, stock y stock mínimo');
          return prev;
        }
        const nuevoProducto: ProductoShop = {
          id: Date.now(),
          nombre,
          precio,
          categoria: prev.nuevoProductoShopCategoria,
          stock,
          stockMin,
          variantes: esIndumentaria ? [] : undefined,
          foto: prev.nuevoProductoShopFoto || undefined,
        };
        showToast(esIndumentaria ? 'Producto agregado — sumale talle y color con el lápiz' : 'Producto agregado — ' + nombre);
        return { ...prev, productosShop: [...prev.productosShop, nuevoProducto], showNuevoProductoShopModal: false };
      });
    },
    setFotoProductoShop: (id, foto) =>
      update((s) => ({ productosShop: s.productosShop.map((p) => (p.id === id ? { ...p, foto } : p)) })),

    selectCancha: (id) => update({ selectedCanchaId: id }),
    onDiaChange: (v) => update({ selectedDia: v }),

    openReservar: (hora) => update({ showReservaModal: true, reservaHoraSel: hora, reservaNombre: '', reservaMedioPago: 'Efectivo' }),
    closeReservaModal: () => update({ showReservaModal: false }),
    setReservaNombre: (v) => update({ reservaNombre: v }),
    setReservaMedioPago: (v) => update({ reservaMedioPago: v }),
    confirmarReserva: () => {
      setState((prev) => {
        const nombre = prev.reservaNombre.trim();
        if (!nombre) {
          showToast('Ingresá el nombre de quien reserva');
          return prev;
        }
        const monto = prev.canchas.find((c) => c.id === prev.selectedCanchaId)?.precio ?? 0;
        showToast('Turno reservado para ' + nombre);
        return {
          ...prev,
          reservas: [
            ...prev.reservas,
            { id: Date.now(), canchaId: prev.selectedCanchaId, dia: prev.selectedDia, hora: prev.reservaHoraSel, nombre, monto, medioPago: prev.reservaMedioPago },
          ],
          showReservaModal: false,
        };
      });
    },
    liberarReserva: (id) => {
      update((s) => ({ reservas: s.reservas.filter((r) => r.id !== id) }));
      showToast('Turno liberado');
    },
    reservarTurnoHincha: (canchaId, dia, hora, medioPago) => {
      setState((prev) => {
        const ocupado = prev.reservas.some((r) => r.canchaId === canchaId && r.dia === dia && r.hora === hora);
        if (ocupado) {
          showToast('Esa cancha ya está reservada en ese horario');
          return prev;
        }
        const socio = prev.socios[0];
        const nombre = `${socio.nombre} ${socio.apellido}`;
        const monto = prev.canchas.find((c) => c.id === canchaId)?.precio ?? 0;
        showToast('Turno reservado — ' + nombre);
        return { ...prev, reservas: [...prev.reservas, { id: Date.now(), canchaId, dia, hora, nombre, monto, medioPago }] };
      });
    },
    cerrarBienvenidaReservas: () => update({ reservaBienvenidaVista: true }),
    iniciarSesionPortal: () => update({ portalLoggedIn: true, portalRol: 'socio', screen: 'portal_inicio' }),
    cerrarSesionPortal: () => update({ portalLoggedIn: false, screen: 'portal_login' }),
    marcarComunicadoLeido: (id) => update((s) => (
      s.comunicadosLeidos.includes(id) ? {} : { comunicadosLeidos: [...s.comunicadosLeidos, id] }
    )),
    pagarCuota: (medioPago) => {
      update((s) => {
        if (!s.socios[0]) return {};
        const [anio, mes, dia] = HOY_ISO.split('-');
        return {
          socios: s.socios.map((soc, i) => i === 0
            ? { ...soc, deuda: 0, estado: 'al_dia', medioPago, ultimoPago: `${dia}/${mes}/${anio}` }
            : soc),
        };
      });
      showToast('¡Cuota pagada! Gracias por tu pago.');
    },
    abrirNovedad: (id) => update({ screen: 'portal_novedades', novedadPendienteId: id }),
    limpiarNovedadPendiente: () => update({ novedadPendienteId: null }),
    marcarTodosComunicadosLeidos: () => update((s) => ({ comunicadosLeidos: s.comunicados.map((c) => c.id) })),
    setFotoPerfil: (dataUrl) => update((s) => ({ socios: s.socios.map((soc, i) => i === 0 ? { ...soc, fotoPerfil: dataUrl } : soc) })),
    eliminarComunicado: (id) => {
      update((s) => ({
        comunicados: s.comunicados.filter((c) => c.id !== id),
        comunicadosLeidos: s.comunicadosLeidos.filter((x) => x !== id),
      }));
      showToast('Novedad eliminada');
    },

    openAgregarPartido: (fecha) => update((s) => ({ showAgregarPartido: true, nuevoPartidoFecha: fecha || s.nuevoPartidoFecha })),
    closeAgregarPartido: () => update({ showAgregarPartido: false }),
    setNuevoPartidoFecha: (v) => update({ nuevoPartidoFecha: v }),
    setNuevoPartidoHora: (v) => update({ nuevoPartidoHora: v }),
    setNuevoPartidoTipo: (v) => update({ nuevoPartidoTipo: v }),
    setNuevoPartidoCondicion: (v) => update({ nuevoPartidoCondicion: v }),
    setNuevoPartidoRival: (v) => update({ nuevoPartidoRival: v }),
    agregarPartido: () => {
      setState((prev) => {
        const rival = prev.nuevoPartidoRival.trim();
        if (!rival || !prev.nuevoPartidoFecha || !prev.nuevoPartidoHora) {
          showToast('Completá fecha, hora y rival');
          return prev;
        }
        showToast('Partido agregado al calendario');
        return {
          ...prev,
          partidos: [
            ...prev.partidos,
            {
              id: Date.now(),
              fecha: prev.nuevoPartidoFecha,
              hora: prev.nuevoPartidoHora,
              tipo: prev.nuevoPartidoTipo,
              condicion: prev.nuevoPartidoCondicion,
              rival,
            },
          ],
          nuevoPartidoRival: '',
          showAgregarPartido: false,
        };
      });
    },
    openVerPartido: (id) => update({ showVerPartido: true, verPartidoId: id }),
    closeVerPartido: () => update({ showVerPartido: false, verPartidoId: null }),
    quitarVerPartido: () => {
      update((s) => ({ partidos: s.partidos.filter((p) => p.id !== s.verPartidoId), showVerPartido: false, verPartidoId: null }));
      showToast('Partido quitado del calendario');
    },

    prevMonth: () =>
      update((s) => {
        let m = s.calendarMonth - 1;
        let y = s.calendarYear;
        if (m < 0) {
          m = 11;
          y--;
        }
        return { calendarMonth: m, calendarYear: y };
      }),
    nextMonth: () =>
      update((s) => {
        let m = s.calendarMonth + 1;
        let y = s.calendarYear;
        if (m > 11) {
          m = 0;
          y++;
        }
        return { calendarMonth: m, calendarYear: y };
      }),

    setFilter: (f) => update({ estadoFilter: f }),
    setSearchQuery: (v) => update({ searchQuery: v }),

    enviarRecordatorioWhatsapp: (id) => {
      const s = state.socios.find((x) => x.id === id);
      if (!s) return;
      const mensaje = 'Hola ' + s.nombre + ', te recordamos que tenés una cuota pendiente de ' + formatMoney(s.deuda) + ' en ' + state.clubNombre + '. ¡Gracias!';
      const numero = s.telefono.replace(/\D/g, '');
      window.open('https://wa.me/' + numero + '?text=' + encodeURIComponent(mensaje), '_blank');
      update((prev) => ({ recordatorios: { ...prev.recordatorios, [id]: 'enviado' } }));
      showToast('Abriendo WhatsApp para ' + s.nombre);
    },

    enviarRecordatorioApp: (id) => {
      const s = state.socios.find((x) => x.id === id);
      if (!s) return;
      update((prev) => ({ recordatorios: { ...prev.recordatorios, [id]: 'enviado' } }));
      showToast('Recordatorio enviado por la app a ' + s.nombre);
    },

    cobrarMoroso: (id) => {
      setState((prev) => {
        const s = prev.socios.find((x) => x.id === id);
        if (!s) return prev;
        const monto = s.deuda;
        showToast('Cobro registrado — ' + s.nombre + ' pasó a Al día');
        return {
          ...prev,
          socios: prev.socios.map((x) => (x.id === id ? { ...x, estado: 'al_dia', deuda: 0, ultimoPago: '29/07/2026' } : x)),
          pagosHoy: [
            { id: Date.now(), socioId: s.id, nombre: s.nombre + ' ' + s.apellido, monto, medio: 'Efectivo', hora: 'ahora', estadoAnterior: s.estado, deudaAnterior: s.deuda, ultimoPagoAnterior: s.ultimoPago },
            ...prev.pagosHoy,
          ],
        };
      });
    },

    openAgregarSocio: () => update({
      showSocioModal: true,
      socioEditandoId: null,
      nuevoSocioNombre: '',
      nuevoSocioApellido: '',
      nuevoSocioTelefono: '',
      nuevoSocioCategoriaId: '',
      nuevoSocioMedioPago: 'Efectivo',
      nuevoSocioDebitoAutomatico: false,
    }),
    openEditarSocio: (id) => {
      setState((prev) => {
        const socio = prev.socios.find((s) => s.id === id);
        if (!socio) return prev;
        return {
          ...prev,
          showSocioModal: true,
          socioEditandoId: id,
          nuevoSocioNombre: socio.nombre,
          nuevoSocioApellido: socio.apellido,
          nuevoSocioTelefono: socio.telefono,
          nuevoSocioCategoriaId: String(socio.categoriaId),
          nuevoSocioMedioPago: socio.medioPago ?? 'Efectivo',
          nuevoSocioDebitoAutomatico: socio.debitoAutomatico,
        };
      });
    },
    closeSocioModal: () => update({ showSocioModal: false, socioEditandoId: null }),
    setNuevoSocioNombre: (v) => update({ nuevoSocioNombre: v }),
    setNuevoSocioApellido: (v) => update({ nuevoSocioApellido: v }),
    setNuevoSocioTelefono: (v) => update({ nuevoSocioTelefono: v }),
    setNuevoSocioCategoriaId: (v) => update({ nuevoSocioCategoriaId: v }),
    setNuevoSocioMedioPago: (v) => update((s) => ({ nuevoSocioMedioPago: v, nuevoSocioDebitoAutomatico: v === 'Tarjeta' ? s.nuevoSocioDebitoAutomatico : false })),
    toggleNuevoSocioDebitoAutomatico: () => update((s) => ({ nuevoSocioDebitoAutomatico: !s.nuevoSocioDebitoAutomatico })),
    guardarSocio: () => {
      setState((prev) => {
        const nombre = prev.nuevoSocioNombre.trim();
        const apellido = prev.nuevoSocioApellido.trim();
        const telefono = prev.nuevoSocioTelefono.trim();
        const categoriaId = parseInt(prev.nuevoSocioCategoriaId, 10);
        if (!nombre || !apellido || !telefono || !categoriaId) {
          showToast('Completá nombre, apellido, teléfono y categoría');
          return prev;
        }
        if (telefono.replace(/\D/g, '').length < 8) {
          showToast('Ingresá un teléfono válido (mínimo 8 dígitos)');
          return prev;
        }
        const debitoAutomatico = prev.nuevoSocioMedioPago === 'Tarjeta' && prev.nuevoSocioDebitoAutomatico;

        if (prev.socioEditandoId) {
          const id = prev.socioEditandoId;
          showToast('Socio actualizado');
          return {
            ...prev,
            socios: prev.socios.map((s) =>
              s.id === id ? { ...s, nombre, apellido, telefono, categoriaId, medioPago: prev.nuevoSocioMedioPago, debitoAutomatico } : s
            ),
            showSocioModal: false,
            socioEditandoId: null,
          };
        }

        const numero = prev.socios.reduce((max, s) => Math.max(max, s.numero), 100) + 1;
        const nuevoSocio: Socio = {
          id: Date.now(),
          numero,
          nombre,
          apellido,
          estado: 'al_dia',
          deuda: 0,
          ultimoPago: '29/07/2026',
          debitoAutomatico,
          telefono,
          medioPago: prev.nuevoSocioMedioPago,
          categoriaId,
        };
        showToast('Socio agregado — #' + numero);
        return { ...prev, socios: [...prev.socios, nuevoSocio], showSocioModal: false };
      });
    },
    openImportarSocios: () => update({ showImportarSociosModal: true, importarSociosNombreArchivo: '', importarSociosResultado: null }),
    closeImportarSociosModal: () => update({ showImportarSociosModal: false, importarSociosNombreArchivo: '', importarSociosResultado: null }),
    procesarArchivoSocios: (texto, nombreArchivo) => {
      setState((prev) => ({
        ...prev,
        importarSociosNombreArchivo: nombreArchivo,
        importarSociosResultado: interpretarCSVSocios(texto, prev.categorias),
      }));
    },
    confirmarImportacionSocios: () => {
      setState((prev) => {
        const resultado = prev.importarSociosResultado;
        if (!resultado || resultado.filas.length === 0) return prev;
        let numero = prev.socios.reduce((max, s) => Math.max(max, s.numero), 100);
        const nuevos: Socio[] = resultado.filas.map((fila) => {
          numero += 1;
          return {
            id: Date.now() + numero,
            numero,
            nombre: fila.nombre,
            apellido: fila.apellido,
            estado: 'al_dia',
            deuda: 0,
            ultimoPago: '29/07/2026',
            debitoAutomatico: false,
            telefono: fila.telefono,
            medioPago: 'Efectivo',
            categoriaId: fila.categoriaId,
            dni: fila.dni,
            domicilio: fila.domicilio,
            email: fila.email,
          };
        });
        showToast(`Se importaron ${nuevos.length} socio${nuevos.length === 1 ? '' : 's'}`);
        return { ...prev, socios: [...prev.socios, ...nuevos], showImportarSociosModal: false, importarSociosNombreArchivo: '', importarSociosResultado: null };
      });
    },
    eliminarSocio: (id) => {
      setState((prev) => {
        const socio = prev.socios.find((s) => s.id === id);
        if (!socio) return prev;
        if (prev.socios[0]?.id === id) {
          showToast('No se puede dar de baja a ' + socio.nombre + ' — es la cuenta activa del Portal del Hincha en esta demo');
          return prev;
        }
        const { [id]: _quitado, ...recordatorios } = prev.recordatorios;
        showToast('Socio dado de baja — ' + socio.nombre + ' ' + socio.apellido);
        return { ...prev, socios: prev.socios.filter((s) => s.id !== id), recordatorios };
      });
    },

    setNuevoPagoSocioId: (v) => update({ nuevoPagoSocioId: v }),
    setNuevoPagoMedio: (v) => update({ nuevoPagoMedio: v }),
    registrarPago: () => {
      setState((prev) => {
        const s = prev.socios.find((x) => String(x.id) === String(prev.nuevoPagoSocioId));
        if (!s) {
          showToast('Elegí un socio');
          return prev;
        }
        showToast('Cuota marcada como pagada');
        return {
          ...prev,
          pagosHoy: [
            {
              id: Date.now(),
              socioId: s.id,
              nombre: s.nombre + ' ' + s.apellido,
              monto: cuotaDeSocio(s, prev.categorias),
              medio: prev.nuevoPagoMedio,
              hora: 'ahora',
              estadoAnterior: s.estado,
              deudaAnterior: s.deuda,
              ultimoPagoAnterior: s.ultimoPago,
            },
            ...prev.pagosHoy,
          ],
          socios: prev.socios.map((x) => (x.id === s.id ? { ...x, estado: 'al_dia', deuda: 0, ultimoPago: '29/07/2026' } : x)),
          nuevoPagoSocioId: '',
        };
      });
    },
    quitarPago: (id) => {
      setState((prev) => {
        const pago = prev.pagosHoy.find((p) => p.id === id);
        if (!pago) return prev;
        showToast('Pago eliminado — se restauró el estado anterior de ' + pago.nombre);
        return {
          ...prev,
          pagosHoy: prev.pagosHoy.filter((p) => p.id !== id),
          socios: prev.socios.map((x) =>
            x.id === pago.socioId
              ? { ...x, estado: pago.estadoAnterior, deuda: pago.deudaAnterior, ultimoPago: pago.ultimoPagoAnterior }
              : x
          ),
        };
      });
    },

    setNuevaVentaProductoId: (v) => update({ nuevaVentaProductoId: v, nuevaVentaVarianteId: '' }),
    setNuevaVentaVarianteId: (v) => update({ nuevaVentaVarianteId: v }),
    setNuevaVentaMedio: (v) => update({ nuevaVentaMedio: v }),
    registrarVentaShop: () => {
      setState((prev) => {
        const p = prev.productosShop.find((x) => String(x.id) === String(prev.nuevaVentaProductoId));
        if (!p) {
          showToast('Elegí un producto');
          return prev;
        }
        if (p.categoria === 'Indumentaria') {
          const variante = (p.variantes || []).find((v) => String(v.id) === String(prev.nuevaVentaVarianteId));
          if (!variante) {
            showToast('Elegí talle y color');
            return prev;
          }
          if (variante.stock <= 0) {
            showToast('Sin stock disponible de ' + p.nombre + ' en esa variante');
            return prev;
          }
          showToast('Venta registrada');
          return {
            ...prev,
            ventasShop: [
              { id: Date.now(), productoId: p.id, varianteId: variante.id, producto: p.nombre + ' (Talle ' + variante.talle + ' · ' + variante.color + ')', precio: p.precio, medio: prev.nuevaVentaMedio, hora: 'ahora' },
              ...prev.ventasShop,
            ],
            productosShop: prev.productosShop.map((x) =>
              x.id === p.id
                ? {
                    ...x,
                    stock: x.stock - 1,
                    variantes: (x.variantes || []).map((v) => (v.id === variante.id ? { ...v, stock: v.stock - 1 } : v)),
                  }
                : x
            ),
            nuevaVentaProductoId: '',
            nuevaVentaVarianteId: '',
          };
        }
        if (p.stock <= 0) {
          showToast('Sin stock disponible de ' + p.nombre);
          return prev;
        }
        showToast('Venta registrada');
        return {
          ...prev,
          ventasShop: [{ id: Date.now(), productoId: p.id, producto: p.nombre, precio: p.precio, medio: prev.nuevaVentaMedio, hora: 'ahora' }, ...prev.ventasShop],
          productosShop: prev.productosShop.map((x) => (x.id === p.id ? { ...x, stock: x.stock - 1 } : x)),
          nuevaVentaProductoId: '',
        };
      });
    },
    comprarProductoShopPortal: (id, medio) => {
      setState((prev) => {
        const p = prev.productosShop.find((x) => x.id === id);
        if (!p) return prev;
        if (p.stock <= 0) {
          showToast('Sin stock disponible de ' + p.nombre);
          return prev;
        }
        showToast('¡Compra registrada! Retirala por secretaría del club.');
        return {
          ...prev,
          ventasShop: [{ id: Date.now(), productoId: p.id, producto: p.nombre, precio: p.precio, medio, hora: 'ahora' }, ...prev.ventasShop],
          productosShop: prev.productosShop.map((x) => (x.id === p.id ? { ...x, stock: x.stock - 1 } : x)),
        };
      });
    },
    quitarVentaShop: (id) => {
      setState((prev) => {
        const venta = prev.ventasShop.find((v) => v.id === id);
        if (!venta) return prev;
        showToast('Venta eliminada — stock repuesto');
        return {
          ...prev,
          ventasShop: prev.ventasShop.filter((v) => v.id !== id),
          productosShop: prev.productosShop.map((x) =>
            x.id === venta.productoId
              ? {
                  ...x,
                  stock: x.stock + 1,
                  variantes: venta.varianteId ? (x.variantes || []).map((v) => (v.id === venta.varianteId ? { ...v, stock: v.stock + 1 } : v)) : x.variantes,
                }
              : x
          ),
        };
      });
    },

    setNuevoStockShopCantidad: (v) => update({ nuevoStockShopCantidad: v }),
    setNuevoStockShopTalle: (v) => update({ nuevoStockShopTalle: v }),
    setNuevoStockShopColor: (v) => update({ nuevoStockShopColor: v }),
    reponerStockShop: () => {
      setState((prev) => {
        const p = prev.productosShop.find((x) => x.id === prev.modificarProductoShopId);
        const cantidad = parseInt(prev.nuevoStockShopCantidad, 10);
        if (!p || !cantidad || cantidad <= 0) {
          showToast('Ingresá una cantidad válida');
          return prev;
        }
        if (p.categoria === 'Indumentaria') {
          const talle = prev.nuevoStockShopTalle.trim();
          const color = prev.nuevoStockShopColor.trim();
          if (!talle || !color) {
            showToast('Completá talle y color');
            return prev;
          }
          const variantes = p.variantes || [];
          const existente = variantes.find((v) => v.talle === talle && v.color.toLowerCase() === color.toLowerCase());
          const nuevasVariantes: VarianteShop[] = existente
            ? variantes.map((v) => (v.id === existente.id ? { ...v, stock: v.stock + cantidad } : v))
            : [...variantes, { id: Date.now(), talle, color, stock: cantidad }];
          showToast('Stock actualizado — ' + p.nombre);
          return {
            ...prev,
            productosShop: prev.productosShop.map((x) =>
              x.id === p.id ? { ...x, stock: x.stock + cantidad, variantes: nuevasVariantes } : x
            ),
            nuevoStockShopCantidad: '',
            nuevoStockShopTalle: '',
            nuevoStockShopColor: '',
          };
        }
        showToast('Stock actualizado — ' + p.nombre);
        return {
          ...prev,
          productosShop: prev.productosShop.map((x) => (x.id === p.id ? { ...x, stock: x.stock + cantidad } : x)),
          nuevoStockShopCantidad: '',
        };
      });
    },

    setNuevaVentaBuffetProductoId: (v) => update({ nuevaVentaBuffetProductoId: v }),
    setNuevaVentaBuffetTipo: (v) => update({ nuevaVentaBuffetTipo: v }),
    setNuevaVentaBuffetMedio: (v) => update({ nuevaVentaBuffetMedio: v }),
    registrarVentaBuffet: () => {
      setState((prev) => {
        const p = prev.productosBuffet.find((x) => String(x.id) === String(prev.nuevaVentaBuffetProductoId));
        if (!p) {
          showToast('Elegí un producto');
          return prev;
        }
        if (p.stock <= 0) {
          showToast('Sin stock disponible de ' + p.nombre);
          return prev;
        }
        const precio = prev.nuevaVentaBuffetTipo === 'Socio' ? p.precioSocio : p.precioNoSocio;
        showToast('Venta de buffet registrada');
        return {
          ...prev,
          ventasBuffet: [
            { id: Date.now(), productoId: p.id, producto: p.nombre, tipoCliente: prev.nuevaVentaBuffetTipo, precio, medio: prev.nuevaVentaBuffetMedio, hora: 'ahora' },
            ...prev.ventasBuffet,
          ],
          productosBuffet: prev.productosBuffet.map((x) => (x.id === p.id ? { ...x, stock: x.stock - 1 } : x)),
          nuevaVentaBuffetProductoId: '',
        };
      });
    },
    quitarVentaBuffet: (id) => {
      setState((prev) => {
        const venta = prev.ventasBuffet.find((v) => v.id === id);
        if (!venta) return prev;
        showToast('Venta eliminada — stock repuesto');
        return {
          ...prev,
          ventasBuffet: prev.ventasBuffet.filter((v) => v.id !== id),
          productosBuffet: prev.productosBuffet.map((x) => (x.id === venta.productoId ? { ...x, stock: x.stock + 1 } : x)),
        };
      });
    },

    setNuevoStockBuffetCantidad: (v) => update({ nuevoStockBuffetCantidad: v }),
    reponerStockBuffet: () => {
      setState((prev) => {
        const p = prev.productosBuffet.find((x) => x.id === prev.modificarProductoBuffetId);
        const cantidad = parseInt(prev.nuevoStockBuffetCantidad, 10);
        if (!p || !cantidad || cantidad <= 0) {
          showToast('Ingresá una cantidad válida');
          return prev;
        }
        showToast('Stock actualizado — ' + p.nombre);
        return {
          ...prev,
          productosBuffet: prev.productosBuffet.map((x) => (x.id === p.id ? { ...x, stock: x.stock + cantidad } : x)),
          nuevoStockBuffetCantidad: '',
        };
      });
    },

    setNuevoEgresoCategoria: (v) => update({ nuevoEgresoCategoria: v }),
    setNuevoEgresoDetalle: (v) => update({ nuevoEgresoDetalle: v }),
    setNuevoEgresoMonto: (v) => update({ nuevoEgresoMonto: v }),
    setNuevoEgresoMedioPago: (v) => update({ nuevoEgresoMedioPago: v }),
    setEgresoFiltroCategoria: (v) => update({ egresoFiltroCategoria: v }),
    setCajaFiltroTipo: (v) => update({ cajaFiltroTipo: v }),
    setCajaFiltroMedio: (v) => update({ cajaFiltroMedio: v }),
    setCajaFiltroFuente: (v) => update({ cajaFiltroFuente: v }),
    agregarEgreso: () => {
      setState((prev) => {
        const categoria = prev.nuevoEgresoCategoria.trim();
        const detalle = prev.nuevoEgresoDetalle.trim();
        const monto = parseInt(prev.nuevoEgresoMonto, 10);
        if (!categoria || !monto || monto <= 0) {
          showToast('Completá categoría y monto');
          return prev;
        }
        showToast('Egreso registrado');
        return {
          ...prev,
          egresos: [
            ...prev.egresos,
            { id: Date.now(), categoria, monto, fecha: HOY_ISO, hora: 'ahora', medioPago: prev.nuevoEgresoMedioPago, ...(detalle ? { detalle } : {}) },
          ],
          nuevoEgresoDetalle: '',
          nuevoEgresoMonto: '',
        };
      });
    },
    quitarEgreso: (id) => {
      update((s) => ({ egresos: s.egresos.filter((e) => e.id !== id) }));
      showToast('Egreso eliminado');
    },

    openNuevoSponsor: () => update({
      showSponsorModal: true,
      sponsorEditandoId: null,
      nuevoSponsorNombre: '',
      nuevoSponsorRubro: '',
      nuevoSponsorMonto: '',
      nuevoSponsorUbicacion: 'Cancha',
      nuevoSponsorFechaInicio: HOY_ISO,
      nuevoSponsorFechaFin: HOY_ISO,
      nuevoSponsorContacto: '',
      nuevoSponsorLogo: '',
    }),
    openEditarSponsor: (id) => {
      setState((prev) => {
        const sponsor = prev.sponsors.find((s) => s.id === id);
        if (!sponsor) return prev;
        return {
          ...prev,
          showSponsorModal: true,
          sponsorEditandoId: id,
          nuevoSponsorNombre: sponsor.nombre,
          nuevoSponsorRubro: sponsor.rubro,
          nuevoSponsorMonto: String(sponsor.monto),
          nuevoSponsorUbicacion: sponsor.ubicacion,
          nuevoSponsorFechaInicio: sponsor.fechaInicio,
          nuevoSponsorFechaFin: sponsor.fechaFin,
          nuevoSponsorContacto: sponsor.contacto || '',
          nuevoSponsorLogo: sponsor.logo || '',
        };
      });
    },
    closeSponsorModal: () => update({ showSponsorModal: false, sponsorEditandoId: null }),
    setNuevoSponsorNombre: (v) => update({ nuevoSponsorNombre: v }),
    setNuevoSponsorRubro: (v) => update({ nuevoSponsorRubro: v }),
    setNuevoSponsorMonto: (v) => update({ nuevoSponsorMonto: v }),
    setNuevoSponsorUbicacion: (v) => update({ nuevoSponsorUbicacion: v }),
    setNuevoSponsorFechaInicio: (v) => update({ nuevoSponsorFechaInicio: v }),
    setNuevoSponsorFechaFin: (v) => update({ nuevoSponsorFechaFin: v }),
    setNuevoSponsorContacto: (v) => update({ nuevoSponsorContacto: v }),
    setNuevoSponsorLogo: (v) => update({ nuevoSponsorLogo: v }),
    guardarSponsor: () => {
      setState((prev) => {
        const nombre = prev.nuevoSponsorNombre.trim();
        const rubro = prev.nuevoSponsorRubro.trim();
        const monto = parseInt(prev.nuevoSponsorMonto, 10);
        const contacto = prev.nuevoSponsorContacto.trim();
        if (!nombre || !rubro || !monto || !prev.nuevoSponsorFechaInicio || !prev.nuevoSponsorFechaFin) {
          showToast('Completá nombre, rubro, monto y vigencia');
          return prev;
        }
        if (prev.nuevoSponsorFechaFin < prev.nuevoSponsorFechaInicio) {
          showToast('La fecha de fin no puede ser anterior al inicio');
          return prev;
        }

        if (prev.sponsorEditandoId) {
          const id = prev.sponsorEditandoId;
          showToast('Sponsor actualizado');
          return {
            ...prev,
            sponsors: prev.sponsors.map((s) =>
              s.id === id
                ? {
                    ...s,
                    nombre,
                    rubro,
                    monto,
                    ubicacion: prev.nuevoSponsorUbicacion,
                    fechaInicio: prev.nuevoSponsorFechaInicio,
                    fechaFin: prev.nuevoSponsorFechaFin,
                    contacto: contacto || undefined,
                    logo: prev.nuevoSponsorLogo || undefined,
                  }
                : s
            ),
            showSponsorModal: false,
            sponsorEditandoId: null,
          };
        }

        const nuevoSponsor: Sponsor = {
          id: Date.now(),
          nombre,
          rubro,
          monto,
          ubicacion: prev.nuevoSponsorUbicacion,
          fechaInicio: prev.nuevoSponsorFechaInicio,
          fechaFin: prev.nuevoSponsorFechaFin,
          contacto: contacto || undefined,
          logo: prev.nuevoSponsorLogo || undefined,
        };
        showToast('Sponsor agregado — ' + nombre);
        return { ...prev, sponsors: [...prev.sponsors, nuevoSponsor], showSponsorModal: false };
      });
    },
    eliminarSponsor: (id) => {
      update((s) => ({ sponsors: s.sponsors.filter((sp) => sp.id !== id) }));
      showToast('Sponsor eliminado');
    },

    setNuevoTitulo: (v) => update({ nuevoTitulo: v }),
    setNuevoCuerpo: (v) => update({ nuevoCuerpo: v }),
    setNuevoDestinatario: (v) => update({ nuevoDestinatario: v }),
    setNuevoCanalEnvio: (v) => update({ nuevoCanalEnvio: v }),
    enviarComunicado: () => {
      setState((prev) => {
        if (!prev.nuevoTitulo.trim() || !prev.nuevoCuerpo.trim()) {
          showToast('Completá título y mensaje');
          return prev;
        }
        const canal = prev.nuevoCanalEnvio;
        if (canal === 'whatsapp' || canal === 'ambos') {
          const mensaje = '📢 ' + prev.nuevoTitulo + '\n\n' + prev.nuevoCuerpo;
          window.open('https://wa.me/?text=' + encodeURIComponent(mensaje), '_blank');
        }
        const mensajeToast =
          canal === 'whatsapp'
            ? 'Abriendo WhatsApp...'
            : canal === 'ambos'
              ? 'Comunicado enviado a ' + prev.nuevoDestinatario + ' y por WhatsApp'
              : 'Comunicado enviado a ' + prev.nuevoDestinatario;
        showToast(mensajeToast);
        return {
          ...prev,
          comunicados: [
            { id: Date.now(), titulo: prev.nuevoTitulo, cuerpo: prev.nuevoCuerpo, destinatario: prev.nuevoDestinatario, fecha: '29/07/2026', hora: 'ahora', canal },
            ...prev.comunicados,
          ],
          nuevoTitulo: '',
          nuevoCuerpo: '',
        };
      });
    },

    setClubNombre: (v) => update({ clubNombre: v }),
    setClubDireccion: (v) => update({ clubDireccion: v }),
    setDiaVencimiento: (v) => update({ diaVencimiento: v }),
    toggleDebitoAutomatico: () => update((s) => ({ debitoAutomaticoHabilitado: !s.debitoAutomaticoHabilitado })),
    guardarConfig: () => showToast('Cambios guardados'),
    setCategoriaMonto: (id, monto) => update((s) => ({ categorias: s.categorias.map((c) => (c.id === id ? { ...c, monto } : c)) })),

    setNuevoTorneoNombre: (v) => update({ nuevoTorneoNombre: v }),
    setNuevoTorneoDeporte: (v) => update({ nuevoTorneoDeporte: v }),
    setNuevoTorneoFechaInicio: (v) => update({ nuevoTorneoFechaInicio: v }),
    setNuevoTorneoFechaFin: (v) => update({ nuevoTorneoFechaFin: v }),
    setNuevoTorneoLugar: (v) => update({ nuevoTorneoLugar: v }),
    setNuevoTorneoCupo: (v) => update({ nuevoTorneoCupo: v }),
    setNuevoTorneoValorInscripcion: (v) => update({ nuevoTorneoValorInscripcion: v }),
    setNuevoTorneoDescripcion: (v) => update({ nuevoTorneoDescripcion: v }),
    setNuevoTorneoPremio: (v) => update({ nuevoTorneoPremio: v }),
    crearTorneo: () => {
      setState((prev) => {
        const nombre = prev.nuevoTorneoNombre.trim();
        const deporte = prev.nuevoTorneoDeporte.trim();
        const lugar = prev.nuevoTorneoLugar.trim();
        const cupo = parseInt(prev.nuevoTorneoCupo, 10);
        const valorInscripcion = parseInt(prev.nuevoTorneoValorInscripcion, 10);
        if (
          !nombre ||
          !deporte ||
          !lugar ||
          !prev.nuevoTorneoFechaInicio ||
          !prev.nuevoTorneoFechaFin ||
          !cupo ||
          cupo <= 0 ||
          !valorInscripcion ||
          valorInscripcion <= 0
        ) {
          showToast('Completá nombre, deporte, lugar, fechas, cupo y valor de inscripción');
          return prev;
        }
        if (prev.nuevoTorneoFechaFin < prev.nuevoTorneoFechaInicio) {
          showToast('La fecha de fin no puede ser anterior a la de inicio');
          return prev;
        }
        showToast('Torneo creado');
        return {
          ...prev,
          torneos: [
            ...prev.torneos,
            {
              id: Date.now(),
              nombre,
              deporte,
              fechaInicio: prev.nuevoTorneoFechaInicio,
              fechaFin: prev.nuevoTorneoFechaFin,
              lugar,
              cupo,
              valorInscripcion,
              descripcion: prev.nuevoTorneoDescripcion.trim(),
              premio: prev.nuevoTorneoPremio.trim(),
            },
          ],
          nuevoTorneoNombre: '',
          nuevoTorneoDeporte: '',
          nuevoTorneoLugar: '',
          nuevoTorneoCupo: '',
          nuevoTorneoValorInscripcion: '',
          nuevoTorneoDescripcion: '',
          nuevoTorneoPremio: '',
        };
      });
    },
    quitarTorneo: (id) => {
      update((s) => ({
        torneos: s.torneos.filter((t) => t.id !== id),
        equiposTorneo: s.equiposTorneo.filter((e) => e.torneoId !== id),
        partidosTorneo: s.partidosTorneo.filter((p) => p.torneoId !== id),
        inscripcionesTorneo: s.inscripcionesTorneo.filter((i) => i.torneoId !== id),
        torneoExpandidoId: s.torneoExpandidoId === id ? null : s.torneoExpandidoId,
      }));
      showToast('Torneo eliminado');
    },
    openDifundirTorneo: (id) => {
      const t = state.torneos.find((x) => x.id === id);
      if (!t) return;
      const mensaje =
        '🏆 ' + t.nombre + '\n' +
        'Deporte: ' + t.deporte + '\n' +
        'Fechas: ' + formatFechaCorta(t.fechaInicio) + ' al ' + formatFechaCorta(t.fechaFin) + '\n' +
        'Lugar: ' + t.lugar + '\n' +
        'Valor de inscripción: ' + formatMoney(t.valorInscripcion) + '\n' +
        (t.descripcion ? t.descripcion + '\n' : '') +
        '¡Los esperamos a todos los socios!';
      update({ showDifundirTorneo: true, difundirTorneoId: id, mensajeDifusionTorneo: mensaje });
    },
    closeDifundirTorneo: () => update({ showDifundirTorneo: false, difundirTorneoId: null, mensajeDifusionTorneo: '' }),
    setMensajeDifusionTorneo: (v) => update({ mensajeDifusionTorneo: v }),
    enviarWhatsappTorneo: () => {
      window.open('https://wa.me/?text=' + encodeURIComponent(state.mensajeDifusionTorneo), '_blank');
      showToast('Abriendo WhatsApp...');
    },
    copiarMensajeTorneo: () => {
      navigator.clipboard
        .writeText(state.mensajeDifusionTorneo)
        .then(() => showToast('Mensaje copiado'))
        .catch(() => showToast('No se pudo copiar el mensaje'));
    },
    toggleTorneoFixture: (id) => update((s) => ({ torneoExpandidoId: s.torneoExpandidoId === id ? null : id })),
    setTorneoFiltroEstado: (v) => update({ torneoFiltroEstado: v }),
    setNuevoEquipoNombre: (v) => update({ nuevoEquipoNombre: v }),
    agregarEquipoTorneo: (torneoId) => {
      setState((prev) => {
        const nombre = prev.nuevoEquipoNombre.trim();
        if (!nombre) {
          showToast('Ingresá el nombre del equipo');
          return prev;
        }
        return {
          ...prev,
          equiposTorneo: [...prev.equiposTorneo, { id: Date.now(), torneoId, nombre }],
          nuevoEquipoNombre: '',
        };
      });
    },
    quitarEquipoTorneo: (id) => {
      update((s) => ({
        equiposTorneo: s.equiposTorneo.filter((e) => e.id !== id),
        partidosTorneo: s.partidosTorneo.filter((p) => p.equipoLocalId !== id && p.equipoVisitanteId !== id),
      }));
    },
    setNuevoPartidoEquipoLocalId: (v) => update({ nuevoPartidoEquipoLocalId: v }),
    setNuevoPartidoEquipoVisitanteId: (v) => update({ nuevoPartidoEquipoVisitanteId: v }),
    agregarPartidoTorneo: (torneoId) => {
      setState((prev) => {
        const localId = parseInt(prev.nuevoPartidoEquipoLocalId, 10);
        const visitanteId = parseInt(prev.nuevoPartidoEquipoVisitanteId, 10);
        if (!localId || !visitanteId) {
          showToast('Elegí los dos equipos');
          return prev;
        }
        if (localId === visitanteId) {
          showToast('Los equipos tienen que ser distintos');
          return prev;
        }
        return {
          ...prev,
          partidosTorneo: [
            ...prev.partidosTorneo,
            { id: Date.now(), torneoId, equipoLocalId: localId, equipoVisitanteId: visitanteId, golesLocal: null, golesVisitante: null },
          ],
          nuevoPartidoEquipoLocalId: '',
          nuevoPartidoEquipoVisitanteId: '',
        };
      });
    },
    quitarPartidoTorneo: (id) => update((s) => ({ partidosTorneo: s.partidosTorneo.filter((p) => p.id !== id) })),
    setResultadoPartido: (id, campo, valor) => {
      const num = valor === '' ? null : parseInt(valor, 10);
      update((s) => ({
        partidosTorneo: s.partidosTorneo.map((p) => (p.id === id ? { ...p, [campo]: Number.isNaN(num as number) ? null : num } : p)),
      }));
    },
    inscribirseTorneo: (datos) => {
      update((s) => ({
        inscripcionesTorneo: [...s.inscripcionesTorneo.filter((i) => i.torneoId !== datos.torneoId), { id: Date.now(), ...datos }],
      }));
      const nombre = state.torneos.find((t) => t.id === datos.torneoId)?.nombre;
      showToast(nombre ? `Te anotaste a ${nombre}` : 'Te anotaste al torneo');
    },
    cancelarInscripcionTorneo: (torneoId) => {
      update((s) => ({ inscripcionesTorneo: s.inscripcionesTorneo.filter((i) => i.torneoId !== torneoId) }));
      showToast('Cancelaste tu inscripción');
    },

    selectEquipoDeportivo: (id) => update((s) => {
      if (!s.equiposDeportivos.some((equipo) => equipo.id === id)) return {};
      return {
        activeEquipoDeportivoId: id,
        selectedFormacionId: s.formaciones.find((formacion) => formacion.equipoId === id)?.id ?? null,
        actaEventoPendienteId: null,
      };
    }),
    selectEstadisticasVista: (view) => update({ estadisticasVista: view }),
    abrirActaEnCalendario: (eventoId) => update({ screen: 'calendario', moreOpen: false, actaEventoPendienteId: eventoId }),
    limpiarActaEventoPendiente: () => update({ actaEventoPendienteId: null }),
    openAgregarJugador: () => update({
      showJugadorModal: true,
      jugadorEditandoId: null,
      nuevoJugadorNombre: '',
      nuevoJugadorApellido: '',
      nuevoJugadorFechaNacimiento: '',
      nuevoJugadorTelefono: '',
      nuevoJugadorPosicion: '',
      nuevoJugadorEstado: 'disponible',
      nuevoJugadorMotivoLesion: '',
      nuevoJugadorFechaEstimadaRecuperacion: '',
      nuevoJugadorFoto: '',
    }),
    openEditarJugador: (id) => {
      const jugador = state.jugadores.find((item) => item.id === id);
      if (!jugador || jugador.equipoId !== state.activeEquipoDeportivoId) return;
      update({
        showJugadorModal: true,
        jugadorEditandoId: jugador.id,
        nuevoJugadorNombre: jugador.nombre,
        nuevoJugadorApellido: jugador.apellido,
        nuevoJugadorFechaNacimiento: jugador.fechaNacimiento,
        nuevoJugadorTelefono: jugador.telefono,
        nuevoJugadorPosicion: jugador.posicion || '',
        nuevoJugadorEstado: jugador.estado,
        nuevoJugadorMotivoLesion: jugador.estado === 'lesionado' ? jugador.motivoLesion || '' : '',
        nuevoJugadorFechaEstimadaRecuperacion: jugador.estado === 'lesionado' ? jugador.fechaEstimadaRecuperacion || '' : '',
        nuevoJugadorFoto: jugador.foto || '',
      });
    },
    closeJugadorModal: () => update({ showJugadorModal: false, jugadorEditandoId: null }),
    setNuevoJugadorNombre: (v) => update({ nuevoJugadorNombre: v }),
    setNuevoJugadorApellido: (v) => update({ nuevoJugadorApellido: v }),
    setNuevoJugadorFechaNacimiento: (v) => update({ nuevoJugadorFechaNacimiento: v }),
    setNuevoJugadorTelefono: (v) => update({ nuevoJugadorTelefono: v }),
    setNuevoJugadorPosicion: (v) => update({ nuevoJugadorPosicion: v }),
    setNuevoJugadorEstado: (v) => update(v === 'disponible'
      ? { nuevoJugadorEstado: v, nuevoJugadorMotivoLesion: '', nuevoJugadorFechaEstimadaRecuperacion: '' }
      : { nuevoJugadorEstado: v }),
    setNuevoJugadorMotivoLesion: (v) => update({ nuevoJugadorMotivoLesion: v }),
    setNuevoJugadorFechaEstimadaRecuperacion: (v) => update({ nuevoJugadorFechaEstimadaRecuperacion: v }),
    setNuevoJugadorFoto: (v) => update({ nuevoJugadorFoto: v }),
    guardarJugador: () => {
      const equipoId = state.activeEquipoDeportivoId;
      if (equipoId === null) {
        showToast('Elegí un plantel para gestionar jugadores');
        return;
      }
      const nombre = state.nuevoJugadorNombre.trim();
      const apellido = state.nuevoJugadorApellido.trim();
      const motivoLesion = state.nuevoJugadorMotivoLesion.trim();
      const fechaEstimadaRecuperacion = state.nuevoJugadorFechaEstimadaRecuperacion.trim();
      if (!nombre || !apellido || !state.nuevoJugadorFechaNacimiento || !state.nuevoJugadorTelefono.trim()) {
        showToast('Completá nombre, apellido, nacimiento y teléfono');
        return;
      }
      if (state.nuevoJugadorFechaNacimiento > fechaLocalISO()) {
        showToast('La fecha de nacimiento no puede ser futura');
        return;
      }
      if (state.nuevoJugadorEstado === 'lesionado' && (!motivoLesion || !esFechaISO(fechaEstimadaRecuperacion))) {
        showToast('Completá el motivo y una recuperación estimada válida');
        return;
      }
      const jugador = {
        equipoId,
        nombre,
        apellido,
        fechaNacimiento: state.nuevoJugadorFechaNacimiento,
        telefono: state.nuevoJugadorTelefono.trim(),
        posicion: state.nuevoJugadorPosicion || undefined,
        estado: state.nuevoJugadorEstado,
        motivoLesion: state.nuevoJugadorEstado === 'lesionado' ? motivoLesion : undefined,
        fechaEstimadaRecuperacion: state.nuevoJugadorEstado === 'lesionado' ? fechaEstimadaRecuperacion : undefined,
        ...(state.nuevoJugadorFoto ? { foto: state.nuevoJugadorFoto } : {}),
      };
      const editando = state.jugadorEditandoId;
      if (editando && state.jugadores.find((item) => item.id === editando)?.equipoId !== equipoId) {
        showToast('El jugador ya no pertenece al plantel activo');
        return;
      }
      update((prev) => ({
        jugadores: editando
          ? prev.jugadores.map((item) => (item.id === editando ? { ...item, ...jugador } : item))
          : [...prev.jugadores, { id: Date.now(), ...jugador }],
        showJugadorModal: false,
        jugadorEditandoId: null,
      }));
      showToast(editando ? 'Jugador actualizado' : 'Jugador agregado al plantel');
    },
    eliminarJugador: (id) => {
      update((s) => ({
        jugadores: s.jugadores.filter((item) => item.id !== id),
        formaciones: s.formaciones.map((formacion) => ({
          ...formacion,
          jugadores: formacion.jugadores.filter((jugador) => jugador.jugadorId !== id),
          roles: Object.fromEntries(Object.entries(formacion.roles).filter(([, jugadorId]) => jugadorId !== id)),
        })),
      }));
      showToast('Jugador eliminado del plantel');
    },
    openAgregarEquipoDeportivo: () => update({ showEquipoDeportivoModal: true, nuevoEquipoDeportivoNombre: '' }),
    closeEquipoDeportivoModal: () => update({ showEquipoDeportivoModal: false, nuevoEquipoDeportivoNombre: '' }),
    setNuevoEquipoDeportivoNombre: (v) => update({ nuevoEquipoDeportivoNombre: v }),
    agregarEquipoDeportivo: () => {
      const nombre = state.nuevoEquipoDeportivoNombre.trim();
      if (!nombre) {
        showToast('Ingresá el nombre del plantel');
        return;
      }
      const normalizar = (valor: string) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR').trim();
      if (state.equiposDeportivos.some((equipo) => normalizar(equipo.nombre) === normalizar(nombre))) {
        showToast('Ya existe un plantel con ese nombre');
        return;
      }
      const nuevoEquipo = { id: Date.now(), nombre, disciplina: 'Fútbol' };
      update((prev) => ({
        equiposDeportivos: [...prev.equiposDeportivos, nuevoEquipo],
        activeEquipoDeportivoId: nuevoEquipo.id,
        showEquipoDeportivoModal: false,
        nuevoEquipoDeportivoNombre: '',
      }));
      showToast('Plantel creado');
    },
    eliminarEquipoDeportivoActivo: () => {
      const equipo = state.equiposDeportivos.find((item) => item.id === state.activeEquipoDeportivoId);
      if (!equipo) return;
      const nextState = {
        ...state,
        equiposDeportivos: state.equiposDeportivos.filter((item) => item.id !== equipo.id),
        jugadores: state.jugadores.filter((item) => item.equipoId !== equipo.id),
        formaciones: state.formaciones.filter((item) => item.equipoId !== equipo.id),
        activeEquipoDeportivoId: null,
        selectedFormacionId: null,
        actaEventoPendienteId: null,
        showJugadorModal: false,
        jugadorEditandoId: null,
        nuevoJugadorNombre: '',
        nuevoJugadorApellido: '',
        nuevoJugadorFechaNacimiento: '',
        nuevoJugadorTelefono: '',
        nuevoJugadorEstado: 'disponible' as EstadoJugador,
        nuevoJugadorMotivoLesion: '',
        nuevoJugadorFechaEstimadaRecuperacion: '',
        nuevoJugadorFoto: '',
      };
      let rosterSnapshot: string | null; let calendarSnapshot: string | null;
      try {
        rosterSnapshot = window.localStorage.getItem(SPORTS_ROSTER_STORAGE);
        calendarSnapshot = window.localStorage.getItem('club-calendario-deportivo-v1');
      } catch { showToast('No se pudo eliminar el plantel. Intentá nuevamente.'); return; }
      if (!persistSportsRoster(nextState) || !writeSportsCalendarData(removeSportsCalendarTeam(readSportsCalendarData(), equipo.id))) {
        showToast([restoreStorageValue(SPORTS_ROSTER_STORAGE, rosterSnapshot), restoreStorageValue('club-calendario-deportivo-v1', calendarSnapshot)].every(Boolean) ? 'No se pudo eliminar el plantel. Intentá nuevamente.' : 'El guardado quedó incompleto. Recargá la página antes de reintentar.'); return;
      }
      setState(nextState);
      showToast('Plantel eliminado permanentemente');
    },
    crearFormacion: (sistema) => {
      setState((prev) => {
        const equipoId = prev.activeEquipoDeportivoId;
        if (equipoId === null) {
          showToast('Elegí un plantel para crear una formación');
          return prev;
        }
        const disponibles = prev.jugadores.filter((jugador) => jugador.equipoId === equipoId && jugador.estado === 'disponible').slice(0, 11);
        const posiciones = posicionesIniciales(sistema);
        const id = Date.now();
        const formacion: Formacion = {
          id,
          equipoId,
          nombre: siguienteNombreFormacion(prev.formaciones, equipoId),
          sistema,
          jugadores: disponibles.map((jugador, index) => ({ jugadorId: jugador.id, zona: 'titular', ...posiciones[index], dorsal: String(index + 1) })),
          roles: {},
          camiseta: { estilo: 'lisa', principal: '#087f75', secundaria: '#ffffff', texto: '#ffffff' },
        };
        return { ...prev, formaciones: [...prev.formaciones, formacion], selectedFormacionId: id };
      });
      showToast('Formación creada');
    },
    seleccionarFormacion: (id) => update((s) => s.formaciones.some((item) => item.id === id && item.equipoId === s.activeEquipoDeportivoId) ? { selectedFormacionId: id } : {}),
    actualizarFormacion: (id, patch) => update((s) => ({ formaciones: s.formaciones.map((item) => item.id === id && item.equipoId === s.activeEquipoDeportivoId ? { ...item, ...patch } : item) })),
    cambiarSistemaFormacion: (id, sistema) => update((s) => ({
      formaciones: s.formaciones.map((item) => {
        if (item.id !== id || item.equipoId !== s.activeEquipoDeportivoId) return item;
        const posiciones = posicionesIniciales(sistema);
        let indice = 0;
        return { ...item, sistema, jugadores: item.jugadores.map((jugador) => jugador.zona === 'titular' ? { ...jugador, ...posiciones[indice++] } : jugador) };
      }),
    })),
    moverJugadorFormacion: (id, jugadorId, zona, x, y) => {
      const actual = state.formaciones.find((item) => item.id === id);
      if (!actual || actual.equipoId !== state.activeEquipoDeportivoId) return;
      const existente = actual.jugadores.find((jugador) => jugador.jugadorId === jugadorId);
      if (zona === 'titular' && existente?.zona !== 'titular' && (actual?.jugadores.filter((jugador) => jugador.zona === 'titular').length || 0) >= 11) {
        showToast('La formación ya tiene 11 titulares');
        return;
      }
      update((s) => ({
      formaciones: s.formaciones.map((item) => {
        if (item.id !== id || item.equipoId !== s.activeEquipoDeportivoId) return item;
        const jugadorExistente = item.jugadores.find((jugador) => jugador.jugadorId === jugadorId);
        return {
          ...item,
          jugadores: jugadorExistente
            ? item.jugadores.map((jugador) => jugador.jugadorId === jugadorId ? { ...jugador, zona, ...(x === undefined ? {} : { x }), ...(y === undefined ? {} : { y }) } : jugador)
            : [...item.jugadores, { jugadorId, zona, x: x ?? 50, y: y ?? 50, dorsal: String(item.jugadores.length + 1) }],
        };
      }),
      }));
    },
    quitarJugadorFormacion: (id, jugadorId) => update((s) => ({ formaciones: s.formaciones.map((item) => item.id === id && item.equipoId === s.activeEquipoDeportivoId ? { ...item, jugadores: item.jugadores.filter((jugador) => jugador.jugadorId !== jugadorId), roles: Object.fromEntries(Object.entries(item.roles).filter(([, rolJugadorId]) => rolJugadorId !== jugadorId)) } : item) })),
    duplicarFormacion: (id) => setState((prev) => {
      const original = prev.formaciones.find((item) => item.id === id);
      if (!original || original.equipoId !== prev.activeEquipoDeportivoId) return prev;
      const nuevoId = Date.now();
      const copia = { ...original, id: nuevoId, nombre: siguienteNombreFormacion(prev.formaciones, original.equipoId), jugadores: original.jugadores.map((jugador) => ({ ...jugador })), roles: { ...original.roles }, camiseta: { ...original.camiseta } };
      showToast('Formación duplicada');
      return { ...prev, formaciones: [...prev.formaciones, copia], selectedFormacionId: nuevoId };
    }),
    eliminarFormacion: (id) => setState((prev) => {
      const original = prev.formaciones.find((item) => item.id === id);
      if (!original || original.equipoId !== prev.activeEquipoDeportivoId) return prev;
      const restantes = prev.formaciones.filter((item) => item.id !== id);
      showToast('Formación eliminada');
      return { ...prev, formaciones: restantes, selectedFormacionId: prev.selectedFormacionId === id ? (restantes.find((item) => item.equipoId === prev.activeEquipoDeportivoId)?.id ?? null) : prev.selectedFormacionId };
    }),
    normalizarNombreFormacion: (id) => update((s) => {
      const actual = s.formaciones.find((item) => item.id === id);
      if (!actual || actual.equipoId !== s.activeEquipoDeportivoId) return {};
      const nombre = actual.nombre.trim() || siguienteNombreFormacion(s.formaciones.filter((item) => item.id !== id), actual.equipoId);
      return { formaciones: s.formaciones.map((item) => item.id === id ? { ...item, nombre } : item) };
    }),
    publicarFormacionComoNovedad: (formacionId, imagen) => {
      const formacion = state.formaciones.find((f) => f.id === formacionId);
      if (!formacion) return;
      const titulares = formacion.jugadores.filter((j) => j.zona === 'titular');
      if (titulares.length === 0) {
        showToast('Cargá al menos un titular antes de avisar');
        return;
      }
      const equipo = state.equiposDeportivos.find((e) => e.id === formacion.equipoId);
      const listado = titulares
        .map((t) => {
          const jugador = state.jugadores.find((j) => j.id === t.jugadorId);
          return jugador ? `${t.dorsal} - ${jugador.nombre} ${jugador.apellido}` : null;
        })
        .filter(Boolean)
        .join(', ');
      const [y, m, d] = HOY_ISO.split('-');
      update((s) => ({
        comunicados: [
          {
            id: Date.now(),
            titulo: 'Formación confirmada para el partido de hoy',
            cuerpo: `El plantel de ${equipo?.nombre ?? 'el equipo'} juega hoy. Formación (${formacion.sistema}): ${listado}.`,
            destinatario: 'Todos los socios',
            fecha: `${d}/${m}/${y}`,
            hora: 'ahora',
            imagen,
          },
          ...s.comunicados,
        ],
      }));
      showToast('Novedad publicada');
    },
    mostrarToast: showToast,
    confirmarAsociacion: (datos) => {
      const [y, m, d] = HOY_ISO.split('-');
      const ultimoPago = `${d}/${m}/${y}`;
      setState((prev) => {
        const anterior = prev.socios[0];
        const nombreAnterior = `${anterior.nombre} ${anterior.apellido}`;
        const nombreNuevo = `${datos.nombre} ${datos.apellido}`;
        return {
          ...prev,
          socios: prev.socios.map((s, i) => i === 0 ? {
            ...s,
            nombre: datos.nombre,
            apellido: datos.apellido,
            dni: datos.dni,
            fechaNacimiento: datos.fechaNacimiento,
            domicilio: datos.domicilio,
            telefono: datos.telefono,
            email: datos.email,
            debitoAutomatico: datos.debitoAutomatico,
            medioPago: datos.medioPago,
            estado: 'al_dia',
            deuda: 0,
            ultimoPago,
          } : s),
          reservas: nombreNuevo === nombreAnterior ? prev.reservas : prev.reservas.map((r) => r.nombre === nombreAnterior ? { ...r, nombre: nombreNuevo } : r),
          portalRol: 'socio',
          screen: 'portal_cuota',
        };
      });
      showToast('¡Bienvenido/a al club! Ya sos socio.');
    },
  };

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { HOY_ISO };
