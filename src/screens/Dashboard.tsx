import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { cuotasResumen, balanceMes, ingresosPorFuente } from '../lib/derive';
import { formatMoney } from '../lib/format';

const statCard = { flex: 1, minWidth: 150, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '18px 20px' };
const bigCardDark = { flex: 1, minWidth: 160, background: '#172a54', borderRadius: 14, padding: '18px 20px' };
const bigCardLight = { flex: 1, minWidth: 160, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '18px 20px' };

export default function Dashboard() {
  const { state, actions } = useApp();

  const resumen = useMemo(() => cuotasResumen(state.socios), [state.socios]);
  const balance = useMemo(
    () => balanceMes(resumen.recaudadoMes, state.reservas, state.ventasShop, state.egresos),
    [resumen.recaudadoMes, state.reservas, state.ventasShop, state.egresos]
  );
  const totalEgresos = useMemo(() => state.egresos.reduce((a, e) => a + e.monto, 0), [state.egresos]);
  const fuentes = useMemo(
    () => ingresosPorFuente(resumen.recaudadoMes, resumen.countAlDia, state.reservas, state.ventasShop),
    [resumen.recaudadoMes, resumen.countAlDia, state.reservas, state.ventasShop]
  );

  const actividadReciente = useMemo(() => {
    const desdePagos = state.pagosHoy.slice(0, 2).map((p) => ({ titulo: 'Pago recibido — ' + p.nombre, detalle: p.medio, fecha: p.hora }));
    const ultimo = state.comunicados[0];
    const items = [...desdePagos, { titulo: 'Comunicado enviado', detalle: ultimo.titulo, fecha: ultimo.fecha }];
    return items.slice(0, 3);
  }, [state.pagosHoy, state.comunicados]);

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
              <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Socios totales</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{resumen.totalSocios}</div>
            </div>
            <div style={statCard}>
              <div style={{ fontSize: 13, color: '#1a7d43', fontWeight: 600 }}>Al día</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{resumen.countAlDia}</div>
            </div>
            <div style={statCard}>
              <div style={{ fontSize: 13, color: '#a15c00', fontWeight: 600 }}>Por vencer</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{resumen.countPorVencer}</div>
            </div>
            <div style={statCard}>
              <div style={{ fontSize: 13, color: '#c1293c', fontWeight: 600 }}>Morosos</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{resumen.countMoroso}</div>
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
              {actividadReciente.map((item, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f1f5' }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a' }}>{item.titulo}</div>
                    <div style={{ fontSize: 12, color: '#8b93a5', marginTop: 2 }}>{item.detalle}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#8b93a5', whiteSpace: 'nowrap' }}>{item.fecha}</div>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 220, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 12 }}>Accesos rápidos</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => actions.navigate('socios')} style={quickBtn}>Ver padrón de socios</button>
                <button onClick={() => actions.navigate('cobranza')} style={quickBtn}>Registrar un pago</button>
                <button onClick={() => actions.navigate('canchas')} style={quickBtn}>Reservar una cancha</button>
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
