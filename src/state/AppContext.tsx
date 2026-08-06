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
  seedComunicados,
  seedCategorias,
  seedEquiposDeportivos,
  seedJugadores,
  HOY_ISO,
} from '../data/seed';
import { CUOTA } from '../lib/derive';
import { formatFechaCorta, formatMoney } from '../lib/format';

function fechaLocalISO(fecha = new Date()) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
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
  const vacio = { formaciones: [] as Formacion[], selectedFormacionId: null as number | null, equiposDeportivos: seedEquiposDeportivos, jugadores: seedJugadores };
  if (typeof window === 'undefined') return vacio;
  try {
    const guardado = window.localStorage.getItem('club-formaciones-v1');
    if (!guardado) return vacio;
    const datos: unknown = JSON.parse(guardado);
    if (!datos || typeof datos !== 'object') return vacio;
    const valor = datos as Record<string, unknown>;
    const equiposCandidatos = Array.isArray(valor.equiposDeportivos)
      ? valor.equiposDeportivos.filter((item): item is EquipoDeportivo => !!item && typeof item === 'object' && typeof (item as EquipoDeportivo).id === 'number' && typeof (item as EquipoDeportivo).nombre === 'string')
      : seedEquiposDeportivos;
    const equipos = equiposCandidatos.length ? equiposCandidatos : seedEquiposDeportivos;
    const equipoIds = new Set(equipos.map((equipo) => equipo.id));
    const jugadores = Array.isArray(valor.jugadores)
      ? valor.jugadores.filter((item): item is Jugador => !!item && typeof item === 'object' && typeof (item as Jugador).id === 'number' && typeof (item as Jugador).equipoId === 'number' && equipoIds.has((item as Jugador).equipoId) && typeof (item as Jugador).nombre === 'string' && typeof (item as Jugador).apellido === 'string' && ((item as Jugador).estado === 'disponible' || (item as Jugador).estado === 'lesionado'))
      : seedJugadores;
    const jugadoresPorId = new Map(jugadores.map((jugador) => [jugador.id, jugador]));
    const formaciones = !Array.isArray(valor.formaciones) ? [] : valor.formaciones.flatMap((item): Formacion[] => {
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
    const selectedFormacionId = typeof valor.selectedFormacionId === 'number' && formaciones.some((formacion) => formacion.id === valor.selectedFormacionId) ? valor.selectedFormacionId : null;
    return { formaciones, selectedFormacionId, equiposDeportivos: equipos, jugadores };
  } catch { return vacio; }
}

export interface AppState {
  isMobile: boolean;
  screen: Screen;
  activeModule: Modulo | null;
  moreOpen: boolean;
  showMediosPago: boolean;
  showInfoCanchas: boolean;
  showAgregarPartido: boolean;
  showReponerStockBuffet: boolean;
  showReponerStockShop: boolean;
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
  recordatorios: Record<number, EstadoRecordatorio>;
  pagosHoy: Pago[];
  nuevoPagoSocioId: string;
  nuevoPagoMedio: MedioPago;
  ventasShop: VentaShop[];
  productosShop: ProductoShop[];
  nuevaVentaProductoId: string;
  nuevaVentaVarianteId: string;
  nuevaVentaMedio: MedioPago;
  nuevoStockShopProductoId: string;
  nuevoStockShopCantidad: string;
  nuevoStockShopTalle: string;
  nuevoStockShopColor: string;
  productosBuffet: ProductoBuffet[];
  ventasBuffet: VentaBuffet[];
  nuevaVentaBuffetProductoId: string;
  nuevaVentaBuffetTipo: TipoCliente;
  nuevaVentaBuffetMedio: MedioPago;
  nuevoStockBuffetProductoId: string;
  nuevoStockBuffetCantidad: string;
  egresos: Egreso[];
  nuevoEgresoCategoria: string;
  nuevoEgresoMonto: string;
  comunicados: Comunicado[];
  nuevoTitulo: string;
  nuevoCuerpo: string;
  nuevoDestinatario: string;
  clubNombre: string;
  clubDireccion: string;
  diaVencimiento: string;
  debitoAutomaticoHabilitado: boolean;
  categorias: Categoria[];
  equiposDeportivos: EquipoDeportivo[];
  jugadores: Jugador[];
  selectedEquipoDeportivoId: number;
  showJugadorModal: boolean;
  jugadorEditandoId: number | null;
  nuevoJugadorNombre: string;
  nuevoJugadorApellido: string;
  nuevoJugadorFechaNacimiento: string;
  nuevoJugadorTelefono: string;
  nuevoJugadorEstado: EstadoJugador;
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
  showInfoCanchas: false,
  showAgregarPartido: false,
  showReponerStockBuffet: false,
  showReponerStockShop: false,
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
  recordatorios: seedRecordatorios,
  pagosHoy: seedPagosHoy,
  nuevoPagoSocioId: '',
  nuevoPagoMedio: 'Efectivo',
  ventasShop: seedVentasShop,
  productosShop: seedProductosShop,
  nuevaVentaProductoId: '',
  nuevaVentaVarianteId: '',
  nuevaVentaMedio: 'Efectivo',
  nuevoStockShopProductoId: '',
  nuevoStockShopCantidad: '',
  nuevoStockShopTalle: '',
  nuevoStockShopColor: '',
  productosBuffet: seedProductosBuffet,
  ventasBuffet: seedVentasBuffet,
  nuevaVentaBuffetProductoId: '',
  nuevaVentaBuffetTipo: 'Socio',
  nuevaVentaBuffetMedio: 'Efectivo',
  nuevoStockBuffetProductoId: '',
  nuevoStockBuffetCantidad: '',
  egresos: seedEgresos,
  nuevoEgresoCategoria: 'Jugadores',
  nuevoEgresoMonto: '',
  comunicados: seedComunicados,
  nuevoTitulo: '',
  nuevoCuerpo: '',
  nuevoDestinatario: 'Todos los socios',
  clubNombre: 'Club Atlético Modelo',
  clubDireccion: 'Av. Colón 1234, Mar del Plata',
  diaVencimiento: '5',
  debitoAutomaticoHabilitado: true,
  categorias: seedCategorias,
  equiposDeportivos: seedEquiposDeportivos,
  jugadores: seedJugadores,
  selectedEquipoDeportivoId: 1,
  showJugadorModal: false,
  jugadorEditandoId: null,
  nuevoJugadorNombre: '',
  nuevoJugadorApellido: '',
  nuevoJugadorFechaNacimiento: '',
  nuevoJugadorTelefono: '',
  nuevoJugadorEstado: 'disponible',
  nuevoJugadorFoto: '',
  showEquipoDeportivoModal: false,
  nuevoEquipoDeportivoNombre: '',
  formaciones: [],
  selectedFormacionId: null,
};

export interface AppActions {
  selectModule: (module: Modulo) => void;
  showModuleSelector: () => void;
  navigate: (screen: Screen) => void;
  toggleIngresosMenu: (e: React.MouseEvent) => void;
  toggleMore: () => void;
  closeMore: () => void;
  stopClick: (e: React.MouseEvent) => void;
  openMediosPago: () => void;
  closeMediosPago: () => void;
  openInfoCanchas: () => void;
  closeInfoCanchas: () => void;
  selectCancha: (id: number) => void;
  onDiaChange: (v: string) => void;
  openReservar: (hora: string) => void;
  closeReservaModal: () => void;
  setReservaNombre: (v: string) => void;
  confirmarReserva: () => void;
  liberarReserva: (id: number) => void;
  openAgregarPartido: (fecha?: string) => void;
  closeAgregarPartido: () => void;
  openReponerStockBuffet: () => void;
  closeReponerStockBuffet: () => void;
  openReponerStockShop: () => void;
  closeReponerStockShop: () => void;
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
  toggleRecordatorio: (id: number) => void;
  enviarRecordatorioWhatsapp: (id: number) => void;
  cobrarMoroso: (id: number) => void;
  setNuevoPagoSocioId: (v: string) => void;
  setNuevoPagoMedio: (v: MedioPago) => void;
  registrarPago: () => void;
  setNuevaVentaProductoId: (v: string) => void;
  setNuevaVentaVarianteId: (v: string) => void;
  setNuevaVentaMedio: (v: MedioPago) => void;
  registrarVentaShop: () => void;
  setNuevoStockShopProductoId: (v: string) => void;
  setNuevoStockShopCantidad: (v: string) => void;
  setNuevoStockShopTalle: (v: string) => void;
  setNuevoStockShopColor: (v: string) => void;
  reponerStockShop: () => void;
  setNuevaVentaBuffetProductoId: (v: string) => void;
  setNuevaVentaBuffetTipo: (v: TipoCliente) => void;
  setNuevaVentaBuffetMedio: (v: MedioPago) => void;
  registrarVentaBuffet: () => void;
  setNuevoStockBuffetProductoId: (v: string) => void;
  setNuevoStockBuffetCantidad: (v: string) => void;
  reponerStockBuffet: () => void;
  setNuevoEgresoCategoria: (v: string) => void;
  setNuevoEgresoMonto: (v: string) => void;
  agregarEgreso: () => void;
  quitarEgreso: (id: number) => void;
  setNuevoTitulo: (v: string) => void;
  setNuevoCuerpo: (v: string) => void;
  setNuevoDestinatario: (v: string) => void;
  enviarComunicado: () => void;
  setClubNombre: (v: string) => void;
  setClubDireccion: (v: string) => void;
  setDiaVencimiento: (v: string) => void;
  toggleDebitoAutomatico: () => void;
  guardarConfig: () => void;
  setCategoriaMonto: (id: number, monto: number) => void;
  selectEquipoDeportivo: (id: number) => void;
  openAgregarJugador: () => void;
  openEditarJugador: (id: number) => void;
  closeJugadorModal: () => void;
  setNuevoJugadorNombre: (v: string) => void;
  setNuevoJugadorApellido: (v: string) => void;
  setNuevoJugadorFechaNacimiento: (v: string) => void;
  setNuevoJugadorTelefono: (v: string) => void;
  setNuevoJugadorEstado: (v: EstadoJugador) => void;
  setNuevoJugadorFoto: (v: string) => void;
  guardarJugador: () => void;
  eliminarJugador: (id: number) => void;
  openAgregarEquipoDeportivo: () => void;
  closeEquipoDeportivoModal: () => void;
  setNuevoEquipoDeportivoNombre: (v: string) => void;
  agregarEquipoDeportivo: () => void;
  crearFormacion: (sistema: SistemaFormacion) => void;
  seleccionarFormacion: (id: number) => void;
  actualizarFormacion: (id: number, patch: Partial<Omit<Formacion, 'id' | 'equipoId'>>) => void;
  cambiarSistemaFormacion: (id: number, sistema: SistemaFormacion) => void;
  moverJugadorFormacion: (id: number, jugadorId: number, zona: JugadorFormacion['zona'], x?: number, y?: number) => void;
  quitarJugadorFormacion: (id: number, jugadorId: number) => void;
  duplicarFormacion: (id: number) => void;
  eliminarFormacion: (id: number) => void;
  normalizarNombreFormacion: (id: number) => void;
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
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem('club-formaciones-v1', JSON.stringify({ version: 2, formaciones: state.formaciones, selectedFormacionId: state.selectedFormacionId, equiposDeportivos: state.equiposDeportivos, jugadores: state.jugadores })); } catch { /* almacenamiento no disponible */ }
  }, [state.formaciones, state.selectedFormacionId, state.equiposDeportivos, state.jugadores]);

  const showToast = useCallback((msg: string) => {
    update({ toast: msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => update({ toast: null }), 2400);
  }, [update]);

  const actions: AppActions = {
    selectModule: (module) => {
      const screen: Screen = module === 'administrativo' ? 'dashboard' : module === 'deportivo' ? 'deportivo_inicio' : 'portal_inicio';
      update({ activeModule: module, screen, moreOpen: false });
    },
    showModuleSelector: () => update({ activeModule: null, moreOpen: false }),

    navigate: (screen) => {
      const opensIngresos = screen === 'ventas' || screen === 'buffet' || screen === 'canchas' || screen === 'torneos';
      update((s) => ({ screen, moreOpen: false, ingresosMenuOpen: opensIngresos ? true : s.ingresosMenuOpen }));
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
    openInfoCanchas: () => update({ showInfoCanchas: true }),
    closeInfoCanchas: () => update({ showInfoCanchas: false }),

    selectCancha: (id) => update({ selectedCanchaId: id }),
    onDiaChange: (v) => update({ selectedDia: v }),

    openReservar: (hora) => update({ showReservaModal: true, reservaHoraSel: hora, reservaNombre: '' }),
    closeReservaModal: () => update({ showReservaModal: false }),
    setReservaNombre: (v) => update({ reservaNombre: v }),
    confirmarReserva: () => {
      setState((prev) => {
        const nombre = prev.reservaNombre.trim();
        if (!nombre) {
          showToast('Ingresá el nombre de quien reserva');
          return prev;
        }
        showToast('Turno reservado para ' + nombre);
        return {
          ...prev,
          reservas: [
            ...prev.reservas,
            { id: Date.now(), canchaId: prev.selectedCanchaId, dia: prev.selectedDia, hora: prev.reservaHoraSel, nombre },
          ],
          showReservaModal: false,
        };
      });
    },
    liberarReserva: (id) => {
      update((s) => ({ reservas: s.reservas.filter((r) => r.id !== id) }));
      showToast('Turno liberado');
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
    openReponerStockBuffet: () => update({ showReponerStockBuffet: true }),
    closeReponerStockBuffet: () => update({ showReponerStockBuffet: false, nuevoStockBuffetProductoId: '', nuevoStockBuffetCantidad: '' }),
    openReponerStockShop: () => update({ showReponerStockShop: true }),
    closeReponerStockShop: () => update({ showReponerStockShop: false, nuevoStockShopProductoId: '', nuevoStockShopCantidad: '', nuevoStockShopTalle: '', nuevoStockShopColor: '' }),

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

    toggleRecordatorio: (id) => {
      update((s) => {
        const cur = s.recordatorios[id] || 'pendiente';
        const next: EstadoRecordatorio = cur === 'enviado' ? 'pendiente' : 'enviado';
        return { recordatorios: { ...s.recordatorios, [id]: next } };
      });
      showToast('Estado del recordatorio actualizado');
    },

    enviarRecordatorioWhatsapp: (id) => {
      const s = state.socios.find((x) => x.id === id);
      if (!s) return;
      const mensaje = 'Hola ' + s.nombre + ', te recordamos que tenés una cuota pendiente de ' + formatMoney(s.deuda) + ' en ' + state.clubNombre + '. ¡Gracias!';
      const numero = s.telefono.replace(/\D/g, '');
      window.open('https://wa.me/' + numero + '?text=' + encodeURIComponent(mensaje), '_blank');
      update((prev) => ({ recordatorios: { ...prev.recordatorios, [id]: 'enviado' } }));
      showToast('Abriendo WhatsApp para ' + s.nombre);
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
          pagosHoy: [{ id: Date.now(), nombre: s.nombre + ' ' + s.apellido, monto, medio: 'Efectivo', hora: 'ahora' }, ...prev.pagosHoy],
        };
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
          pagosHoy: [{ id: Date.now(), nombre: s.nombre + ' ' + s.apellido, monto: CUOTA, medio: prev.nuevoPagoMedio, hora: 'ahora' }, ...prev.pagosHoy],
          socios: prev.socios.map((x) => (x.id === s.id ? { ...x, estado: 'al_dia', deuda: 0, ultimoPago: '29/07/2026' } : x)),
          nuevoPagoSocioId: '',
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
              { id: Date.now(), producto: p.nombre + ' (Talle ' + variante.talle + ' · ' + variante.color + ')', precio: p.precio, medio: prev.nuevaVentaMedio, hora: 'ahora' },
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
          ventasShop: [{ id: Date.now(), producto: p.nombre, precio: p.precio, medio: prev.nuevaVentaMedio, hora: 'ahora' }, ...prev.ventasShop],
          productosShop: prev.productosShop.map((x) => (x.id === p.id ? { ...x, stock: x.stock - 1 } : x)),
          nuevaVentaProductoId: '',
        };
      });
    },

    setNuevoStockShopProductoId: (v) => update({ nuevoStockShopProductoId: v }),
    setNuevoStockShopCantidad: (v) => update({ nuevoStockShopCantidad: v }),
    setNuevoStockShopTalle: (v) => update({ nuevoStockShopTalle: v }),
    setNuevoStockShopColor: (v) => update({ nuevoStockShopColor: v }),
    reponerStockShop: () => {
      setState((prev) => {
        const p = prev.productosShop.find((x) => String(x.id) === String(prev.nuevoStockShopProductoId));
        const cantidad = parseInt(prev.nuevoStockShopCantidad, 10);
        if (!p || !cantidad || cantidad <= 0) {
          showToast('Elegí un producto y una cantidad válida');
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
            nuevoStockShopProductoId: '',
            nuevoStockShopCantidad: '',
            nuevoStockShopTalle: '',
            nuevoStockShopColor: '',
            showReponerStockShop: false,
          };
        }
        showToast('Stock actualizado — ' + p.nombre);
        return {
          ...prev,
          productosShop: prev.productosShop.map((x) => (x.id === p.id ? { ...x, stock: x.stock + cantidad } : x)),
          nuevoStockShopProductoId: '',
          nuevoStockShopCantidad: '',
          showReponerStockShop: false,
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

    setNuevoStockBuffetProductoId: (v) => update({ nuevoStockBuffetProductoId: v }),
    setNuevoStockBuffetCantidad: (v) => update({ nuevoStockBuffetCantidad: v }),
    reponerStockBuffet: () => {
      setState((prev) => {
        const p = prev.productosBuffet.find((x) => String(x.id) === String(prev.nuevoStockBuffetProductoId));
        const cantidad = parseInt(prev.nuevoStockBuffetCantidad, 10);
        if (!p || !cantidad || cantidad <= 0) {
          showToast('Elegí un producto y una cantidad válida');
          return prev;
        }
        showToast('Stock actualizado — ' + p.nombre);
        return {
          ...prev,
          productosBuffet: prev.productosBuffet.map((x) => (x.id === p.id ? { ...x, stock: x.stock + cantidad } : x)),
          nuevoStockBuffetProductoId: '',
          nuevoStockBuffetCantidad: '',
          showReponerStockBuffet: false,
        };
      });
    },

    setNuevoEgresoCategoria: (v) => update({ nuevoEgresoCategoria: v }),
    setNuevoEgresoMonto: (v) => update({ nuevoEgresoMonto: v }),
    agregarEgreso: () => {
      setState((prev) => {
        const categoria = prev.nuevoEgresoCategoria.trim();
        const monto = parseInt(prev.nuevoEgresoMonto, 10);
        if (!categoria || !monto || monto <= 0) {
          showToast('Completá categoría y monto');
          return prev;
        }
        showToast('Egreso registrado');
        return {
          ...prev,
          egresos: [...prev.egresos, { id: Date.now(), categoria, monto }],
          nuevoEgresoCategoria: '',
          nuevoEgresoMonto: '',
        };
      });
    },
    quitarEgreso: (id) => {
      update((s) => ({ egresos: s.egresos.filter((e) => e.id !== id) }));
      showToast('Egreso eliminado');
    },

    setNuevoTitulo: (v) => update({ nuevoTitulo: v }),
    setNuevoCuerpo: (v) => update({ nuevoCuerpo: v }),
    setNuevoDestinatario: (v) => update({ nuevoDestinatario: v }),
    enviarComunicado: () => {
      setState((prev) => {
        if (!prev.nuevoTitulo.trim() || !prev.nuevoCuerpo.trim()) {
          showToast('Completá título y mensaje');
          return prev;
        }
        showToast('Comunicado enviado a ' + prev.nuevoDestinatario);
        return {
          ...prev,
          comunicados: [
            { id: Date.now(), titulo: prev.nuevoTitulo, cuerpo: prev.nuevoCuerpo, destinatario: prev.nuevoDestinatario, fecha: '29/07/2026' },
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
    selectEquipoDeportivo: (id) => update({ selectedEquipoDeportivoId: id }),
    openAgregarJugador: () => update({
      showJugadorModal: true,
      jugadorEditandoId: null,
      nuevoJugadorNombre: '',
      nuevoJugadorApellido: '',
      nuevoJugadorFechaNacimiento: '',
      nuevoJugadorTelefono: '',
      nuevoJugadorEstado: 'disponible',
      nuevoJugadorFoto: '',
    }),
    openEditarJugador: (id) => {
      const jugador = state.jugadores.find((item) => item.id === id);
      if (!jugador) return;
      update({
        showJugadorModal: true,
        jugadorEditandoId: jugador.id,
        nuevoJugadorNombre: jugador.nombre,
        nuevoJugadorApellido: jugador.apellido,
        nuevoJugadorFechaNacimiento: jugador.fechaNacimiento,
        nuevoJugadorTelefono: jugador.telefono,
        nuevoJugadorEstado: jugador.estado,
        nuevoJugadorFoto: jugador.foto || '',
      });
    },
    closeJugadorModal: () => update({ showJugadorModal: false, jugadorEditandoId: null }),
    setNuevoJugadorNombre: (v) => update({ nuevoJugadorNombre: v }),
    setNuevoJugadorApellido: (v) => update({ nuevoJugadorApellido: v }),
    setNuevoJugadorFechaNacimiento: (v) => update({ nuevoJugadorFechaNacimiento: v }),
    setNuevoJugadorTelefono: (v) => update({ nuevoJugadorTelefono: v }),
    setNuevoJugadorEstado: (v) => update({ nuevoJugadorEstado: v }),
    setNuevoJugadorFoto: (v) => update({ nuevoJugadorFoto: v }),
    guardarJugador: () => {
      const nombre = state.nuevoJugadorNombre.trim();
      const apellido = state.nuevoJugadorApellido.trim();
      if (!nombre || !apellido || !state.nuevoJugadorFechaNacimiento || !state.nuevoJugadorTelefono.trim()) {
        showToast('Completá nombre, apellido, nacimiento y teléfono');
        return;
      }
      if (state.nuevoJugadorFechaNacimiento > fechaLocalISO()) {
        showToast('La fecha de nacimiento no puede ser futura');
        return;
      }
      const jugador = {
        equipoId: state.selectedEquipoDeportivoId,
        nombre,
        apellido,
        fechaNacimiento: state.nuevoJugadorFechaNacimiento,
        telefono: state.nuevoJugadorTelefono.trim(),
        estado: state.nuevoJugadorEstado,
        ...(state.nuevoJugadorFoto ? { foto: state.nuevoJugadorFoto } : {}),
      };
      const editando = state.jugadorEditandoId;
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
      const nuevoEquipo = { id: Date.now(), nombre };
      update((prev) => ({
        equiposDeportivos: [...prev.equiposDeportivos, nuevoEquipo],
        selectedEquipoDeportivoId: nuevoEquipo.id,
        showEquipoDeportivoModal: false,
        nuevoEquipoDeportivoNombre: '',
      }));
      showToast('Plantel creado');
    },
    crearFormacion: (sistema) => {
      setState((prev) => {
        const equipoId = prev.selectedEquipoDeportivoId;
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
    seleccionarFormacion: (id) => update({ selectedFormacionId: id }),
    actualizarFormacion: (id, patch) => update((s) => ({ formaciones: s.formaciones.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    cambiarSistemaFormacion: (id, sistema) => update((s) => ({
      formaciones: s.formaciones.map((item) => {
        if (item.id !== id) return item;
        const posiciones = posicionesIniciales(sistema);
        let indice = 0;
        return { ...item, sistema, jugadores: item.jugadores.map((jugador) => jugador.zona === 'titular' ? { ...jugador, ...posiciones[indice++] } : jugador) };
      }),
    })),
    moverJugadorFormacion: (id, jugadorId, zona, x, y) => {
      const actual = state.formaciones.find((item) => item.id === id);
      const existente = actual?.jugadores.find((jugador) => jugador.jugadorId === jugadorId);
      if (zona === 'titular' && existente?.zona !== 'titular' && (actual?.jugadores.filter((jugador) => jugador.zona === 'titular').length || 0) >= 11) {
        showToast('La formación ya tiene 11 titulares');
        return;
      }
      update((s) => ({
      formaciones: s.formaciones.map((item) => {
        if (item.id !== id) return item;
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
    quitarJugadorFormacion: (id, jugadorId) => update((s) => ({ formaciones: s.formaciones.map((item) => item.id === id ? { ...item, jugadores: item.jugadores.filter((jugador) => jugador.jugadorId !== jugadorId), roles: Object.fromEntries(Object.entries(item.roles).filter(([, rolJugadorId]) => rolJugadorId !== jugadorId)) } : item) })),
    duplicarFormacion: (id) => setState((prev) => {
      const original = prev.formaciones.find((item) => item.id === id);
      if (!original) return prev;
      const nuevoId = Date.now();
      const copia = { ...original, id: nuevoId, nombre: siguienteNombreFormacion(prev.formaciones, original.equipoId), jugadores: original.jugadores.map((jugador) => ({ ...jugador })), roles: { ...original.roles }, camiseta: { ...original.camiseta } };
      showToast('Formación duplicada');
      return { ...prev, formaciones: [...prev.formaciones, copia], selectedFormacionId: nuevoId };
    }),
    eliminarFormacion: (id) => setState((prev) => {
      const restantes = prev.formaciones.filter((item) => item.id !== id);
      showToast('Formación eliminada');
      return { ...prev, formaciones: restantes, selectedFormacionId: prev.selectedFormacionId === id ? (restantes.find((item) => item.equipoId === prev.selectedEquipoDeportivoId)?.id ?? null) : prev.selectedFormacionId };
    }),
    normalizarNombreFormacion: (id) => update((s) => {
      const actual = s.formaciones.find((item) => item.id === id);
      if (!actual) return {};
      const nombre = actual.nombre.trim() || siguienteNombreFormacion(s.formaciones.filter((item) => item.id !== id), actual.equipoId);
      return { formaciones: s.formaciones.map((item) => item.id === id ? { ...item, nombre } : item) };
    }),
    mostrarToast: showToast,
  };

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { HOY_ISO };
