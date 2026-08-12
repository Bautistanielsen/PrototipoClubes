import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { cuotasResumen, balanceMes, ingresosPorFuente, estadoMeta } from '../lib/derive';
import { formatMoney } from '../lib/format';
import { CATEGORIA_META, MEDIO_META, iconCommon, type FilaMeta } from '../lib/movimientoMeta';

const statCard = { flex: 1, minWidth: 150, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 };
const bigCardDark = { flex: 1, minWidth: 160, background: '#172a54', borderRadius: 14, padding: '18px 20px' };
const bigCardLight = { flex: 1, minWidth: 160, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '18px 20px' };
const iconBadge = (meta: { color: string; bg: string }) => ({ width: 40, height: 40, borderRadius: 10, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 });

const socioIcon = <svg {...iconCommon}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /></svg>;
const estadoIcon: Record<string, React.ReactNode> = {
  al_dia: <svg {...iconCommon}><path d="M20 6 9 17l-5-5" /></svg>,
  por_vencer: <svg {...iconCommon}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>,
  moroso: <svg {...iconCommon}><path d="M12 9v4M12 17h.01" /><path d="m10.3 3.9-8 14A1.7 1.7 0 0 0 3.7 20.5h16.6a1.7 1.7 0 0 0 1.4-2.6l-8-14a1.7 1.7 0 0 0-2.9 0Z" /></svg>,
};
const ventaIcon = <svg {...iconCommon}><path d="M6 8V6a4 4 0 0 1 8 0v2" /><path d="M4 8h12l-1 12H5L4 8Z" /></svg>;
const comunicadoIcon = <svg {...iconCommon}><path d="M3 11v2a2 2 0 0 0 2 2h1l3 4v-4h8a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H8" /><path d="M3 11 8 7v8L3 11Z" /></svg>;

const MEDIO_NEUTRO: FilaMeta = { color: '#1a7d43', bg: '#e5f6ea', icon: ventaIcon };
const COMUNICADO_META: FilaMeta = { color: '#4b3f9e', bg: '#ece9f9', icon: comunicadoIcon };
const EGRESO_FALLBACK: FilaMeta = CATEGORIA_META.Otros;

interface ActividadItem {
  key: string;
  meta: FilaMeta;
  titulo: string;
  detalle: string;
  fecha: string;
}

