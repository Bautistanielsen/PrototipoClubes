import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { cuotasResumen, balanceMes, ingresosPorFuente, egresosOrdenadosPorMonto, totalEgresos as sumEgresos, TENDENCIA_BASE, TENDENCIA_MAX } from '../lib/derive';
import { formatMoney } from '../lib/format';
import { exportToCSV } from '../lib/export';

export default function Reportes() {
  const { state } = useApp();

  const resumen = useMemo(() => cuotasResumen(state.socios), [state.socios]);
  const balance = useMemo(
    () => balanceMes(resumen.recaudadoMes, state.reservas, state.ventasShop, state.egresos),
    [resumen.recaudadoMes, state.reservas, state.ventasShop, state.egresos]
  );
  const fuentes = useMemo(
    () => ingresosPorFuente(resumen.recaudadoMes, resumen.countAlDia, state.reservas, state.ventasShop),
    [resumen.recaudadoMes, resumen.countAlDia, state.reservas, state.ventasShop]
  );
  const egresosOrdenados = useMemo(() => egresosOrdenadosPorMonto(state.egresos), [state.egresos]);
  const egresosTotal = useMemo(() => sumEgresos(state.egresos), [state.egresos]);

  const tendencia = useMemo(() => {
    const base = [...TENDENCIA_BASE, { mes: 'Jul (neto)', monto: balance }];
    return base.map((t, i) => ({
      ...t,
      montoCorto: '$' + Math.round(t.monto / 1000) + 'k',
      alturaPct: Math.max(6, Math.round((t.monto / TENDENCIA_MAX) * 100)),
      color: i === base.length - 1 ? '#7c8ac2' : '#172a54',
    }));
  }, [balance]);

  const exportarEgresos = () => {
    exportToCSV(
      'egresos.csv',
      ['Categoría', 'Monto'],
      egresosOrdenados.map((eg) => [eg.categoria, eg.monto])
    );
  };

  const exportarIngresos = () => {
    exportToCSV(
      'ingresos-por-fuente.csv',
      ['Fuente', 'Monto', '% del total'],
      [
        ['Cuotas de socios', fuentes.ingresoSocios, fuentes.pctIngresoSocios],
        ['Reserva de canchas', fuentes.ingresoCanchas, fuentes.pctIngresoCanchas],
        ['Ventas del shop', fuentes.ingresoVentas, fuentes.pctIngresoVentas],
      ]
    );
  };

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Reportes financieros</div>
          <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>Últimos 6 meses</div>
        </div>
        <button
          onClick={() => window.print()}
          style={{ height: 42, padding: '0 18px', border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Imprimir / Exportar PDF
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 18 }}>Recaudación mensual (Jul: balance neto del mes)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 160 }}>
          {tendencia.map((t) => (
            <div key={t.mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 11, color: '#6b7488', fontWeight: 600 }}>{t.montoCorto}</div>
              <div style={{ width: '100%', maxWidth: 44, height: `${t.alturaPct}%`, background: t.color, borderRadius: '6px 6px 0 0' }} />
              <div style={{ fontSize: 12, color: '#8b93a5', fontWeight: 600 }}>{t.mes}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 180, background: '#172a54', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, color: '#aeb8d6', fontWeight: 600 }}>Ingresos del mes</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginTop: 6 }}>{formatMoney(fuentes.totalIngresos)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 180, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Egresos del mes</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{formatMoney(egresosTotal)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 180, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Balance del mes</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, color: balance >= 0 ? '#1a7d43' : '#c1293c' }}>
            {balance >= 0 ? '+' : '-'}
            {formatMoney(Math.abs(balance))}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a' }}>Ingresos por fuente — Julio 2026</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, color: '#6b7488' }}>Total {formatMoney(fuentes.totalIngresos)}</div>
            <button
              onClick={exportarIngresos}
              style={{ height: 32, padding: '0 12px', fontSize: 12, border: '1px solid #d7dce6', borderRadius: 7, background: '#fff', color: '#16203a', fontWeight: 600, cursor: 'pointer' }}
            >
              Exportar CSV
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: '#16203a' }}>Cuotas de socios</span>
              <span style={{ color: '#16203a', fontWeight: 700 }}>{formatMoney(fuentes.ingresoSocios)}</span>
            </div>
            <div style={{ height: 10, background: '#eef0f5', borderRadius: 6, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ height: '100%', width: `${fuentes.pctIngresoSocios}%`, background: '#172a54' }} />
            </div>
            <div style={{ fontSize: 12, color: '#8b93a5' }}>
              {fuentes.ingresoSociosDetalle} · {fuentes.pctIngresoSocios}% del total
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: '#16203a' }}>Reserva de canchas</span>
              <span style={{ color: '#16203a', fontWeight: 700 }}>{formatMoney(fuentes.ingresoCanchas)}</span>
            </div>
            <div style={{ height: 10, background: '#eef0f5', borderRadius: 6, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ height: '100%', width: `${fuentes.pctIngresoCanchas}%`, background: '#4a5fa0' }} />
            </div>
            <div style={{ fontSize: 12, color: '#8b93a5' }}>
              {fuentes.ingresoCanchasDetalle} · {fuentes.pctIngresoCanchas}% del total
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: '#16203a' }}>Ventas del shop</span>
              <span style={{ color: '#16203a', fontWeight: 700 }}>{formatMoney(fuentes.ingresoVentas)}</span>
            </div>
            <div style={{ height: 10, background: '#eef0f5', borderRadius: 6, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ height: '100%', width: `${fuentes.pctIngresoVentas}%`, background: '#8b93a5' }} />
            </div>
            <div style={{ fontSize: 12, color: '#8b93a5' }}>
              {fuentes.ingresoVentasDetalle} · {fuentes.pctIngresoVentas}% del total
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a' }}>Egresos del club — Julio 2026</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, color: '#6b7488' }}>Total {formatMoney(egresosTotal)}</div>
            <button
              onClick={exportarEgresos}
              style={{ height: 32, padding: '0 12px', fontSize: 12, border: '1px solid #d7dce6', borderRadius: 7, background: '#fff', color: '#16203a', fontWeight: 600, cursor: 'pointer' }}
            >
              Exportar CSV
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {egresosOrdenados.map((eg) => (
            <div key={eg.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5, marginBottom: 6, gap: 10 }}>
                <span style={{ fontWeight: 600, color: '#16203a' }}>{eg.categoria}</span>
                <span style={{ color: '#16203a', fontWeight: 700 }}>{eg.montoLabel}</span>
              </div>
              <div style={{ height: 10, background: '#eef0f5', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${eg.pct}%`, background: '#c1293c' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
