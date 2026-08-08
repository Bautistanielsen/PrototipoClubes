import { useMemo, useState } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';
import { useApp } from '../state/AppContext';
import { formatMoney } from '../lib/format';
import { HOY_ISO, TURNO_HORAS, estadoTorneo, estadoTorneoMeta, tablaPosiciones } from '../lib/derive';
import type { MedioPago, Comunicado, Torneo } from '../types';
import ModalOverlay from '../components/modals/ModalOverlay';

export default function PortalSocio() {
  const { state, actions } = useApp();
  const active = state.screen;
  const firstSocio = state.socios[0];
  const memberName = `${firstSocio.nombre} ${firstSocio.apellido}`;
  const latestNews = state.comunicados.slice(0, 2);
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
        <div style={{ fontSize: 12, color: '#6b7488', fontWeight: 700 }}>HOLA, {memberName.toUpperCase()}</div>
        {content()}
      </div>
      <nav className="portal-nav">
        <PortalNav active={active === 'portal_inicio'} label="Inicio" onClick={() => actions.navigate('portal_inicio')} />
        <PortalNav active={active === 'portal_cuota' || active === 'portal_hacete_socio'} label={state.portalRol === 'hincha' ? 'Asociate' : 'Mi cuota'} onClick={() => actions.navigate('portal_cuota')} />
        <PortalNav active={active === 'portal_torneos'} label="Torneos" onClick={() => actions.navigate('portal_torneos')} />
        <PortalNav active={active === 'portal_reservas'} label="Reservas" onClick={() => actions.navigate('portal_reservas')} />
        <PortalNav active={active === 'portal_mis_reservas'} label="Mis reservas" onClick={() => actions.navigate('portal_mis_reservas')} />
        <PortalNav active={active === 'portal_perfil'} label="Mi perfil" onClick={() => actions.navigate('portal_perfil')} />
      </nav>
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
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#172a54', display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: '#fff', fontWeight: 800, fontSize: 20 }}>CAM</div>
        <div style={{ fontSize: 21, fontWeight: 800, color: '#16203a' }}>Club Atlético Modelo</div>
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
        style={{ width: '100%', height: 48, border: 'none', borderRadius: 10, background: '#172a54', color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', marginTop: 6 }}
      >
        Ingresar
      </button>

      <div style={{ fontSize: 12, color: '#9aa2b1', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
        Modo demo: ingresá cualquier email y contraseña para entrar.
      </div>
    </div>
  );
}

const BENEFICIOS_SOCIO: { icon: 'buffet' | 'tienda' | 'entrada' | 'novedades'; texto: string }[] = [
  { icon: 'buffet', texto: 'Descuento en el buffet' },
  { icon: 'tienda', texto: 'Descuento en la tienda del club' },
  { icon: 'entrada', texto: 'Entrada gratis o con descuento a los partidos' },
  { icon: 'novedades', texto: 'Acceso a novedades y sorteos exclusivos para socios' },
];

function Inicio({ reservation, news }: { reservation: { canchaId: number; dia: string; hora: string; nombre: string } | undefined; news: Comunicado[] }) {
  const { state, actions } = useApp();
  const cancha = state.canchas.find((c) => c.id === reservation?.canchaId);
  const esSocio = state.portalRol === 'socio';
  const primerNombre = state.socios[0].nombre;

  return <>
    <h1>{esSocio ? `Hola, ${primerNombre}` : 'Tu club, cerca tuyo'}</h1>

    {!esSocio && (
      <section className="portal-card portal-card-primary" style={{ background: '#172a54' }}>
        <div>Todavía no sos socio</div>
        <strong>Sumate y accedé a beneficios exclusivos</strong>
        <button onClick={() => actions.navigate('portal_hacete_socio')}>Hacete socio</button>
      </section>
    )}

    <SectionTitle title="Novedades" action="Ver más" onClick={() => actions.navigate('portal_novedades')} />
    {news.length === 0 ? (
      <section className="portal-card">
        <strong>No hay novedades por el momento</strong>
        <p>Información del club para {esSocio ? 'socios' : 'hinchas'}.</p>
      </section>
    ) : (
      news.map((item) => (
        <section key={item.id} className="portal-card">
          <strong>{item.titulo}</strong>
          <p>{item.cuerpo}</p>
        </section>
      ))
    )}

    <SectionTitle title="Próxima reserva" action="Ver todas" onClick={() => actions.navigate('portal_mis_reservas')} />
    <section className="portal-card">
      <strong>{reservation ? `${reservation.dia} · ${reservation.hora}` : 'Todavía no tenés reservas'}</strong>
      <p>{reservation ? cancha?.nombre : 'Reservá un espacio desde el portal.'}</p>
    </section>
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

  return <>
    <h1>Torneos</h1>

    <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', overflowX: 'auto', marginBottom: 14, paddingBottom: 2 }}>
      {FILTROS_TORNEO.map((f) => {
        const active = filtro === f;
        return (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              flexShrink: 0, whiteSpace: 'nowrap',
              height: 36, padding: '0 14px', borderRadius: 9,
              border: `1px solid ${active ? '#172a54' : '#e3e7ef'}`,
              background: active ? '#172a54' : '#fff',
              color: active ? '#fff' : '#16203a',
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {f === 'Todos' ? 'Todos' : f === 'Próximo' ? 'Próximos' : f === 'En curso' ? 'En curso' : 'Finalizados'}
          </button>
        );
      })}
    </div>

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
        <section key={t.id} className="portal-card portal-menu-card" onClick={() => setExpandidoId(abierto ? null : t.id)} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <strong style={{ margin: 0 }}>{t.nombre}</strong>
            <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: meta.bg, color: meta.color }}>{estado}</span>
          </div>
          <p>{t.deporte} · {t.fechaInicio} al {t.fechaFin} · {t.lugar}</p>
          <p>Cupo: {t.cupo} · Inscripción: {formatMoney(t.valorInscripcion)}</p>
          {t.descripcion && <p>{t.descripcion}</p>}
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
                          <th style={{ padding: '4px 6px' }}>G</th>
                          <th style={{ padding: '4px 6px' }}>E</th>
                          <th style={{ padding: '4px 6px' }}>P</th>
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

const fieldLabelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#16203a', marginBottom: 6 } as const;
const fieldInputStyle = { width: '100%', height: 44, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#16203a', marginBottom: 14, background: '#fff', boxSizing: 'border-box' } as const;

interface TarjetaFormState {
  numeroTarjeta: string; setNumeroTarjeta: (v: string) => void;
  titularTarjeta: string; setTitularTarjeta: (v: string) => void;
  vencimientoTarjeta: string; setVencimientoTarjeta: (v: string) => void;
  cvvTarjeta: string; setCvvTarjeta: (v: string) => void;
}

function tarjetaCompleta(t: TarjetaFormState) {
  return Boolean(t.numeroTarjeta.trim() && t.titularTarjeta.trim() && t.vencimientoTarjeta.trim() && t.cvvTarjeta.trim());
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
    <section className="portal-card portal-card-primary" style={{ background: '#172a54' }}>
      <div>Club Atlético Modelo</div>
      <strong>Formá parte del club y disfrutá todos los beneficios</strong>
    </section>
    <strong style={{ display: 'block', color: '#16203a', fontSize: 15, margin: '22px 0 10px' }}>Beneficios de ser socio</strong>
    <div style={{ display: 'grid', gap: 10 }}>
      {BENEFICIOS_SOCIO.map((beneficio) => (
        <section key={beneficio.texto} className="portal-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eaf1fb', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
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

function TrofeoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a6d1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: '#2774b8', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (tipo === 'buffet') return <svg {...common}><path d="M7 3v7a2 2 0 0 0 4 0V3M9 10v11M17 3c-1.5 1.5-2 3-2 5s.5 3 2 4v9" /></svg>;
  if (tipo === 'tienda') return <svg {...common}><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" /><path d="M4 8h16l-1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 8Z" /></svg>;
  if (tipo === 'entrada') return <svg {...common}><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V9Z" /><path d="M10 8v8" strokeDasharray="2 2" /></svg>;
  return <svg {...common}><path d="M18 8a6 6 0 1 0-12 0c0 3.5-1 5-2 6h16c-1-1-2-2.5-2-6" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>;
}

function Cuota() {
  const { state, actions } = useApp();

  if (state.portalRol === 'hincha') {
    return <>
      <h1>Mi cuota</h1>
      <section className="portal-card portal-card-primary" style={{ background: '#172a54' }}>
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

  const { deuda, estado, ultimoPago, debitoAutomatico, medioPago } = state.socios[0];
  return <>
    <h1>Mi cuota</h1>
    <section className="portal-card portal-card-primary">
      <div>{estado === 'al_dia' ? 'Cuota al día' : 'Cuota pendiente'}</div>
      <strong>{deuda > 0 ? formatMoney(deuda) : 'Sin deuda'}</strong>
      <p>{deuda > 0 ? 'Vence el 5 de agosto' : `Último pago: ${ultimoPago}`}</p>
    </section>
    <section className="portal-card">
      <strong>Método de pago</strong>
      <p>{medioPagoLabel(medioPago)}</p>
    </section>
    <section className="portal-card">
      <strong>Débito automático</strong>
      <p>
        {medioPago !== 'Tarjeta'
          ? 'Disponible solo pagando con tarjeta de crédito o débito.'
          : debitoAutomatico ? 'Activo para el cobro de la cuota mensual.' : 'No activado. Podés gestionarlo desde tu perfil.'}
      </p>
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

    <strong style={{ display: 'block', color: '#16203a', fontSize: 15, margin: '0 0 10px' }}>Elegí un deporte</strong>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
      {deportes.map((d) => {
        const active = deporte === d;
        return (
          <button
            key={d}
            onClick={() => elegirDeporte(d)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              height: 42, padding: '0 14px', borderRadius: 9,
              border: `1px solid ${active ? '#172a54' : '#e3e7ef'}`,
              background: active ? '#172a54' : '#fff',
              color: active ? '#fff' : '#16203a',
              fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <CanchaIcon nombre={d} stroke={active ? '#fff' : '#2774b8'} />
            {d}
          </button>
        );
      })}
    </div>

    <strong style={{ display: 'block', color: '#16203a', fontSize: 15, margin: '0 0 10px' }}>Elegí la cancha</strong>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
      {canchasDeporte.map((c) => {
        const active = canchaId === c.id;
        return (
          <button
            key={c.id}
            onClick={() => { setCanchaId(c.id); setReservandoHora(null); }}
            style={{
              height: 40, padding: '0 16px', borderRadius: 9,
              border: `1px solid ${active ? '#172a54' : '#e3e7ef'}`,
              background: active ? '#172a54' : '#fff',
              color: active ? '#fff' : '#16203a',
              fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
            }}
          >
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
      {turnos.map((t) => {
        const esMio = t.reserva?.nombre === memberName;
        return (
          <div key={t.hora} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 16px', borderBottom: '1px solid #f0f1f5' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#16203a' }}>{t.hora}</div>
            {!t.reserva && (
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
                style={{ height: 36, padding: '0 14px', borderRadius: 8, border: '1px solid #d7dce6', background: '#fff', color: '#16203a', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
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
      <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#16203a' }}>{c?.nombre} #{c?.numero} · {r.dia} a las {r.hora}</div>
          <div style={{ fontSize: 12, color: '#8b93a5', marginTop: 2 }}>{c ? formatMoney(c.precio) : ''} · {medioPagoLabel(r.medioPago)}</div>
        </div>
        {cancelable && <button className="portal-text-button" onClick={() => actions.liberarReserva(r.id)}>Cancelar</button>}
      </div>
    );
  };

  return <>
    <h1>Mis reservas</h1>

    <strong style={{ display: 'block', color: '#16203a', fontSize: 15, margin: '0 0 10px' }}>Próximas</strong>
    <section className="portal-card">
      {proximas.length === 0 ? (
        <p>No tenés reservas próximas.</p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>{proximas.map((r) => fila(r, true))}</div>
      )}
    </section>

    <strong style={{ display: 'block', color: '#16203a', fontSize: 15, margin: '22px 0 10px' }}>Historial</strong>
    <section className="portal-card">
      {historial.length === 0 ? (
        <p>Todavía no tenés reservas pasadas.</p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>{historial.map((r) => fila(r, false))}</div>
      )}
    </section>
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
function Novedades() {
  const { state, actions } = useApp();
  const [abiertos, setAbiertos] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setAbiertos((actual) => {
      const next = new Set(actual);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    actions.marcarComunicadoLeido(id);
  };

  const abrirTodas = () => {
    setAbiertos(new Set(state.comunicados.map((c) => c.id)));
    actions.marcarTodosComunicadosLeidos();
  };

  const eliminar = (e: MouseEvent, id: number) => {
    e.stopPropagation();
    actions.eliminarComunicado(id);
  };

  return <>
    <h1>Novedades</h1>

    {state.comunicados.length > 0 && (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="portal-text-button" onClick={abrirTodas}>Abrir todas</button>
      </div>
    )}

    {state.comunicados.length === 0 && (
      <section className="portal-card"><p>No hay novedades por el momento.</p></section>
    )}

    {state.comunicados.map((item) => {
      const leido = state.comunicadosLeidos.includes(item.id);
      const abierto = abiertos.has(item.id);
      return (
        <section key={item.id} className="portal-card portal-menu-card" onClick={() => toggle(item.id)} style={{ cursor: 'pointer' }}>
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
          {abierto && <p>{item.cuerpo}</p>}
          <small>{item.fecha} · {item.hora}</small>
        </section>
      );
    })}
  </>;
}
function Perfil({ memberName }: { memberName: string }) {
  const { state, actions } = useApp();
  const socio = state.socios[0];
  const esSocio = state.portalRol === 'socio';
  const iniciales = `${socio.nombre[0] ?? ''}${socio.apellido[0] ?? ''}`.toUpperCase();

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

    <section className="portal-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
        {socio.fotoPerfil ? (
          <img src={socio.fotoPerfil} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#172a54', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 18 }}>
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
      <div>
        <strong style={{ margin: 0 }}>{memberName}</strong>
        <p style={{ margin: '2px 0 0' }}>{esSocio ? `Socio #${socio.numero} del Club Atlético Modelo` : 'Hincha del Club Atlético Modelo'}</p>
      </div>
    </section>

    <strong style={{ display: 'block', color: '#16203a', fontSize: 15, margin: '22px 0 10px' }}>Datos personales</strong>
    <section className="portal-card">
      {dato('DNI', socio.dni)}
      {dato('Fecha de nacimiento', socio.fechaNacimiento)}
      {dato('Domicilio', socio.domicilio)}
      {dato('Teléfono', socio.telefono)}
      {dato('Email', socio.email)}
    </section>

    {esSocio && (
      <>
        <strong style={{ display: 'block', color: '#16203a', fontSize: 15, margin: '22px 0 10px' }}>Cuota</strong>
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
function SectionTitle({ title, action, onClick }: { title: string; action: string; onClick: () => void }) { return <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '22px 0 10px' }}><strong style={{ color: '#16203a', fontSize: 15 }}>{title}</strong><button className="portal-text-button" onClick={onClick}>{action}</button></div>; }
function PortalNav({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) { return <button onClick={onClick} style={{ border: 'none', background: 'transparent', color: active ? '#2774b8' : '#8b93a5', fontWeight: active ? 800 : 600, cursor: 'pointer', fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}><PortalNavIcon label={label} />{label}</button>; }

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
