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
  Torneo,
  EquipoTorneo,
  PartidoTorneo,
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
  seedTorneos,
  seedEquiposTorneo,
  seedPartidosTorneo,
  HOY_ISO,
} from '../data/seed';
import { CUOTA } from '../lib/derive';
import { formatFechaCorta, formatMoney } from '../lib/format';

export interface AppState {
  loggedIn: boolean;
  loginEmail: string;
  loginPass: string;
  loading: boolean;
  isMobile: boolean;
  screen: Screen;
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
  torneos: Torneo[];
  nuevoTorneoNombre: string;
  nuevoTorneoDeporte: string;
  nuevoTorneoFechaInicio: string;
  nuevoTorneoFechaFin: string;
  nuevoTorneoLugar: string;
  nuevoTorneoCupo: string;
  nuevoTorneoValorInscripcion: string;
  nuevoTorneoDescripcion: string;
  showDifundirTorneo: boolean;
  difundirTorneoId: number | null;
  mensajeDifusionTorneo: string;
  equiposTorneo: EquipoTorneo[];
  partidosTorneo: PartidoTorneo[];
  torneoExpandidoId: number | null;
  nuevoEquipoNombre: string;
  nuevoPartidoEquipoLocalId: string;
  nuevoPartidoEquipoVisitanteId: string;
}

const initialState: AppState = {
  loggedIn: false,
  loginEmail: '',
  loginPass: '',
  loading: false,
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 900 : false,
  screen: 'dashboard',
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
  torneos: seedTorneos,
  nuevoTorneoNombre: '',
  nuevoTorneoDeporte: '',
  nuevoTorneoFechaInicio: '2026-08-01',
  nuevoTorneoFechaFin: '2026-08-02',
  nuevoTorneoLugar: '',
  nuevoTorneoCupo: '',
  nuevoTorneoValorInscripcion: '',
  nuevoTorneoDescripcion: '',
  showDifundirTorneo: false,
  difundirTorneoId: null,
  mensajeDifusionTorneo: '',
  equiposTorneo: seedEquiposTorneo,
  partidosTorneo: seedPartidosTorneo,
  torneoExpandidoId: null,
  nuevoEquipoNombre: '',
  nuevoPartidoEquipoLocalId: '',
  nuevoPartidoEquipoVisitanteId: '',
};

export interface AppActions {
  onLogin: (e: React.FormEvent) => void;
  setLoginEmail: (v: string) => void;
  setLoginPass: (v: string) => void;
  onLogout: () => void;
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
  setNuevoTorneoNombre: (v: string) => void;
  setNuevoTorneoDeporte: (v: string) => void;
  setNuevoTorneoFechaInicio: (v: string) => void;
  setNuevoTorneoFechaFin: (v: string) => void;
  setNuevoTorneoLugar: (v: string) => void;
  setNuevoTorneoCupo: (v: string) => void;
  setNuevoTorneoValorInscripcion: (v: string) => void;
  setNuevoTorneoDescripcion: (v: string) => void;
  crearTorneo: () => void;
  quitarTorneo: (id: number) => void;
  openDifundirTorneo: (id: number) => void;
  closeDifundirTorneo: () => void;
  setMensajeDifusionTorneo: (v: string) => void;
  enviarWhatsappTorneo: () => void;
  copiarMensajeTorneo: () => void;
  toggleTorneoFixture: (id: number) => void;
  setNuevoEquipoNombre: (v: string) => void;
  agregarEquipoTorneo: (torneoId: number) => void;
  quitarEquipoTorneo: (id: number) => void;
  setNuevoPartidoEquipoLocalId: (v: string) => void;
  setNuevoPartidoEquipoVisitanteId: (v: string) => void;
  agregarPartidoTorneo: (torneoId: number) => void;
  quitarPartidoTorneo: (id: number) => void;
  setResultadoPartido: (id: number, campo: 'golesLocal' | 'golesVisitante', valor: string) => void;
}

interface AppContextValue {
  state: AppState;
  actions: AppActions;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const update = useCallback((patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => {
    setState((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  useEffect(() => {
    const onResize = () => update({ isMobile: window.innerWidth < 900 });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [update]);

  const showToast = useCallback((msg: string) => {
    update({ toast: msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => update({ toast: null }), 2400);
  }, [update]);

  const actions: AppActions = {
    onLogin: (e) => {
      e.preventDefault();
      update({ loggedIn: true, loading: true });
      setTimeout(() => update({ loading: false }), 550);
    },
    setLoginEmail: (v) => update({ loginEmail: v }),
    setLoginPass: (v) => update({ loginPass: v }),
    onLogout: () => update({ loggedIn: false, screen: 'dashboard', moreOpen: false }),

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

    setNuevoTorneoNombre: (v) => update({ nuevoTorneoNombre: v }),
    setNuevoTorneoDeporte: (v) => update({ nuevoTorneoDeporte: v }),
    setNuevoTorneoFechaInicio: (v) => update({ nuevoTorneoFechaInicio: v }),
    setNuevoTorneoFechaFin: (v) => update({ nuevoTorneoFechaFin: v }),
    setNuevoTorneoLugar: (v) => update({ nuevoTorneoLugar: v }),
    setNuevoTorneoCupo: (v) => update({ nuevoTorneoCupo: v }),
    setNuevoTorneoValorInscripcion: (v) => update({ nuevoTorneoValorInscripcion: v }),
    setNuevoTorneoDescripcion: (v) => update({ nuevoTorneoDescripcion: v }),
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
            },
          ],
          nuevoTorneoNombre: '',
          nuevoTorneoDeporte: '',
          nuevoTorneoLugar: '',
          nuevoTorneoCupo: '',
          nuevoTorneoValorInscripcion: '',
          nuevoTorneoDescripcion: '',
        };
      });
    },
    quitarTorneo: (id) => {
      update((s) => ({
        torneos: s.torneos.filter((t) => t.id !== id),
        equiposTorneo: s.equiposTorneo.filter((e) => e.torneoId !== id),
        partidosTorneo: s.partidosTorneo.filter((p) => p.torneoId !== id),
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
  };

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { HOY_ISO };
