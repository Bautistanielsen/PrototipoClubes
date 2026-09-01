import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, CSSProperties, MouseEvent, ReactNode } from 'react';
import { useApp } from '../state/AppContext';
import { formatMoney, formatFechaCorta } from '../lib/format';
import { HOY_ISO, TURNO_HORAS, estadoTorneo, estadoTorneoMeta, tablaPosiciones, proximoVencimientoCuota, ultimoVencimientoCuotaVencido, estadoMeta, estadoSponsor, historialPagosSocio, comunicadosParaSocio } from '../lib/derive';
import { readSportsCalendarData, parseFinalizedResult } from '../lib/sportsCalendar';
import type { SportsCalendarData } from '../lib/sportsCalendar';
import type { MedioPago, Comunicado, Torneo } from '../types';
import ModalOverlay from '../components/modals/ModalOverlay';
import HinchaAssistant from '../components/HinchaAssistant';
import ClubEscudo from '../components/ClubEscudo';

export default function PortalSocio() {
  const { state, actions } = useApp();
  const active = state.screen;
  const firstSocio = state.socios[0];
  const memberName = `${firstSocio.nombre} ${firstSocio.apellido}`;
  const comunicadosSocio = comunicadosParaSocio(state.comunicados, firstSocio);
  const latestNews = comunicadosSocio.slice(0, 2);
  const novedadesNoLeidas = comunicadosSocio.filter((c) => !state.comunicadosLeidos.includes(c.id)).length;
  const nextReservation = useMemo(() => state.reservas.find((r) => r.nombre === memberName), [memberName, state.reservas]);

  const content = () => {
    if (active === 'portal_login') return <Login />;
    if (active === 'portal_cuota') return <Cuota />;
    if (active === 'portal_reservas') return <Reservas />;
    if (active === 'portal_novedades') return <Novedades />;
    if (active === 'portal_perfil') return <Perfil memberName={memberName} />;
    if (active === 'portal_hacete_socio') return <HaceteSocio />;
    if (active === 'portal_mis_reservas') return <MisReservas />;
    if (active === 'portal_torneos') return <PortalTorneos />;
    if (active === 'portal_partidos') return <PortalPartidos />;
    if (active === 'portal_tienda') return <PortalTienda />;
    return <Inicio reservation={nextReservation} news={latestNews} />;
  };

  if (active === 'portal_login') {
    return (
      <div className="portal-frame">
        <div className="portal-device-top"><span /></div>
        <div className="portal-content">{content()}</div>
      </div>
    );
  }

  return (
    <div className="portal-frame">
      <div className="portal-device-top"><span /></div>
      <div className="portal-content">
        <div className="portal-topbar">
          <div className="portal-topbar-brand">
            <div className="portal-topbar-crest">{firstSocio.fotoPerfil ? <img src={firstSocio.fotoPerfil} alt="" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover', display: 'block' }} /> : 'CAM'}</div>
            <span className="portal-topbar-greeting">HOLA, {memberName.toUpperCase()}</span>
          </div>
        </div>
        {content()}
      </div>
      <nav className="portal-nav">
        <PortalNav active={active === 'portal_inicio'} label="Inicio" badge={novedadesNoLeidas} onClick={() => actions.navigate('portal_inicio')} />
        <PortalNav active={active === 'portal_cuota' || active === 'portal_hacete_socio'} label={state.portalRol === 'hincha' ? 'Asociate' : 'Mi cuota'} onClick={() => actions.navigate('portal_cuota')} />
        <PortalNav active={active === 'portal_torneos'} label="Torneos" onClick={() => actions.navigate('portal_torneos')} />
        <PortalNav active={active === 'portal_reservas'} label="Reservas" onClick={() => actions.navigate('portal_reservas')} />
        <PortalNav active={active === 'portal_mis_reservas'} label="Mis reservas" onClick={() => actions.navigate('portal_mis_reservas')} />
        <PortalNav active={active === 'portal_perfil'} label="Mi perfil" onClick={() => actions.navigate('portal_perfil')} />
      </nav>
      <HinchaAssistant />
    </div>
  );
}

function Login() {
  const { actions } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const ingresar = () => {
    if (!email.trim() || !password.trim()) {
      actions.mostrarToast('Ingresá tu email y contraseña');
      return;
    }
    actions.iniciarSesionPortal();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%', padding: '20px 4px' }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div style={{ display: 'grid', placeItems: 'center', margin: '0 auto 16px', filter: 'drop-shadow(0 8px 14px rgba(23,42,84,.3))' }}>
          <ClubEscudo size={64} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#16203a', letterSpacing: '-.02em' }}>Club Atlético Modelo</div>
        <div style={{ fontSize: 13.5, color: '#6b7488', marginTop: 4 }}>Ingresá para ver tu portal</div>
      </div>

      <label style={fieldLabelStyle}>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && ingresar()}
        placeholder="nombre@mail.com"
        style={fieldInputStyle}
      />

      <label style={fieldLabelStyle}>Contraseña</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && ingresar()}
        placeholder="••••••••"
        style={fieldInputStyle}
      />

      <button
        onClick={ingresar}
        style={{
          width: '100%', height: 48, border: 'none', borderRadius: 10, background: 'linear-gradient(155deg, #172a54, #0c1830)',
          color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', marginTop: 6, boxShadow: '0 10px 22px rgba(23,42,84,.25)',
        }}
      >
        Ingresar
      </button>

      <div style={{ fontSize: 12, color: '#9aa2b1', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
        Modo demo: ingresá cualquier email y contraseña para entrar.
      </div>
    </div>
  );
}

const BUFFET_WHATSAPP_NUMERO = '5492235550199';
const DORADO = '#d4af6a';

const ICONO_COLOR: Record<string, { bg: string; stroke: string }> = {
  tienda: { bg: '#e8f0fc', stroke: '#2774b8' },
  buffet: { bg: '#fdf1de', stroke: '#c2790f' },
  entrada: { bg: '#f2e9fb', stroke: '#7c3fc4' },
  novedades: { bg: '#e3f6ef', stroke: '#15916a' },
  contacto: { bg: '#fbe7f0', stroke: '#b23a72' },
};

const CLUB_DIRECCION = 'Av. Colón 3456, Mar del Plata';
const CLUB_TELEFONO = '+54 223 455-0000';
const CLUB_EMAIL = 'info@clubatleticomodelo.com.ar';
const CLUB_INSTAGRAM = '@clubatleticomodelo';
const CLUB_HORARIO_SECRETARIA = 'Lunes a viernes de 9 a 20 hs · Sábados de 9 a 13 hs';
const CLUB_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CLUB_DIRECCION)}`;

const BENEFICIOS_SOCIO: { icon: 'buffet' | 'tienda' | 'entrada' | 'novedades'; texto: string }[] = [
  { icon: 'buffet', texto: 'Descuento en el buffet' },
  { icon: 'tienda', texto: 'Descuento en la tienda del club' },
  { icon: 'entrada', texto: 'Entrada gratis o con descuento a los partidos' },
  { icon: 'novedades', texto: 'Acceso a novedades y sorteos exclusivos para socios' },
];

function FilterPills<T extends string | number>({ options, active, onChange, renderLabel }: {
  options: readonly T[];
  active: T;
  onChange: (v: T) => void;
  renderLabel?: (v: T) => ReactNode;
}) {
  return (
    <div className="portal-pills">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`portal-pill${opt === active ? ' active' : ''}`}
          onClick={() => onChange(opt)}
        >
          {renderLabel ? renderLabel(opt) : opt}
        </button>
      ))}
    </div>
  );
}

function partidosDelEquipo(datos: SportsCalendarData, equipoId: number) {
  return datos.eventos.filter((e) => e.tipo === 'Partido' && e.equipoId === equipoId);
}

function proximosPartidos(datos: SportsCalendarData, equipoId: number) {
  return partidosDelEquipo(datos, equipoId)
    .filter((p) => p.estado !== 'finalizado')
    .sort((a, b) => `${a.fecha}${a.horaInicio || ''}`.localeCompare(`${b.fecha}${b.horaInicio || ''}`));
}

function resultadosPartidos(datos: SportsCalendarData, equipoId: number) {
  return partidosDelEquipo(datos, equipoId)
    .filter((p) => p.estado === 'finalizado')
    .sort((a, b) => `${b.fecha}${b.horaInicio || ''}`.localeCompare(`${a.fecha}${a.horaInicio || ''}`));
}

function Inicio({ reservation, news }: { reservation: { canchaId: number; dia: string; hora: string; nombre: string } | undefined; news: Comunicado[] }) {
  const { state, actions } = useApp();
  const cancha = state.canchas.find((c) => c.id === reservation?.canchaId);
  const esSocio = state.portalRol === 'socio';
  const socio = state.socios[0];
  const primerNombre = socio.nombre;
  const [datosCalendario, setDatosCalendario] = useState<SportsCalendarData | null>(null);
  useEffect(() => { setDatosCalendario(readSportsCalendarData()); }, []);
  const proximoPorEquipo = datosCalendario
    ? state.equiposDeportivos
        .map((eq) => ({ equipo: eq, partido: proximosPartidos(datosCalendario, eq.id)[0] }))
        .filter((item) => item.partido)
        .sort((a, b) => `${a.partido!.fecha}${a.partido!.horaInicio || ''}`.localeCompare(`${b.partido!.fecha}${b.partido!.horaInicio || ''}`))
    : [];
  const proximo = proximoPorEquipo[0];
  const [showContacto, setShowContacto] = useState(false);

  const estado = esSocio ? estadoMeta[socio.estado] : null;
  const iniciales = `${socio.nombre[0] ?? ''}${socio.apellido[0] ?? ''}`.toUpperCase();

  return <>
    <div className="portal-hero">
      <div className="portal-hero-top">
        <div className="portal-hero-who">
          <div className="portal-hero-avatar">
            {esSocio && socio.fotoPerfil ? <img src={socio.fotoPerfil} alt="" /> : esSocio ? iniciales : 'CAM'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="portal-hero-greeting">{esSocio ? `Hola, ${primerNombre}` : 'Tu club, cerca tuyo'}</div>
            <div className="portal-hero-sub">{esSocio ? `Socio #${socio.numero} · Club Atlético Modelo` : 'Sumate y accedé a beneficios exclusivos'}</div>
          </div>
        </div>
        {estado && <span className="portal-hero-chip" style={{ background: estado.bg, color: estado.color }}>{estado.label}</span>}
      </div>
      {!esSocio && (
        <button
          onClick={() => actions.navigate('portal_hacete_socio')}
          style={{ marginTop: 16, height: 42, padding: '0 18px', border: 'none', borderRadius: 9, background: DORADO, color: '#0c1830', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
        >
          Hacete socio
        </button>
      )}
    </div>

    <div className="portal-stats">
      <button className="portal-stat" onClick={() => actions.navigate('portal_mis_reservas')}>
        <div className="portal-stat-icon" style={{ background: ICONO_COLOR.tienda.bg }}>
          <CanchaIcon nombre={cancha?.nombre ?? ''} stroke={ICONO_COLOR.tienda.stroke} />
        </div>
        <span>Próxima reserva</span>
        <strong>{reservation ? `${reservation.dia} · ${reservation.hora}` : 'Sin reservas'}</strong>
        <small>{reservation ? cancha?.nombre : 'Reservá un espacio'}</small>
      </button>
      <button className="portal-stat" onClick={() => actions.navigate('portal_partidos')}>
        <div className="portal-stat-icon" style={{ background: ICONO_COLOR.novedades.bg }}>
          <TrofeoIcon stroke={ICONO_COLOR.novedades.stroke} />
        </div>
        <span>Próximo partido</span>
        <strong>{proximo ? `${proximo.equipo.nombre} vs. ${proximo.partido!.rival || 'rival a confirmar'}` : 'Sin partidos'}</strong>
        <small>{proximo ? `${formatFechaCorta(proximo.partido!.fecha)}${proximo.partido!.horaInicio ? ` · ${proximo.partido!.horaInicio}` : ''}` : 'Todavía no hay fecha'}</small>
      </button>
    </div>

    <SectionTitle title="Novedades" action="Ver más" onClick={() => actions.navigate('portal_novedades')} />
    {news.length === 0 ? (
      <section className="portal-card">
        <strong>No hay novedades por el momento</strong>
        <p>Información del club para {esSocio ? 'socios' : 'hinchas'}.</p>
      </section>
    ) : (
      news.map((item) => (
        <section key={item.id} className="portal-card">
          <strong style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {!state.comunicadosLeidos.includes(item.id) && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2774b8', flexShrink: 0 }} />}
            {item.titulo}
          </strong>
          {item.imagen && <NovedadImagen src={item.imagen} alt={item.titulo} style={{ margin: '6px 0' }} />}
          {!item.imagen && <p>{item.cuerpo}</p>}
        </section>
      ))
    )}

    <strong className="portal-label">Servicios</strong>
    <div className="portal-services-grid">
      <button
        onClick={() => actions.navigate('portal_tienda')}
        className="portal-card portal-menu-card portal-service-tile"
      >
        <div className="portal-service-tile-icon" style={{ background: ICONO_COLOR.tienda.bg }}>
          <BeneficioIcon tipo="tienda" />
        </div>
        <span>Tienda del club</span>
      </button>
      <button
        onClick={() => window.open(`https://wa.me/${BUFFET_WHATSAPP_NUMERO}?text=${encodeURIComponent('Hola! Quería consultar el menú del buffet.')}`, '_blank')}
        className="portal-card portal-menu-card portal-service-tile"
      >
        <div className="portal-service-tile-icon" style={{ background: ICONO_COLOR.buffet.bg }}>
          <BeneficioIcon tipo="buffet" />
        </div>
        <span>Buffet</span>
      </button>
      <button
        onClick={() => setShowContacto(true)}
        className="portal-card portal-menu-card portal-service-tile"
      >
        <div className="portal-service-tile-icon" style={{ background: ICONO_COLOR.contacto.bg }}>
          <ContactoIcon />
        </div>
        <span>Contacto</span>
      </button>
    </div>

    <SponsorsPortal />

    {showContacto && <ContactoClubModal onClose={() => setShowContacto(false)} />}
  </>;
}

function SponsorsPortal() {
  const { state } = useApp();
  const sponsors = state.sponsors.filter((s) => s.ubicacion === 'Portal del Hincha' && estadoSponsor(s, HOY_ISO) !== 'Vencido');
  if (sponsors.length === 0) return null;

  return <>
    <strong className="portal-label">Sponsors</strong>
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 8, WebkitOverflowScrolling: 'touch' }}>
      {sponsors.map((s) => (
        <div
          key={s.id}
          className="portal-card"
          style={{ minWidth: 148, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8, padding: '16px 14px', position: 'relative' }}
        >
          <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, fontWeight: 700, color: '#8b93a5', letterSpacing: '.04em' }}>PUBLICIDAD</span>
          {s.logo ? (
            <img src={s.logo} alt={s.nombre} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eaeefb', color: '#2774b8', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 16 }}>
              {s.nombre[0]?.toUpperCase()}
            </div>
          )}
          <div style={{ fontSize: 13, fontWeight: 700, color: '#16203a', lineHeight: 1.2 }}>{s.nombre}</div>
          <div style={{ fontSize: 11.5, color: '#8b93a5' }}>{s.rubro}</div>
        </div>
      ))}
    </div>
  </>;
}

