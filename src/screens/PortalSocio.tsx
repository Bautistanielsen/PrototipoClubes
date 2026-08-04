import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { formatMoney } from '../lib/format';

export default function PortalSocio() {
  const { state, actions } = useApp();
  const active = state.screen;
  const firstSocio = state.socios[0];
  const memberName = `${firstSocio.nombre} ${firstSocio.apellido}`;
  const latestNews = state.comunicados.slice(0, 3);
  const nextReservation = useMemo(() => state.reservas.find((r) => r.nombre === memberName), [memberName, state.reservas]);

  const content = () => {
    if (active === 'portal_cuota') return <Cuota deuda={firstSocio.deuda} estado={firstSocio.estado} ultimoPago={firstSocio.ultimoPago} />;
    if (active === 'portal_reservas') return <Reservas reservation={nextReservation} />;
    if (active === 'portal_mas') return <Mas />;
    if (active === 'portal_novedades') return <Novedades items={latestNews} />;
    if (active === 'portal_perfil') return <Perfil memberName={memberName} />;
    return <Inicio deuda={firstSocio.deuda} reservation={nextReservation} news={latestNews[0]?.titulo} />;
  };

  return (
    <div className="portal-frame">
      <div className="portal-device-top"><span /></div>
      <div className="portal-content">
        <div style={{ fontSize: 12, color: '#6b7488', fontWeight: 700 }}>HOLA, {memberName.toUpperCase()}</div>
        {content()}
      </div>
      <nav className="portal-nav">
        <PortalNav active={active === 'portal_inicio'} label="Inicio" onClick={() => actions.navigate('portal_inicio')} />
        <PortalNav active={active === 'portal_cuota'} label="Mi cuota" onClick={() => actions.navigate('portal_cuota')} />
        <PortalNav active={active === 'portal_reservas'} label="Reservas" onClick={() => actions.navigate('portal_reservas')} />
        <PortalNav active={active === 'portal_mas' || active === 'portal_novedades' || active === 'portal_perfil'} label="Más" onClick={() => actions.navigate('portal_mas')} />
      </nav>
    </div>
  );
}

function Inicio({ deuda, reservation, news }: { deuda: number; reservation: { dia: string; hora: string; nombre: string } | undefined; news?: string }) {
  const { actions } = useApp();
  return <><h1>Tu club, cerca tuyo</h1><section className="portal-card portal-card-primary"><div>Estado de tu cuota</div><strong>{deuda > 0 ? `Debés ${formatMoney(deuda)}` : 'Estás al día'}</strong><button onClick={() => actions.navigate('portal_cuota')}>Ver mi cuota</button></section><SectionTitle title="Próxima reserva" action="Ver todas" onClick={() => actions.navigate('portal_reservas')} /><section className="portal-card"><strong>{reservation ? `${reservation.dia} · ${reservation.hora}` : 'Todavía no tenés reservas'}</strong><p>{reservation ? 'Cancha del club' : 'Reservá un espacio desde el portal.'}</p></section><SectionTitle title="Novedades" action="Ver más" onClick={() => actions.navigate('portal_novedades')} /><section className="portal-card"><strong>{news || 'No hay novedades por el momento'}</strong><p>Información del club para socios.</p></section></>;
}
function Cuota({ deuda, estado, ultimoPago }: { deuda: number; estado: string; ultimoPago: string }) { return <><h1>Mi cuota</h1><section className="portal-card portal-card-primary"><div>{estado === 'al_dia' ? 'Cuota al día' : 'Cuota pendiente'}</div><strong>{deuda > 0 ? formatMoney(deuda) : 'Sin deuda'}</strong><p>{deuda > 0 ? 'Vence el 5 de agosto' : `Último pago: ${ultimoPago}`}</p></section><section className="portal-card"><strong>Débito automático</strong><p>Podés gestionarlo desde tu perfil.</p></section></>; }
function Reservas({ reservation }: { reservation: { dia: string; hora: string; nombre: string } | undefined }) { return <><h1>Reservas</h1><section className="portal-card"><strong>Mis reservas</strong><p>{reservation ? `${reservation.dia} a las ${reservation.hora}` : 'No tenés reservas activas.'}</p></section><section className="portal-card"><strong>Reservar un espacio</strong><p>La selección de horarios se conectará en la próxima etapa del flujo de reservas.</p></section></>; }
function Mas() { const { actions } = useApp(); return <><h1>Más</h1><button className="portal-card portal-menu-card" onClick={() => actions.navigate('portal_novedades')}><strong>Novedades</strong><p>Comunicados e información del club.</p></button><button className="portal-card portal-menu-card" onClick={() => actions.navigate('portal_perfil')}><strong>Mi perfil</strong><p>Datos personales y débito automático.</p></button></>; }
function Novedades({ items }: { items: Array<{ id: number; titulo: string; cuerpo: string; fecha: string }> }) { return <><h1>Novedades</h1>{items.map((item) => <section className="portal-card" key={item.id}><strong>{item.titulo}</strong><p>{item.cuerpo}</p><small>{item.fecha}</small></section>)}</>; }
function Perfil({ memberName }: { memberName: string }) { return <><h1>Mi perfil</h1><section className="portal-card"><strong>{memberName}</strong><p>Socio/a del Club Atlético Modelo</p></section><section className="portal-card"><strong>Débito automático</strong><p>Activo para el cobro de la cuota mensual.</p></section></>; }
function SectionTitle({ title, action, onClick }: { title: string; action: string; onClick: () => void }) { return <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '22px 0 10px' }}><strong style={{ color: '#16203a', fontSize: 15 }}>{title}</strong><button className="portal-text-button" onClick={onClick}>{action}</button></div>; }
function PortalNav({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) { return <button onClick={onClick} style={{ border: 'none', background: 'transparent', color: active ? '#2774b8' : '#8b93a5', fontWeight: active ? 800 : 600, cursor: 'pointer', fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}><PortalNavIcon label={label} />{label}</button>; }

function PortalNavIcon({ label }: { label: string }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (label === 'Inicio') return <svg {...common}><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></svg>;
  if (label === 'Mi cuota') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></svg>;
  if (label === 'Reservas') return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /><path d="m8 15 2 2 5-5" /></svg>;
  return <svg {...common}><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></svg>;
}