export default function Dashboard() {
  const { state, actions } = useApp();

  const resumen = useMemo(() => cuotasResumen(state.socios, state.categorias), [state.socios, state.categorias]);
  const balance = useMemo(
    () => balanceMes(resumen.recaudadoMes, state.reservas, state.ventasShop, state.ventasBuffet, state.inscripcionesTorneo, state.egresos),
    [resumen.recaudadoMes, state.reservas, state.ventasShop, state.ventasBuffet, state.inscripcionesTorneo, state.egresos]
  );
  const totalEgresos = useMemo(() => state.egresos.reduce((a, e) => a + e.monto, 0), [state.egresos]);
  const fuentes = useMemo(
    () => ingresosPorFuente(resumen.recaudadoMes, resumen.countAlDia, state.reservas, state.ventasShop, state.ventasBuffet, state.inscripcionesTorneo),
    [resumen.recaudadoMes, resumen.countAlDia, state.reservas, state.ventasShop, state.ventasBuffet, state.inscripcionesTorneo]
  );

  const actividadReciente = useMemo(() => {
    const items: ActividadItem[] = [];
    const ultimoPago = state.pagosHoy[0];
    if (ultimoPago) {
      items.push({
        key: 'pago-' + ultimoPago.id,
        meta: MEDIO_META[ultimoPago.medio] ?? MEDIO_NEUTRO,
        titulo: 'Pago recibido — ' + ultimoPago.nombre,
        detalle: ultimoPago.medio + ' · ' + formatMoney(ultimoPago.monto),
        fecha: ultimoPago.hora,
      });
    }
    const ultimaVentaBuffet = state.ventasBuffet[0];
    if (ultimaVentaBuffet) {
      items.push({
        key: 'buffet-' + ultimaVentaBuffet.id,
        meta: MEDIO_NEUTRO,
        titulo: 'Venta en buffet — ' + ultimaVentaBuffet.producto,
        detalle: ultimaVentaBuffet.medio + ' · ' + formatMoney(ultimaVentaBuffet.precio),
        fecha: ultimaVentaBuffet.hora,
      });
    }
    const ultimaVentaShop = state.ventasShop[0];
    if (ultimaVentaShop) {
      items.push({
        key: 'shop-' + ultimaVentaShop.id,
        meta: MEDIO_NEUTRO,
        titulo: 'Venta en tienda — ' + ultimaVentaShop.producto,
        detalle: ultimaVentaShop.medio + ' · ' + formatMoney(ultimaVentaShop.precio),
        fecha: ultimaVentaShop.hora,
      });
    }
    const ultimoEgreso = state.egresos[state.egresos.length - 1];
    if (ultimoEgreso) {
      items.push({
        key: 'egreso-' + ultimoEgreso.id,
        meta: CATEGORIA_META[ultimoEgreso.categoria] ?? EGRESO_FALLBACK,
        titulo: 'Egreso — ' + ultimoEgreso.categoria,
        detalle: ultimoEgreso.medioPago + ' · ' + formatMoney(ultimoEgreso.monto),
        fecha: ultimoEgreso.hora,
      });
    }
    const ultimoComunicado = state.comunicados[0];
    if (ultimoComunicado) {
      items.push({
        key: 'comunicado-' + ultimoComunicado.id,
        meta: COMUNICADO_META,
        titulo: 'Comunicado enviado',
        detalle: ultimoComunicado.titulo,
        fecha: ultimoComunicado.fecha,
      });
    }
    return items;
  }, [state.pagosHoy, state.ventasBuffet, state.ventasShop, state.egresos, state.comunicados]);

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Resumen general</div>
          <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>Julio 2026 · Club Atlético Modelo</div>
        </div>
        <div style={{ fontSize: 11, color: '#8b93a5', background: '#fff', border: '1px solid #e3e7ef', borderRadius: 20, padding: '6px 12px' }}>
          Datos ficticios — demo
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={statCard}>
            <div style={iconBadge({ color: '#172a54', bg: '#eaeefb' })}>{socioIcon}</div>
            <div>
              <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Socios totales</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a', marginTop: 2 }}>{resumen.totalSocios}</div>
            </div>
          </div>
          <div style={statCard}>
            <div style={iconBadge(estadoMeta.al_dia)}>{estadoIcon.al_dia}</div>
            <div>
              <div style={{ fontSize: 13, color: estadoMeta.al_dia.color, fontWeight: 600 }}>Al día</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a', marginTop: 2 }}>{resumen.countAlDia}</div>
            </div>
          </div>
          <div style={statCard}>
            <div style={iconBadge(estadoMeta.por_vencer)}>{estadoIcon.por_vencer}</div>
            <div>
              <div style={{ fontSize: 13, color: estadoMeta.por_vencer.color, fontWeight: 600 }}>Por vencer</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a', marginTop: 2 }}>{resumen.countPorVencer}</div>
            </div>
          </div>
          <div style={statCard}>
            <div style={iconBadge(estadoMeta.moroso)}>{estadoIcon.moroso}</div>
            <div>
              <div style={{ fontSize: 13, color: estadoMeta.moroso.color, fontWeight: 600 }}>Morosos</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a', marginTop: 2 }}>{resumen.countMoroso}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={bigCardDark}>
            <div style={{ fontSize: 13, color: '#aeb8d6', fontWeight: 600 }}>Ingresos del mes</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 6 }}>{formatMoney(fuentes.totalIngresos)}</div>
          </div>
          <div style={bigCardLight}>
            <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Egresos del mes</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{formatMoney(totalEgresos)}</div>
          </div>
          <div style={bigCardLight}>
            <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Balance del mes</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, color: balance >= 0 ? '#1a7d43' : '#c1293c' }}>
              {balance >= 0 ? '+' : '-'}
              {formatMoney(Math.abs(balance))}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a' }}>Recaudación de cuotas de socios</div>
            <div style={{ fontSize: 13, color: '#6b7488' }}>
              {formatMoney(resumen.recaudadoMes)} de {formatMoney(resumen.esperadoMes)} esperado
            </div>
          </div>
          <div style={{ height: 12, background: '#eef0f5', borderRadius: 8, marginTop: 12, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${resumen.pctRecaudado}%`, background: '#172a54', borderRadius: 8 }} />
          </div>
          <div style={{ fontSize: 13, color: '#6b7488', marginTop: 8 }}>
            {resumen.pctRecaudado}% cobrado · pendiente {formatMoney(resumen.pendienteMes)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 280, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 12 }}>Actividad reciente</div>
            {actividadReciente.length === 0 ? (
              <div style={{ fontSize: 13.5, color: '#8b93a5', padding: '10px 0' }}>Todavía no hay movimientos registrados.</div>
            ) : (
              actividadReciente.map((item, i) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: i === actividadReciente.length - 1 ? 'none' : '1px solid #f0f1f5',
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: item.meta.bg, color: item.meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.meta.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a' }}>{item.titulo}</div>
                    <div style={{ fontSize: 12, color: '#8b93a5', marginTop: 2 }}>{item.detalle}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#8b93a5', whiteSpace: 'nowrap' }}>{item.fecha}</div>
                </div>
              ))
            )}
          </div>
          <div style={{ flex: 1, minWidth: 220, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 12 }}>Accesos rápidos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => actions.navigate('socios')} style={quickBtn}>Ver padrón de socios</button>
              <button onClick={() => actions.navigate('cobranza')} style={quickBtn}>Registrar un pago</button>
              <button onClick={() => actions.navigate('canchas')} style={quickBtn}>Reservar una cancha</button>
              <button onClick={() => actions.navigate('comunicados')} style={quickBtn}>Enviar un comunicado</button>
              <button onClick={() => actions.navigate('reportes')} style={quickBtn}>Ver reportes financieros</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const quickBtn = {
  textAlign: 'left' as const,
  background: '#f5f7fb',
  border: '1px solid #e3e7ef',
  borderRadius: 9,
  padding: '11px 14px',
  fontSize: 13.5,
  fontWeight: 600 as const,
  color: '#16203a',
  cursor: 'pointer',
  minHeight: 44,
};