const FILTROS_TORNEO = ['Todos', 'Próximo', 'En curso', 'Finalizado'] as const;
type FiltroTorneo = (typeof FILTROS_TORNEO)[number];
const ORDEN_ESTADO_TORNEO: Record<string, number> = { 'En curso': 0, 'Próximo': 1, 'Finalizado': 2 };

function PortalTorneos() {
  const { state, actions } = useApp();
  const [expandidoId, setExpandidoId] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<FiltroTorneo>('Todos');
  const [inscribiendoTorneoId, setInscribiendoTorneoId] = useState<number | null>(null);

  const torneosFiltrados = useMemo(
    () => state.torneos
      .filter((t) => filtro === 'Todos' || estadoTorneo(t, HOY_ISO) === filtro)
      .sort((a, b) => ORDEN_ESTADO_TORNEO[estadoTorneo(a, HOY_ISO)] - ORDEN_ESTADO_TORNEO[estadoTorneo(b, HOY_ISO)]),
    [state.torneos, filtro]
  );

  const torneoInscribiendo = state.torneos.find((t) => t.id === inscribiendoTorneoId);
  const enCurso = state.torneos.filter((t) => estadoTorneo(t, HOY_ISO) === 'En curso').length;
  const proximos = state.torneos.filter((t) => estadoTorneo(t, HOY_ISO) === 'Próximo').length;

  return <>
    <h1>Torneos</h1>
    <p className="portal-page-sub">
      {state.torneos.length === 0 ? 'El club todavía no organizó torneos.' : `${enCurso} en curso · ${proximos} próximos a arrancar`}
    </p>

    <FilterPills
      options={FILTROS_TORNEO}
      active={filtro}
      onChange={setFiltro}
      renderLabel={(f) => (f === 'Todos' ? 'Todos' : f === 'Próximo' ? 'Próximos' : f === 'En curso' ? 'En curso' : 'Finalizados')}
    />

    {torneosFiltrados.length === 0 && (
      <section className="portal-card"><p>No hay torneos {filtro === 'Todos' ? 'organizados' : `en estado "${filtro}"`}.</p></section>
    )}

    {torneosFiltrados.map((t) => {
      const estado = estadoTorneo(t, HOY_ISO);
      const meta = estadoTorneoMeta[estado];
      const abierto = expandidoId === t.id;
      const equipos = state.equiposTorneo.filter((eq) => eq.torneoId === t.id);
      const partidos = state.partidosTorneo.filter((p) => p.torneoId === t.id);
      const tabla = tablaPosiciones(t.id, state.equiposTorneo, state.partidosTorneo);
      const nombreEquipo = (id: number) => equipos.find((eq) => eq.id === id)?.nombre ?? '—';
      const inscripcion = state.inscripcionesTorneo.find((i) => i.torneoId === t.id);

      return (
        <section
          key={t.id}
          className="portal-card portal-menu-card"
          onClick={() => setExpandidoId(abierto ? null : t.id)}
          style={{ cursor: 'pointer', borderLeft: `4px solid ${meta.color}` }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <strong style={{ margin: 0 }}>{t.nombre}</strong>
            <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: meta.bg, color: meta.color }}>{estado}</span>
          </div>
          <p style={{ margin: '6px 0 0' }}>{t.deporte} · {formatFechaCorta(t.fechaInicio)} al {formatFechaCorta(t.fechaFin)}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            <span className="portal-meta-chip">📍 {t.lugar}</span>
            <span className="portal-meta-chip">Cupo {t.cupo}</span>
            <span className="portal-meta-chip">Inscripción {formatMoney(t.valorInscripcion)}</span>
          </div>
          {t.descripcion && <p style={{ marginTop: 8, color: '#8b93a5' }}>{t.descripcion}</p>}
          {t.premio && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 4,
              background: '#fdf3d9', border: '1px solid #f0dfa3', borderRadius: 10, padding: '8px 12px',
            }}>
              <TrofeoIcon />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#8a6d1a' }}>{t.premio}</span>
            </div>
          )}
          {inscripcion && <p>Anotado como <strong>{inscripcion.nombreEquipo}</strong></p>}

          {estado === 'Próximo' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (inscripcion) actions.cancelarInscripcionTorneo(t.id);
                else setInscribiendoTorneoId(t.id);
              }}
              style={{
                marginTop: 8, height: 38, padding: '0 16px', borderRadius: 8, border: inscripcion ? '1px solid #d7dce6' : 'none',
                background: inscripcion ? '#fff' : '#172a54', color: inscripcion ? '#16203a' : '#fff',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {inscripcion ? '✓ Anotado — cancelar' : 'Anotarme'}
            </button>
          )}

          {abierto && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f1f5' }} onClick={(e) => e.stopPropagation()}>
              <strong style={{ display: 'block', fontSize: 13, color: '#16203a', marginBottom: 6 }}>Equipos</strong>
              {equipos.length === 0 ? (
                <p style={{ margin: '0 0 12px' }}>Todavía no hay equipos anotados.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {equipos.map((eq) => (
                    <span key={eq.id} style={{ fontSize: 12.5, fontWeight: 600, color: '#16203a', background: '#f5f7fb', borderRadius: 20, padding: '5px 12px' }}>{eq.nombre}</span>
                  ))}
                </div>
              )}

              {partidos.length > 0 && (
                <>
                  <strong style={{ display: 'block', fontSize: 13, color: '#16203a', marginBottom: 6 }}>Partidos</strong>
                  <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
                    {partidos.map((p) => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#16203a' }}>
                        <span>{nombreEquipo(p.equipoLocalId)} vs {nombreEquipo(p.equipoVisitanteId)}</span>
                        <strong>{p.golesLocal !== null && p.golesVisitante !== null ? `${p.golesLocal} - ${p.golesVisitante}` : 'Sin jugar'}</strong>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tabla.length > 0 && (
                <>
                  <strong style={{ display: 'block', fontSize: 13, color: '#16203a', marginBottom: 6 }}>Tabla de posiciones</strong>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ color: '#8b93a5', textAlign: 'left' }}>
                          <th style={{ padding: '4px 6px' }}>Equipo</th>
                          <th style={{ padding: '4px 6px' }}>PJ</th>
                          <th style={{ padding: '4px 6px' }}>V</th>
                          <th style={{ padding: '4px 6px' }}>E</th>
                          <th style={{ padding: '4px 6px' }}>D</th>
                          <th style={{ padding: '4px 6px' }}>DG</th>
                          <th style={{ padding: '4px 6px' }}>Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabla.map((fila) => (
                          <tr key={fila.equipoId} style={{ borderTop: '1px solid #f0f1f5', color: '#16203a', fontWeight: 600 }}>
                            <td style={{ padding: '4px 6px' }}>{fila.nombre}</td>
                            <td style={{ padding: '4px 6px' }}>{fila.pj}</td>
                            <td style={{ padding: '4px 6px' }}>{fila.g}</td>
                            <td style={{ padding: '4px 6px' }}>{fila.e}</td>
                            <td style={{ padding: '4px 6px' }}>{fila.p}</td>
                            <td style={{ padding: '4px 6px' }}>{fila.dg}</td>
                            <td style={{ padding: '4px 6px' }}>{fila.pts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      );
    })}

    {torneoInscribiendo && (
      <InscripcionTorneoModal
        torneo={torneoInscribiendo}
        onClose={() => setInscribiendoTorneoId(null)}
      />
    )}
  </>;
}

function InscripcionTorneoModal({ torneo, onClose }: { torneo: Torneo; onClose: () => void }) {
  const { actions } = useApp();
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [integrantes, setIntegrantes] = useState('');
  const [medioPago, setMedioPago] = useState<MedioPago>('Efectivo');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [titularTarjeta, setTitularTarjeta] = useState('');
  const [vencimientoTarjeta, setVencimientoTarjeta] = useState('');
  const [cvvTarjeta, setCvvTarjeta] = useState('');

  const confirmar = () => {
    if (!nombreEquipo.trim() || !integrantes.trim()) {
      actions.mostrarToast('Completá el nombre del equipo y los integrantes');
      return;
    }
    if (medioPago === 'Tarjeta' && !tarjetaCompleta({ numeroTarjeta, setNumeroTarjeta, titularTarjeta, setTitularTarjeta, vencimientoTarjeta, setVencimientoTarjeta, cvvTarjeta, setCvvTarjeta })) {
      actions.mostrarToast('Completá los datos de la tarjeta');
      return;
    }
    actions.inscribirseTorneo({
      torneoId: torneo.id,
      nombreEquipo: nombreEquipo.trim(),
      integrantes: integrantes.trim(),
      monto: torneo.valorInscripcion,
      medioPago,
    });
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose} maxWidth={380} ariaLabel={`Anotarme a ${torneo.nombre}`} cardStyle={{ maxHeight: '82vh', overflowY: 'auto' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 4 }}>Anotarme a {torneo.nombre}</div>
      <div style={{ fontSize: 13.5, color: '#6b7488', marginBottom: 18 }}>{torneo.deporte} · Inscripción: {formatMoney(torneo.valorInscripcion)}</div>

      <label style={fieldLabelStyle}>Nombre del equipo</label>
      <input type="text" value={nombreEquipo} onChange={(e) => setNombreEquipo(e.target.value)} placeholder="Ej: Los Halcones" style={fieldInputStyle} />

      <label style={fieldLabelStyle}>Integrantes</label>
      <textarea
        value={integrantes}
        onChange={(e) => setIntegrantes(e.target.value)}
        placeholder="Nombre y apellido de cada integrante, uno por línea"
        rows={4}
        style={{ ...fieldInputStyle, height: 'auto', padding: '10px 14px', resize: 'vertical' }}
      />

      <label style={fieldLabelStyle}>Método de pago de la inscripción</label>
      <select value={medioPago} onChange={(e) => setMedioPago(e.target.value as MedioPago)} style={fieldInputStyle}>
        <option value="Efectivo">Efectivo</option>
        <option value="Transferencia">Transferencia</option>
        <option value="MercadoPago">Mercado Pago</option>
        <option value="Tarjeta">Tarjeta de crédito/débito</option>
      </select>

      <MedioPagoFields
        medioPago={medioPago}
        tarjeta={{ numeroTarjeta, setNumeroTarjeta, titularTarjeta, setTitularTarjeta, vencimientoTarjeta, setVencimientoTarjeta, cvvTarjeta, setCvvTarjeta }}
      />

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onClose}
          style={{ flex: 1, height: 46, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          onClick={confirmar}
          style={{ flex: 1, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          Confirmar inscripción
        </button>
      </div>
    </ModalOverlay>
  );
}

const FILTROS_PARTIDO = ['Próximos', 'Resultados'] as const;
type FiltroPartido = (typeof FILTROS_PARTIDO)[number];
const RESULTADO_META: Record<'win' | 'draw' | 'loss', { label: string; bg: string; color: string }> = {
  win: { label: 'Victoria', bg: '#e5f6ea', color: '#1a7d43' },
  draw: { label: 'Empate', bg: '#eaeefb', color: '#1b3a8a' },
  loss: { label: 'Derrota', bg: '#f3e9ea', color: '#a34a55' },
};
const ESTADO_PARTIDO_LABEL: Record<string, string> = {
  suspendido: 'Suspendido',
  postergado: 'Postergado',
};

function PortalPartidos() {
  const { state } = useApp();
  const [filtro, setFiltro] = useState<FiltroPartido>('Próximos');
  const disciplinas = useMemo(
    () => Array.from(new Set(state.equiposDeportivos.map((eq) => eq.disciplina))),
    [state.equiposDeportivos]
  );
  const [disciplina, setDisciplina] = useState<string | undefined>(disciplinas[0]);
  const equiposDisciplina = state.equiposDeportivos.filter((eq) => eq.disciplina === disciplina);
  const [equipoId, setEquipoId] = useState<number | undefined>(equiposDisciplina[0]?.id);
  const [datos, setDatos] = useState<SportsCalendarData | null>(null);
  useEffect(() => { setDatos(readSportsCalendarData()); }, []);

  const elegirDisciplina = (d: string) => {
    setDisciplina(d);
    const primerEquipo = state.equiposDeportivos.find((eq) => eq.disciplina === d);
    setEquipoId(primerEquipo?.id);
  };

  const equipo = equiposDisciplina.find((eq) => eq.id === equipoId) ?? equiposDisciplina[0];
  const partidos = equipo && datos
    ? (filtro === 'Próximos' ? proximosPartidos(datos, equipo.id) : resultadosPartidos(datos, equipo.id))
    : [];

  return <>
    <h1>Partidos</h1>
    <p className="portal-page-sub">{equipo ? equipo.nombre : 'Seguí a los equipos del club'}</p>

    {!equipo ? (
      <section className="portal-card"><p>El club todavía no cargó partidos.</p></section>
    ) : (
      <>
        {disciplinas.length > 1 && (
          <FilterPills options={disciplinas} active={disciplina ?? disciplinas[0]} onChange={elegirDisciplina} />
        )}

        {equiposDisciplina.length > 1 && (
          <FilterPills
            options={equiposDisciplina.map((eq) => eq.id)}
            active={equipo.id}
            onChange={setEquipoId}
            renderLabel={(id) => equiposDisciplina.find((eq) => eq.id === id)?.nombre}
          />
        )}

        <FilterPills options={FILTROS_PARTIDO} active={filtro} onChange={setFiltro} />

        {partidos.length === 0 && (
          <section className="portal-card"><p>No hay {filtro === 'Próximos' ? 'partidos programados' : 'resultados cargados'}.</p></section>
        )}

        {partidos.map((p) => {
          const acta = datos?.actas[String(p.id)];
          const resultado = parseFinalizedResult(p, acta);
          const meta = resultado ? RESULTADO_META[resultado.outcome] : null;
          const estadoLabel = p.estado && ESTADO_PARTIDO_LABEL[p.estado];
          return (
            <section key={p.id} className="portal-card" style={{ borderLeft: `4px solid ${meta ? meta.color : estadoLabel ? '#a34a55' : '#c7cedb'}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <strong style={{ margin: 0 }}>{equipo.nombre} {resultado ? `${resultado.club} - ${resultado.rival}` : 'vs.'} {p.rival || 'rival a confirmar'}</strong>
                {meta && <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: meta.bg, color: meta.color }}>{meta.label}</span>}
                {!meta && estadoLabel && <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: '#f3e9ea', color: '#a34a55' }}>{estadoLabel}</span>}
              </div>
              <p>{p.competencia || 'Liga'} · {p.condicion || 'Local'} · {formatFechaCorta(p.fecha)}{p.horaInicio ? ` · ${p.horaInicio}` : ''}</p>
              {p.lugar && <p>{p.lugar}</p>}
              {p.motivo && <p>{p.motivo}</p>}
            </section>
          );
        })}
      </>
    )}
  </>;
}

const fieldLabelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#16203a', marginBottom: 6 } as const;
const fieldInputStyle = { width: '100%', height: 44, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#16203a', marginBottom: 14, background: '#fff', boxSizing: 'border-box' } as const;

interface TarjetaFormState {
  numeroTarjeta: string; setNumeroTarjeta: (v: string) => void;
  titularTarjeta: string; setTitularTarjeta: (v: string) => void;
  vencimientoTarjeta: string; setVencimientoTarjeta: (v: string) => void;
  cvvTarjeta: string; setCvvTarjeta: (v: string) => void;
}

function vencimientoTarjetaVigente(vencimiento: string): boolean {
  const [mes, anio] = vencimiento.split('/').map(Number);
  if (!mes || !anio) return false;
  const anioCompleto = 2000 + anio;
  const [hoyAnio, hoyMes] = HOY_ISO.split('-').map(Number);
  return anioCompleto > hoyAnio || (anioCompleto === hoyAnio && mes >= hoyMes);
}

function tarjetaCompleta(t: TarjetaFormState) {
  const numeroValido = /^\d{13,19}$/.test(t.numeroTarjeta.replace(/\s/g, ''));
  const titularValido = t.titularTarjeta.trim().length > 1;
  const vencimiento = t.vencimientoTarjeta.trim();
  const vencimientoValido = /^(0[1-9]|1[0-2])\/\d{2}$/.test(vencimiento) && vencimientoTarjetaVigente(vencimiento);
  const cvvValido = /^\d{3,4}$/.test(t.cvvTarjeta.trim());
  return numeroValido && titularValido && vencimientoValido && cvvValido;
}

function MedioPagoFields({ medioPago, tarjeta, debitoAutomatico }: {
  medioPago: MedioPago;
  tarjeta: TarjetaFormState;
  debitoAutomatico?: { checked: boolean; onChange: (v: boolean) => void };
}) {
  if (medioPago === 'MercadoPago') {
    return (
      <button
        type="button"
        style={{
          width: '100%', height: 50, marginBottom: 20, border: 'none', borderRadius: 9,
          background: '#009ee3', color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <MercadoPagoIcon />
        Pagar con Mercado Pago
      </button>
    );
  }

  if (medioPago === 'Tarjeta') {
    return (
      <>
        <label style={fieldLabelStyle}>Número de tarjeta</label>
        <input
          type="text"
          inputMode="numeric"
          value={tarjeta.numeroTarjeta}
          onChange={(e) => tarjeta.setNumeroTarjeta(e.target.value)}
          placeholder="1234 5678 9012 3456"
          style={fieldInputStyle}
        />

        <label style={fieldLabelStyle}>Titular de la tarjeta</label>
        <input
          type="text"
          value={tarjeta.titularTarjeta}
          onChange={(e) => tarjeta.setTitularTarjeta(e.target.value)}
          placeholder="Como figura en la tarjeta"
          style={fieldInputStyle}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={fieldLabelStyle}>Vencimiento</label>
            <input
              type="text"
              value={tarjeta.vencimientoTarjeta}
              onChange={(e) => tarjeta.setVencimientoTarjeta(e.target.value)}
              placeholder="MM/AA"
              style={fieldInputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={fieldLabelStyle}>CVV</label>
            <input
              type="text"
              inputMode="numeric"
              value={tarjeta.cvvTarjeta}
              onChange={(e) => tarjeta.setCvvTarjeta(e.target.value)}
              placeholder="123"
              style={fieldInputStyle}
            />
          </div>
        </div>

        {debitoAutomatico && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#16203a', marginBottom: 20, cursor: 'pointer' }}>
            <input type="checkbox" checked={debitoAutomatico.checked} onChange={(e) => debitoAutomatico.onChange(e.target.checked)} />
            Adherir a débito automático para el pago de la cuota
          </label>
        )}
      </>
    );
  }

  if (medioPago === 'Transferencia') {
    return (
      <div style={{ background: '#f5f7fb', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#16203a', lineHeight: 1.6 }}>
        <strong style={{ display: 'block', marginBottom: 6 }}>Datos para transferir</strong>
        <div>CBU: 0000003100000000123456</div>
        <div>Alias: CLUB.MODELO.CUOTA</div>
        <div>Titular: Club Atlético Modelo</div>
        <div style={{ marginTop: 8, color: '#6b7488' }}>
          Una vez realizada la transferencia, enviá el comprobante a <strong>cuotas@clubmodelo.com.ar</strong> para acreditar el pago.
        </div>
      </div>
    );
  }

  return null;
}

function HaceteSocio() {
  const { state, actions } = useApp();
  const firstSocio = state.socios[0];
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState(firstSocio.nombre);
  const [apellido, setApellido] = useState(firstSocio.apellido);
  const [dni, setDni] = useState(firstSocio.dni ?? '');
  const [fechaNacimiento, setFechaNacimiento] = useState(firstSocio.fechaNacimiento ?? '');
  const [domicilio, setDomicilio] = useState(firstSocio.domicilio ?? '');
  const [telefono, setTelefono] = useState(firstSocio.telefono);
  const [email, setEmail] = useState(firstSocio.email ?? '');
  const [medioPago, setMedioPago] = useState<MedioPago>('Efectivo');
  const [debitoAutomatico, setDebitoAutomatico] = useState(false);
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [titularTarjeta, setTitularTarjeta] = useState('');
  const [vencimientoTarjeta, setVencimientoTarjeta] = useState('');
  const [cvvTarjeta, setCvvTarjeta] = useState('');

  const confirmar = () => {
    if (!nombre.trim() || !apellido.trim() || !dni.trim() || !domicilio.trim() || !telefono.trim()) {
      actions.mostrarToast('Completá nombre, apellido, DNI, domicilio y teléfono');
      return;
    }
    if (medioPago === 'Tarjeta' && !tarjetaCompleta({ numeroTarjeta, setNumeroTarjeta, titularTarjeta, setTitularTarjeta, vencimientoTarjeta, setVencimientoTarjeta, cvvTarjeta, setCvvTarjeta })) {
      actions.mostrarToast('Completá los datos de la tarjeta');
      return;
    }
    actions.confirmarAsociacion({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      fechaNacimiento,
      domicilio: domicilio.trim(),
      telefono: telefono.trim(),
      email: email.trim(),
      medioPago,
      debitoAutomatico: medioPago === 'Tarjeta' ? debitoAutomatico : false,
    });
    setShowForm(false);
  };

  return <>
    <h1>Hacete socio</h1>
    <section className="portal-card portal-card-primary">
      <div>Club Atlético Modelo</div>
      <strong>Formá parte del club y disfrutá todos los beneficios</strong>
    </section>
    <strong className="portal-label">Beneficios de ser socio</strong>
    <div style={{ display: 'grid', gap: 10 }}>
      {BENEFICIOS_SOCIO.map((beneficio) => (
        <section key={beneficio.texto} className="portal-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: ICONO_COLOR[beneficio.icon].bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <BeneficioIcon tipo={beneficio.icon} />
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#16203a', lineHeight: 1.35 }}>{beneficio.texto}</div>
        </section>
      ))}
    </div>
    <button
      onClick={() => setShowForm(true)}
      style={{ width: '100%', marginTop: 16, height: 48, border: 'none', borderRadius: 10, background: '#25D366', color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}
    >
      Quiero hacerme socio
    </button>

    {showForm && (
      <ModalOverlay
        onClose={() => setShowForm(false)}
        maxWidth={380}
        ariaLabel="Completá tus datos para asociarte"
        cardStyle={{ maxHeight: '82vh', overflowY: 'auto' }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 4 }}>Completá tus datos</div>
        <div style={{ fontSize: 13.5, color: '#6b7488', marginBottom: 18 }}>Datos personales para asociarte al club</div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={fieldLabelStyle}>Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} style={fieldInputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={fieldLabelStyle}>Apellido</label>
            <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} style={fieldInputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={fieldLabelStyle}>DNI</label>
            <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} placeholder="30123456" style={fieldInputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={fieldLabelStyle}>Fecha de nacimiento</label>
            <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} style={fieldInputStyle} />
          </div>
        </div>

        <label style={fieldLabelStyle}>Domicilio</label>
        <input type="text" value={domicilio} onChange={(e) => setDomicilio(e.target.value)} placeholder="Calle 123, Mar del Plata" style={fieldInputStyle} />

        <label style={fieldLabelStyle}>Teléfono de contacto</label>
        <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+54 9 ..." style={fieldInputStyle} />

        <label style={fieldLabelStyle}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@mail.com" style={fieldInputStyle} />

        <label style={fieldLabelStyle}>Método de pago de la cuota</label>
        <select value={medioPago} onChange={(e) => setMedioPago(e.target.value as MedioPago)} style={fieldInputStyle}>
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="MercadoPago">Mercado Pago</option>
          <option value="Tarjeta">Tarjeta de crédito/débito</option>
        </select>

        <MedioPagoFields
          medioPago={medioPago}
          tarjeta={{ numeroTarjeta, setNumeroTarjeta, titularTarjeta, setTitularTarjeta, vencimientoTarjeta, setVencimientoTarjeta, cvvTarjeta, setCvvTarjeta }}
          debitoAutomatico={medioPago === 'Tarjeta' ? { checked: debitoAutomatico, onChange: setDebitoAutomatico } : undefined}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowForm(false)}
            style={{ flex: 1, height: 46, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            style={{ flex: 1, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Confirmar asociación
          </button>
        </div>
      </ModalOverlay>
    )}
  </>;
}

function TrofeoIcon({ stroke = '#8a6d1a' }: { stroke?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" /><path d="M8 5H5a2 2 0 0 0 2 4M16 5h3a2 2 0 0 1-2 4" /><path d="M12 12v4M9 20h6M10 16h4v4h-4z" />
    </svg>
  );
}

function MercadoPagoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12c0-4.5 4-8 9-8s9 3.5 9 8-4 8-9 8c-1.6 0-3.1-.3-4.4-1L3 21l1-4.7C3.4 15 3 13.6 3 12Z" />
    </svg>
  );
}


function BeneficioIcon({ tipo }: { tipo: 'buffet' | 'tienda' | 'entrada' | 'novedades' }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: ICONO_COLOR[tipo].stroke, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (tipo === 'buffet') return <svg {...common}><path d="M7 3v7a2 2 0 0 0 4 0V3M9 10v11M17 3c-1.5 1.5-2 3-2 5s.5 3 2 4v9" /></svg>;
  if (tipo === 'tienda') return <svg {...common}><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" /><path d="M4 8h16l-1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 8Z" /></svg>;
  if (tipo === 'entrada') return <svg {...common}><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V9Z" /><path d="M10 8v8" strokeDasharray="2 2" /></svg>;
  return <svg {...common}><path d="M18 8a6 6 0 1 0-12 0c0 3.5-1 5-2 6h16c-1-1-2-2.5-2-6" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>;
}

function Cuota() {
  const { state, actions } = useApp();
  const socio = state.socios[0];
  const historial = useMemo(() => historialPagosSocio(socio, state.categorias), [socio, state.categorias]);
  const [contribuyendo, setContribuyendo] = useState(false);
  const [montoContribucion, setMontoContribucion] = useState('');
  const [medioContribucion, setMedioContribucion] = useState<MedioPago>('Efectivo');

  const confirmarContribucion = () => {
    const monto = Number(montoContribucion);
    if (!monto || monto <= 0) { actions.mostrarToast('Ingresá un monto válido'); return; }
    actions.mostrarToast(`¡Gracias por tu contribución de ${formatMoney(monto)}!`);
    setContribuyendo(false);
    setMontoContribucion('');
    setMedioContribucion('Efectivo');
  };

  if (state.portalRol === 'hincha') {
    return <>
      <h1>Mi cuota</h1>
      <section className="portal-card portal-card-primary">
        <div>Todavía no sos socio</div>
        <strong>No tenés una cuota asociada</strong>
        <button onClick={() => actions.navigate('portal_hacete_socio')}>Asociate</button>
      </section>
      <section className="portal-card">
        <strong>¿Por qué asociarte?</strong>
        <p>Al ser socio pagás una cuota mensual y accedés a descuentos, prioridad para reservar canchas y beneficios exclusivos del club.</p>
      </section>
    </>;
  }

  const { deuda, estado, ultimoPago, debitoAutomatico, medioPago } = socio;
  return <>
    <h1>Mi cuota</h1>
    <section className="portal-card portal-card-primary">
      <div>{estado === 'al_dia' ? 'Cuota al día' : 'Cuota pendiente'}</div>
      <strong>{deuda > 0 ? formatMoney(deuda) : 'Sin deuda'}</strong>
      <p>
        {estado === 'moroso'
          ? `Venció el ${formatFechaCorta(ultimoVencimientoCuotaVencido(HOY_ISO))}`
          : deuda > 0
          ? `Vence el ${formatFechaCorta(proximoVencimientoCuota(HOY_ISO))}`
          : `Último pago: ${ultimoPago}`}
      </p>
    </section>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
      <section className="portal-card" style={{ marginBottom: 0, padding: '12px 14px' }}>
        <strong style={{ fontSize: 14, margin: '2px 0' }}>Método de pago</strong>
        <p style={{ fontSize: 12.5, margin: '4px 0 0' }}>{medioPagoLabel(medioPago)}</p>
      </section>
      <section className="portal-card" style={{ marginBottom: 0, padding: '12px 14px' }}>
        <strong style={{ fontSize: 14, margin: '2px 0' }}>Débito automático</strong>
        <p style={{ fontSize: 12.5, margin: '4px 0 0' }}>
          {medioPago !== 'Tarjeta'
            ? 'Disponible solo con tarjeta de crédito o débito.'
            : debitoAutomatico ? 'Activo para el cobro de la cuota mensual.' : 'No activado. Pedilo en la administración del club.'}
        </p>
      </section>
    </div>

    <section className="portal-card">
      <strong>¿Querés ayudar más al club?</strong>
      <p>Hacé una contribución voluntaria, además de tu cuota, con el medio de pago que prefieras.</p>
      <button onClick={() => setContribuyendo(true)}>Hacer una contribución</button>
    </section>

    {contribuyendo && (
      <ModalOverlay onClose={() => setContribuyendo(false)} maxWidth={380} ariaLabel="Hacer una contribución al club">
        <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 4 }}>Hacer una contribución</div>
        <div style={{ fontSize: 13.5, color: '#6b7488', marginBottom: 18 }}>Un aporte extra para ayudar al club, además de tu cuota.</div>

        <label style={fieldLabelStyle}>Monto</label>
        <input
          type="number"
          min={1}
          value={montoContribucion}
          onChange={(e) => setMontoContribucion(e.target.value)}
          placeholder="Ej: 5000"
          style={fieldInputStyle}
        />

        <label style={fieldLabelStyle}>Método de pago</label>
        <select value={medioContribucion} onChange={(e) => setMedioContribucion(e.target.value as MedioPago)} style={fieldInputStyle}>
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="MercadoPago">Mercado Pago</option>
          <option value="Tarjeta">Tarjeta de crédito/débito</option>
        </select>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setContribuyendo(false)}
            style={{ flex: 1, height: 46, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={confirmarContribucion}
            style={{ flex: 1, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Confirmar
          </button>
        </div>
      </ModalOverlay>
    )}

    <strong className="portal-label">Historial de pagos</strong>
    <section className="portal-card" style={{ padding: 0, overflow: 'hidden' }}>
      {historial.length === 0 ? (
        <p style={{ padding: '14px 16px' }}>Todavía no registrás pagos de cuota.</p>
      ) : (
        historial.map((pago, i) => (
          <div
            key={pago.fecha}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 16px', borderBottom: i < historial.length - 1 ? '1px solid #f0f1f5' : 'none' }}
          >
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#16203a' }}>Cuota {pago.fecha}</div>
              <div style={{ fontSize: 12, color: '#8b93a5', marginTop: 2 }}>{medioPagoLabel(pago.medioPago)}</div>
            </div>
            <strong style={{ fontSize: 14, color: '#16203a' }}>{formatMoney(pago.monto)}</strong>
          </div>
        ))
      )}
    </section>
  </>;
}
function Reservas() {
  const { state, actions } = useApp();
  const memberName = `${state.socios[0].nombre} ${state.socios[0].apellido}`;
  const deportes = useMemo(() => Array.from(new Set(state.canchas.map((c) => c.nombre))), [state.canchas]);
  const [deporte, setDeporte] = useState(deportes[0]);
  const canchasDeporte = useMemo(() => state.canchas.filter((c) => c.nombre === deporte), [state.canchas, deporte]);
  const [canchaId, setCanchaId] = useState<number | undefined>(canchasDeporte[0]?.id);
  const [dia, setDia] = useState(HOY_ISO);
  const [reservandoHora, setReservandoHora] = useState<string | null>(null);
  const [medioPago, setMedioPago] = useState<MedioPago>('Efectivo');

  const cancha = state.canchas.find((c) => c.id === canchaId);

  const turnos = useMemo(
    () => TURNO_HORAS.map((hora) => ({
      hora,
      reserva: state.reservas.find((r) => r.canchaId === canchaId && r.dia === dia && r.hora === hora) || null,
    })),
    [state.reservas, canchaId, dia]
  );

  const elegirDeporte = (d: string) => {
    setDeporte(d);
    const primeraCancha = state.canchas.find((c) => c.nombre === d);
    setCanchaId(primeraCancha?.id);
    setReservandoHora(null);
  };

  const abrirPopup = (hora: string) => {
    setMedioPago('Efectivo');
    setReservandoHora(hora);
  };

  const confirmarReserva = () => {
    if (!reservandoHora || !canchaId) return;
    actions.reservarTurnoHincha(canchaId, dia, reservandoHora, medioPago);
    setReservandoHora(null);
  };

  return <>
    <h1>Reservas</h1>
    <p className="portal-page-sub">{cancha ? `${cancha.nombre} #${cancha.numero} · ${formatMoney(cancha.precio)} el turno` : 'Elegí deporte, cancha y horario'}</p>

    <strong className="portal-label-tight">Elegí un deporte</strong>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
      {deportes.map((d) => {
        const active = deporte === d;
        return (
          <button key={d} onClick={() => elegirDeporte(d)} className={`portal-choice${active ? ' active' : ''}`}>
            <CanchaIcon nombre={d} stroke={active ? '#fff' : '#2774b8'} />
            {d}
          </button>
        );
      })}
    </div>

    <strong className="portal-label-tight">Elegí la cancha</strong>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
      {canchasDeporte.map((c) => {
        const active = canchaId === c.id;
        return (
          <button key={c.id} onClick={() => { setCanchaId(c.id); setReservandoHora(null); }} className={`portal-choice${active ? ' active' : ''}`}>
            Cancha {c.numero}
          </button>
        );
      })}
    </div>

    <input
      type="date"
      value={dia}
      min={HOY_ISO}
      onChange={(e) => { setDia(e.target.value); setReservandoHora(null); }}
      style={{ width: '100%', height: 44, padding: '0 12px', border: '1px solid #e3e7ef', borderRadius: 9, fontSize: 14, color: '#16203a', background: '#fff', marginBottom: 12 }}
    />

    <div style={{ background: '#f5f7fb', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#6b7488', lineHeight: 1.5 }}>
      Cada turno dura 1 hora. Podés cancelarlo sin cargo hasta 2 horas antes del horario reservado.
    </div>

    <section className="portal-card" style={{ padding: 0, overflow: 'hidden' }}>
      {turnos.map((t, i) => {
        const esMio = t.reserva?.nombre === memberName;
        const libre = !t.reserva;
        return (
          <div
            key={t.hora}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 16px',
              borderBottom: i < turnos.length - 1 ? '1px solid #f0f1f5' : 'none',
              background: esMio ? '#eef4fc' : 'transparent',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: libre ? '#1a7d43' : esMio ? '#2774b8' : '#a34a55' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#16203a' }}>{t.hora}</div>
            </div>
            {libre && (
              <button
                onClick={() => abrirPopup(t.hora)}
                style={{ height: 36, padding: '0 14px', borderRadius: 8, border: 'none', background: '#172a54', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
              >
                Reservar
              </button>
            )}
            {t.reserva && esMio && (
              <button
                onClick={() => actions.liberarReserva(t.reserva!.id)}
                style={{ height: 36, padding: '0 14px', borderRadius: 8, border: '1px solid #b9cfe8', background: '#fff', color: '#172a54', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar mi turno
              </button>
            )}
            {t.reserva && !esMio && (
              <div style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: '#f3e9ea', color: '#a34a55' }}>Ocupado</div>
            )}
          </div>
        );
      })}
    </section>

    {reservandoHora && cancha && (
      <ModalOverlay onClose={() => setReservandoHora(null)} maxWidth={380} ariaLabel="Detalle de la reserva">
        <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 4 }}>Detalle de la reserva</div>
        <div style={{ fontSize: 13.5, color: '#6b7488', marginBottom: 18 }}>
          {cancha.nombre} #{cancha.numero} · {dia} · {reservandoHora}
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: '#16203a', marginBottom: 4 }}>A nombre de</div>
        <div style={{ fontSize: 14.5, color: '#16203a', marginBottom: 16 }}>{memberName}</div>

        <div style={{ fontSize: 13, fontWeight: 600, color: '#16203a', marginBottom: 4 }}>Precio</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#16203a', marginBottom: 16 }}>{formatMoney(cancha.precio)}</div>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#16203a', marginBottom: 6 }}>Método de pago</label>
        <select
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value as MedioPago)}
          style={{ width: '100%', height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#16203a', marginBottom: 18, background: '#fff' }}
        >
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="MercadoPago">Mercado Pago</option>
        </select>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setReservandoHora(null)}
            style={{ flex: 1, height: 46, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={confirmarReserva}
            style={{ flex: 1, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Confirmar reserva
          </button>
        </div>
      </ModalOverlay>
    )}

    {!state.reservaBienvenidaVista && (
      <ModalOverlay
        onClose={actions.cerrarBienvenidaReservas}
        maxWidth={300}
        ariaLabel="Formas de reservar una cancha"
        cardStyle={{ padding: '16px 18px' }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: '#16203a', marginBottom: 6 }}>Dos formas de reservar</div>
        <div style={{ fontSize: 12.5, color: '#4b5468', lineHeight: 1.5, marginBottom: 14 }}>
          El hincha puede reservar <strong>por WhatsApp</strong>, escribiéndole al club, o <strong>desde este portal</strong>, eligiendo cancha, horario y método de pago.
        </div>
        <button
          onClick={actions.cerrarBienvenidaReservas}
          style={{ width: '100%', height: 38, border: 'none', borderRadius: 8, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          Entendido
        </button>
      </ModalOverlay>
    )}
  </>;
}

function MisReservas() {
  const { state, actions } = useApp();
  const memberName = `${state.socios[0].nombre} ${state.socios[0].apellido}`;

  const misReservas = useMemo(
    () => state.reservas.filter((r) => r.nombre === memberName),
    [state.reservas, memberName]
  );
  const proximas = useMemo(
    () => misReservas.filter((r) => r.dia >= HOY_ISO).sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora)),
    [misReservas]
  );
  const historial = useMemo(
    () => misReservas.filter((r) => r.dia < HOY_ISO).sort((a, b) => (b.dia + b.hora).localeCompare(a.dia + a.hora)),
    [misReservas]
  );

  const fila = (r: (typeof misReservas)[number], cancelable: boolean) => {
    const c = state.canchas.find((x) => x.id === r.canchaId);
    return (
      <section
        key={r.id}
        className="portal-card"
        style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: `4px solid ${cancelable ? '#2774b8' : '#c7cedb'}`, marginBottom: 8 }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 10, background: ICONO_COLOR.tienda.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <CanchaIcon nombre={c?.nombre ?? ''} stroke={ICONO_COLOR.tienda.stroke} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#16203a' }}>{c?.nombre} #{c?.numero} · {formatFechaCorta(r.dia)} a las {r.hora}</div>
          <div style={{ fontSize: 12, color: '#8b93a5', marginTop: 2 }}>{c ? formatMoney(c.precio) : ''} · {medioPagoLabel(r.medioPago)}</div>
        </div>
        {cancelable && <button className="portal-text-button" onClick={() => actions.liberarReserva(r.id)}>Cancelar</button>}
      </section>
    );
  };

  return <>
    <h1>Mis reservas</h1>
    <p className="portal-page-sub">{proximas.length > 0 ? `${proximas.length} reserva${proximas.length > 1 ? 's' : ''} próxima${proximas.length > 1 ? 's' : ''}` : 'Sin reservas próximas'}</p>

    <strong className="portal-label-tight">Próximas</strong>
    {proximas.length === 0 ? (
      <section className="portal-card"><p>No tenés reservas próximas.</p></section>
    ) : (
      proximas.map((r) => fila(r, true))
    )}

    <strong className="portal-label">Historial</strong>
    {historial.length === 0 ? (
      <section className="portal-card"><p>Todavía no tenés reservas pasadas.</p></section>
    ) : (
      historial.map((r) => fila(r, false))
    )}
  </>;
}

function CameraIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function medioPagoLabel(medio: MedioPago | undefined) {
  if (medio === 'MercadoPago') return 'Mercado Pago';
  if (medio === 'Tarjeta') return 'Tarjeta de crédito/débito';
  return medio ?? 'Efectivo';
}

function CanchaIcon({ nombre, stroke = '#2774b8' }: { nombre: string; stroke?: string }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const n = nombre.toLowerCase();
  if (n.includes('fútbol') || n.includes('futbol')) return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m12 7 3.5 2.5-1.3 4.1H9.8L8.5 9.5 12 7Z" /></svg>;
  if (n.includes('pádel') || n.includes('padel')) return <svg {...common}><rect x="6" y="3" width="12" height="12" rx="6" /><path d="M12 15v6M9 21h6" /></svg>;
  if (n.includes('tenis')) return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M4 8c4 2 12 2 16 0M4 16c4-2 12-2 16 0" /></svg>;
  return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></svg>;
}
function NovedadImagen({ src, alt, style }: { src: string; alt: string; style?: CSSProperties }) {
  const [ampliada, setAmpliada] = useState(false);
  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={(e) => { e.stopPropagation(); setAmpliada(true); }}
        style={{ width: '100%', borderRadius: 10, display: 'block', cursor: 'zoom-in', ...style }}
      />
      {ampliada && (
        <div
          onClick={(e) => { e.stopPropagation(); setAmpliada(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(10,14,26,.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out',
          }}
        >
          <img src={src} alt={alt} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, objectFit: 'contain' }} />
          <button
            onClick={(e) => { e.stopPropagation(); setAmpliada(false); }}
            aria-label="Cerrar imagen"
            style={{ position: 'fixed', top: 18, right: 18, width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', color: '#16203a', fontSize: 18, fontWeight: 800, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}

function PortalTienda() {
  const { state, actions } = useApp();
  const [comprando, setComprando] = useState<number | null>(null);
  const [medioCompra, setMedioCompra] = useState<MedioPago>('Efectivo');
  const producto = state.productosShop.find((p) => p.id === comprando);

  const confirmarCompra = () => {
    if (!producto) return;
    actions.comprarProductoShopPortal(producto.id, medioCompra);
    setComprando(null);
    setMedioCompra('Efectivo');
  };

  return <>
    <h1>Tienda del club</h1>
    <p className="portal-page-sub">Comprá indumentaria y accesorios oficiales</p>

    {state.productosShop.length === 0 && (
      <section className="portal-card"><p>No hay productos cargados por el momento.</p></section>
    )}

    {state.productosShop.map((p) => {
      const sinStock = p.stock <= 0;
      return (
        <section key={p.id} className="portal-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: ICONO_COLOR.tienda.bg, display: 'grid', placeItems: 'center', flexShrink: 0, overflow: 'hidden' }}>
            {p.foto ? <img src={p.foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <BeneficioIcon tipo="tienda" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: '#16203a' }}>{p.nombre}</div>
            <div style={{ fontSize: 12.5, color: '#8b93a5', marginTop: 2 }}>{p.categoria}{sinStock ? ' · Sin stock' : ''}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#2774b8', marginTop: 4 }}>{formatMoney(p.precio)}</div>
          </div>
          <button
            onClick={() => setComprando(p.id)}
            disabled={sinStock}
            style={{
              height: 38, padding: '0 16px', borderRadius: 9, border: 'none',
              background: sinStock ? '#e3e7ef' : '#2774b8', color: sinStock ? '#9aa2b1' : '#fff',
              fontWeight: 700, fontSize: 13, cursor: sinStock ? 'not-allowed' : 'pointer', flexShrink: 0,
            }}
          >
            {sinStock ? 'Sin stock' : 'Comprar'}
          </button>
        </section>
      );
    })}

    {producto && (
      <ModalOverlay onClose={() => setComprando(null)} maxWidth={380} ariaLabel={`Comprar ${producto.nombre}`}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 4 }}>Confirmar compra</div>
        <div style={{ fontSize: 13.5, color: '#6b7488', marginBottom: 18 }}>{producto.nombre} · {formatMoney(producto.precio)}</div>

        <label style={fieldLabelStyle}>Método de pago</label>
        <select value={medioCompra} onChange={(e) => setMedioCompra(e.target.value as MedioPago)} style={fieldInputStyle}>
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="MercadoPago">Mercado Pago</option>
          <option value="Tarjeta">Tarjeta de crédito/débito</option>
        </select>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setComprando(null)}
            style={{ flex: 1, height: 46, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={confirmarCompra}
            style={{ flex: 1, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Confirmar compra
          </button>
        </div>
      </ModalOverlay>
    )}
  </>;
}

function Novedades() {
  const { state, actions } = useApp();
  const [abiertos, setAbiertos] = useState<Set<number>>(new Set());
  const comunicadosVisibles = useMemo(() => comunicadosParaSocio(state.comunicados, state.socios[0]), [state.comunicados, state.socios]);

  const toggle = (id: number) => {
    setAbiertos((actual) => {
      const next = new Set(actual);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    actions.marcarComunicadoLeido(id);
  };

  const abrirTodas = () => {
    setAbiertos(new Set(comunicadosVisibles.map((c) => c.id)));
    actions.marcarTodosComunicadosLeidos();
  };

  const eliminar = (e: MouseEvent, id: number) => {
    e.stopPropagation();
    actions.eliminarComunicado(id);
  };

  const noLeidas = comunicadosVisibles.filter((c) => !state.comunicadosLeidos.includes(c.id)).length;

  return <>
    <h1>Novedades</h1>
    <p className="portal-page-sub">{noLeidas > 0 ? `${noLeidas} sin leer` : 'Estás al día con las novedades del club'}</p>

    {comunicadosVisibles.length > 0 && (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="portal-text-button" onClick={abrirTodas}>Abrir todas</button>
      </div>
    )}

    {comunicadosVisibles.length === 0 && (
      <section className="portal-card"><p>No hay novedades por el momento.</p></section>
    )}

    {comunicadosVisibles.map((item) => {
      const leido = state.comunicadosLeidos.includes(item.id);
      const abierto = abiertos.has(item.id);
      return (
        <section
          key={item.id}
          className="portal-card portal-menu-card"
          onClick={() => toggle(item.id)}
          style={{ cursor: 'pointer', borderLeft: `4px solid ${leido ? '#e3e7ef' : '#2774b8'}` }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              {!leido && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2774b8', flexShrink: 0 }} />}
              <strong style={{ margin: 0 }}>{item.titulo}</strong>
            </div>
            <button
              onClick={(e) => eliminar(e, item.id)}
              aria-label="Eliminar novedad"
              style={{ flexShrink: 0, border: 'none', background: 'transparent', color: '#a34a55', cursor: 'pointer', padding: 4, display: 'flex' }}
            >
              <TrashIcon />
            </button>
          </div>
          {abierto && item.imagen && <NovedadImagen src={item.imagen} alt={item.titulo} style={{ marginTop: 8 }} />}
          {abierto && !item.imagen && <p>{item.cuerpo}</p>}
          <small>{item.fecha} · {item.hora}</small>
        </section>
      );
    })}
  </>;
}
const QR_GRID = 21;
const QR_QUIET = 8;

function seededBits(seed: number, count: number): boolean[] {
  let s = seed >>> 0 || 1;
  const bits: boolean[] = [];
  for (let i = 0; i < count; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    bits.push(((s >>> 16) & 1) === 1);
  }
  return bits;
}

function enZonaFinder(r: number, c: number): boolean {
  const esquinas = [[0, 0], [0, QR_GRID - QR_QUIET], [QR_GRID - QR_QUIET, 0]];
  return esquinas.some(([er, ec]) => r >= er && r < er + QR_QUIET && c >= ec && c < ec + QR_QUIET);
}

function PatronFinder({ x, y, cell }: { x: number; y: number; cell: number }) {
  return (
    <g>
      <rect x={x} y={y} width={cell * 7} height={cell * 7} fill="#16203a" />
      <rect x={x + cell} y={y + cell} width={cell * 5} height={cell * 5} fill="#fff" />
      <rect x={x + cell * 2} y={y + cell * 2} width={cell * 3} height={cell * 3} fill="#16203a" />
    </g>
  );
}

function CarnetQR({ seed, size = 148 }: { seed: number; size?: number }) {
  const cell = size / QR_GRID;
  const bits = useMemo(() => seededBits(seed, QR_GRID * QR_GRID), [seed]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Código QR del carnet de socio">
      <rect width={size} height={size} fill="#fff" />
      {bits.map((on, i) => {
        const r = Math.floor(i / QR_GRID);
        const c = i % QR_GRID;
        if (!on || enZonaFinder(r, c)) return null;
        return <rect key={i} x={c * cell} y={r * cell} width={cell} height={cell} fill="#16203a" />;
      })}
      <PatronFinder x={0} y={0} cell={cell} />
      <PatronFinder x={(QR_GRID - 7) * cell} y={0} cell={cell} />
      <PatronFinder x={0} y={(QR_GRID - 7) * cell} cell={cell} />
    </svg>
  );
}

function CarnetIcon({ stroke = '#2774b8' }: { stroke?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M6 17c0-1.7 1.3-3 3-3s3 1.3 3 3M14 9h4M14 13h4" />
    </svg>
  );
}

function CarnetSocioModal({ onClose }: { onClose: () => void }) {
  const { state } = useApp();
  const socio = state.socios[0];
  const meta = estadoMeta[socio.estado];
  const iniciales = `${socio.nombre[0] ?? ''}${socio.apellido[0] ?? ''}`.toUpperCase();
  const seed = socio.numero * 7919 + (socio.dni ? Number(socio.dni) % 100000 : 0);

  return (
    <ModalOverlay onClose={onClose} maxWidth={340} ariaLabel="Carnet digital de socio">
      <div style={{ borderRadius: 18, overflow: 'hidden', background: 'linear-gradient(160deg, #172a54, #0d1a38)', color: '#fff', padding: '20px 22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1, opacity: 0.7, fontWeight: 700 }}>CARNET DE SOCIO</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Club Atlético Modelo</div>
          </div>
          <div style={{ display: 'grid', placeItems: 'center', flexShrink: 0 }}><ClubEscudo size={34} /></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          {socio.fotoPerfil ? (
            <img src={socio.fotoPerfil} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(255,255,255,.15)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 20, flexShrink: 0 }}>{iniciales}</div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{socio.nombre} {socio.apellido}</div>
            <div style={{ fontSize: 12.5, opacity: 0.75 }}>Socio N.° {socio.numero}</div>
            <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: meta.bg, color: meta.color }}>{meta.label}</span>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 12, display: 'grid', placeItems: 'center' }}>
          <CarnetQR seed={seed} />
        </div>
        <div style={{ fontSize: 11, opacity: 0.6, textAlign: 'center', marginTop: 10, lineHeight: 1.4 }}>
          Presentá este código en portería para validar tu ingreso.
        </div>
      </div>
    </ModalOverlay>
  );
}

function ContactoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ICONO_COLOR.contacto.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function ContactoClubModal({ onClose }: { onClose: () => void }) {
  const fila = (label: string, valor: string) => (
    <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f1f5' }}>
      <div style={{ fontSize: 12, color: '#8b93a5' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a', marginTop: 2 }}>{valor}</div>
    </div>
  );

  return (
    <ModalOverlay onClose={onClose} maxWidth={340} ariaLabel="Contacto y ubicación del club">
      <div style={{ fontSize: 18, fontWeight: 800, color: '#16203a', marginBottom: 4 }}>Club Atlético Modelo</div>
      <div style={{ fontSize: 13.5, color: '#6b7488', marginBottom: 10 }}>Contacto y ubicación</div>

      {fila('Dirección', CLUB_DIRECCION)}
      {fila('Teléfono', CLUB_TELEFONO)}
      {fila('Email', CLUB_EMAIL)}
      {fila('Instagram', CLUB_INSTAGRAM)}
      {fila('Horario de secretaría', CLUB_HORARIO_SECRETARIA)}

      <a
        href={CLUB_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', height: 46, marginTop: 18, border: 'none', borderRadius: 9,
          background: '#172a54', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxSizing: 'border-box',
        }}
      >
        Ver ubicación en el mapa
      </a>
    </ModalOverlay>
  );
}

function Perfil({ memberName }: { memberName: string }) {
  const { state, actions } = useApp();
  const socio = state.socios[0];
  const esSocio = state.portalRol === 'socio';
  const iniciales = `${socio.nombre[0] ?? ''}${socio.apellido[0] ?? ''}`.toUpperCase();
  const [showCarnet, setShowCarnet] = useState(false);

  const dato = (label: string, valor?: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0f1f5' }}>
      <span style={{ fontSize: 13, color: '#8b93a5' }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#16203a', textAlign: 'right' }}>{valor && valor.trim() ? valor : '—'}</span>
    </div>
  );

  const cambiarFoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') actions.setFotoPerfil(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return <>
    <h1>Mi perfil</h1>

    <div
      style={{
        borderRadius: 18,
        padding: 2,
        background: esSocio ? `linear-gradient(155deg, ${DORADO}, #8a6d1a 45%, ${DORADO})` : 'transparent',
        boxShadow: esSocio ? '0 10px 26px rgba(23,42,84,.3)' : 'none',
      }}
    >
      <section
        className={esSocio ? undefined : 'portal-card'}
        style={esSocio ? { position: 'relative', borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(160deg, #1c3563, #0a1530)', color: '#fff', padding: '18px 18px 16px' } : undefined}
      >
        {esSocio && (
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,106,.16), transparent 70%)' }} />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
            {socio.fotoPerfil ? (
              <img src={socio.fotoPerfil} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', display: 'block', border: esSocio ? `1.5px solid ${DORADO}` : 'none' }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: esSocio ? 'rgba(255,255,255,.12)' : '#172a54', border: esSocio ? `1.5px solid ${DORADO}` : 'none', color: esSocio ? DORADO : '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 18 }}>
                {iniciales}
              </div>
            )}
            <label
              aria-label="Cambiar foto de perfil"
              style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: '50%', background: '#fff', border: '1px solid #e3e7ef', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#2774b8' }}
            >
              <CameraIcon />
              <input type="file" accept="image/*" onChange={cambiarFoto} style={{ display: 'none' }} />
            </label>
          </div>
          <div style={{ minWidth: 0 }}>
            <strong style={{ margin: 0, color: esSocio ? '#fff' : undefined }}>{memberName}</strong>
            <p style={{ margin: '2px 0 0', color: esSocio ? 'rgba(255,255,255,.7)' : undefined }}>{esSocio ? `Socio #${socio.numero} del Club Atlético Modelo` : 'Hincha del Club Atlético Modelo'}</p>
          </div>
        </div>

        {esSocio && (
          <>
            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${DORADO}, transparent)`, margin: '16px 0', opacity: 0.6, position: 'relative' }} />
            <button
              onClick={() => setShowCarnet(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'left', position: 'relative',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(212,175,106,.12)', border: `1px solid ${DORADO}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <CarnetIcon stroke={DORADO} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 14, color: '#fff' }}>Carnet digital</strong>
                <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,.7)' }}>Presentalo en portería para validar tu ingreso</p>
              </div>
              <span style={{ flexShrink: 0, height: 32, padding: '0 12px', borderRadius: 8, border: `1px solid ${DORADO}`, background: 'rgba(212,175,106,.12)', color: DORADO, fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                Ver QR
              </span>
            </button>
          </>
        )}
      </section>
    </div>

    {showCarnet && <CarnetSocioModal onClose={() => setShowCarnet(false)} />}

    <strong className="portal-label">Datos personales</strong>
    <section className="portal-card">
      {dato('DNI', socio.dni)}
      {dato('Fecha de nacimiento', socio.fechaNacimiento)}
      {dato('Domicilio', socio.domicilio)}
      {dato('Teléfono', socio.telefono)}
      {dato('Email', socio.email)}
    </section>

    {esSocio && (
      <>
        <strong className="portal-label">Cuota</strong>
        <section className="portal-card">
          {dato('Método de pago', medioPagoLabel(socio.medioPago))}
          {dato('Débito automático', socio.debitoAutomatico ? 'Activo' : 'No activado')}
        </section>
      </>
    )}

    {!esSocio && (
      <button className="portal-card portal-menu-card" onClick={() => actions.navigate('portal_hacete_socio')} style={{ marginTop: 22, borderColor: '#172a54' }}>
        <strong>Hacete socio</strong>
        <p>Sumate al club y accedé a beneficios exclusivos.</p>
      </button>
    )}

    <button
      onClick={actions.cerrarSesionPortal}
      style={{ width: '100%', marginTop: 22, height: 46, border: '1px solid #e3b5bb', borderRadius: 10, background: '#fff', color: '#a34a55', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
    >
      Cerrar sesión
    </button>
  </>;
}
function SectionTitle({ title, action, onClick }: { title: string; action: string; onClick: () => void }) { return <div className="portal-section-title"><strong>{title}</strong><button className="portal-text-button" onClick={onClick}>{action}</button></div>; }
function PortalNav({ active, label, badge, onClick }: { active: boolean; label: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ border: 'none', background: 'transparent', color: active ? '#172a54' : '#8b93a5', fontWeight: active ? 800 : 600, cursor: 'pointer', fontSize: 10.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '4px 0' }}>
      <span style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 34, height: 26, borderRadius: 9, background: active ? '#eef2fb' : 'transparent', transition: 'background .15s ease',
      }}>
        <PortalNavIcon label={label} />
        {Boolean(badge) && (
          <span style={{
            position: 'absolute', top: -3, right: 1, minWidth: 14, height: 14, padding: '0 3px', borderRadius: 20,
            background: '#c1293c', color: '#fff', fontSize: 9, fontWeight: 800, lineHeight: '14px', textAlign: 'center', boxShadow: '0 0 0 2px #fff',
          }}>
            {badge! > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      {label}
    </button>
  );
}

function PortalNavIcon({ label }: { label: string }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (label === 'Inicio') return <svg {...common}><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></svg>;
  if (label === 'Mi cuota' || label === 'Asociate') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></svg>;
  if (label === 'Reservas') return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /><path d="m8 15 2 2 5-5" /></svg>;
  if (label === 'Torneos') return <svg {...common}><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" /><path d="M8 5H5a2 2 0 0 0 2 4M16 5h3a2 2 0 0 1-2 4" /><path d="M12 12v4M9 20h6M10 16h4v4h-4z" /></svg>;
  if (label === 'Mis reservas') return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /><path d="M8 15h5" /></svg>;
  if (label === 'Mi perfil') return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" /></svg>;
  return <svg {...common}><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></svg>;
}
