import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { cuotasResumen, balanceMes, ingresosPorFuente, egresosPorCategoria, totalEgresos as sumEgresos, construirLibroCaja, saldosPorMedioPago, HOY_ISO, TENDENCIA_BASE, TENDENCIA_MAX } from '../lib/derive';
import type { SaldoPorMedio } from '../lib/derive';
import { formatMoney, formatFechaCorta } from '../lib/format';
import { exportToCSV } from '../lib/export';
import { iconCommon, CATEGORIA_META, MEDIO_META } from '../lib/movimientoMeta';
import type { FilaMeta } from '../lib/movimientoMeta';
import MetaRow from '../components/MetaRow';
import mercadoPagoIcon from '../assets/mercadopago-icon.webp';

const filtroLabelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#8b93a5', textTransform: 'uppercase' as const, letterSpacing: '.04em', marginBottom: 6 };
const filtroSelectStyle = { width: '100%', height: 44, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', background: '#fff' };

export default function Reportes() {
  const { state, actions } = useApp();

  const resumen = useMemo(() => cuotasResumen(state.socios, state.categorias), [state.socios, state.categorias]);
  const balance = useMemo(
    () => balanceMes(resumen.recaudadoMes, state.reservas, state.ventasShop, state.ventasBuffet, state.inscripcionesTorneo, state.egresos, state.sponsors, HOY_ISO),
    [resumen.recaudadoMes, state.reservas, state.ventasShop, state.ventasBuffet, state.inscripcionesTorneo, state.egresos, state.sponsors]
  );
  const fuentes = useMemo(
    () => ingresosPorFuente(resumen.recaudadoMes, resumen.countAlDia, state.reservas, state.ventasShop, state.ventasBuffet, state.inscripcionesTorneo, state.sponsors, HOY_ISO),
    [resumen.recaudadoMes, resumen.countAlDia, state.reservas, state.ventasShop, state.ventasBuffet, state.inscripcionesTorneo, state.sponsors]
  );
  const fuentesOrdenadas = useMemo(
    () =>
      [
        { label: 'Cuotas de socios', monto: fuentes.ingresoSocios, pct: fuentes.pctIngresoSocios, detalle: fuentes.ingresoSociosDetalle },
        { label: 'Reserva de canchas', monto: fuentes.ingresoCanchas, pct: fuentes.pctIngresoCanchas, detalle: fuentes.ingresoCanchasDetalle },
        { label: 'Ventas del shop', monto: fuentes.ingresoVentas, pct: fuentes.pctIngresoVentas, detalle: fuentes.ingresoVentasDetalle },
        { label: 'Ventas de buffet', monto: fuentes.ingresoBuffet, pct: fuentes.pctIngresoBuffet, detalle: fuentes.ingresoBuffetDetalle },
        { label: 'Inscripciones a torneos', monto: fuentes.ingresoTorneos, pct: fuentes.pctIngresoTorneos, detalle: fuentes.ingresoTorneosDetalle },
        { label: 'Sponsors', monto: fuentes.ingresoSponsors, pct: fuentes.pctIngresoSponsors, detalle: fuentes.ingresoSponsorsDetalle },
      ].sort((a, b) => b.monto - a.monto),
    [fuentes]
  );
  const egresosOrdenados = useMemo(() => egresosPorCategoria(state.egresos), [state.egresos]);
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

  const movimientos = useMemo(
    () =>
      construirLibroCaja({
        pagosHoy: state.pagosHoy,
        ventasShop: state.ventasShop,
        ventasBuffet: state.ventasBuffet,
        reservas: state.reservas,
        canchas: state.canchas,
        inscripcionesTorneo: state.inscripcionesTorneo,
        torneos: state.torneos,
        egresos: state.egresos,
        hoyIso: HOY_ISO,
      }),
    [state.pagosHoy, state.ventasShop, state.ventasBuffet, state.reservas, state.canchas, state.inscripcionesTorneo, state.torneos, state.egresos]
  );
  const saldos = useMemo(() => saldosPorMedioPago(movimientos), [movimientos]);
  const fuentesPresentes = useMemo(() => Array.from(new Set(movimientos.map((m) => m.fuente))), [movimientos]);
  const movimientosFiltrados = useMemo(
    () =>
      movimientos
        .filter((m) => state.cajaFiltroTipo === 'todos' || m.tipo === state.cajaFiltroTipo)
        .filter((m) => state.cajaFiltroMedio === 'todos' || m.medioPago === state.cajaFiltroMedio)
        .filter((m) => state.cajaFiltroFuente === 'todas' || m.fuente === state.cajaFiltroFuente),
    [movimientos, state.cajaFiltroTipo, state.cajaFiltroMedio, state.cajaFiltroFuente]
  );

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
      fuentesOrdenadas.map((f) => [f.label, f.monto, f.pct])
    );
  };

  const exportarMovimientos = () => {
    exportToCSV(
      'libro-de-caja.csv',
      ['Fecha', 'Hora', 'Tipo', 'Fuente', 'Concepto', 'Medio de pago', 'Monto'],
      movimientos.map((m) => [formatFechaCorta(m.fecha), m.hora, m.tipo === 'ingreso' ? 'Ingreso' : 'Egreso', m.fuente, m.concepto, m.medioPago, m.monto])
    );
  };

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Resumen financiero</div>
          <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>Últimos 6 meses · todo lo que entra y sale del club</div>
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
              Exportar Excel
            </button>
          </div>
        </div>
        <div>
          {fuentesOrdenadas.map((f, i) => (
            <MetaRow key={f.label} meta={FUENTE_META[f.label]} label={f.label} monto={f.monto} pct={f.pct} detalle={f.detalle} ultima={i === fuentesOrdenadas.length - 1} />
          ))}
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
              Exportar Excel
            </button>
          </div>
        </div>
        <div>
          {egresosOrdenados.map((eg, i) => (
            <MetaRow
              key={eg.categoria}
              meta={CATEGORIA_META[eg.categoria] ?? CATEGORIA_META.Otros}
              label={eg.categoria}
              monto={eg.monto}
              pct={eg.pct}
              detalle=""
              ultima={i === egresosOrdenados.length - 1}
            />
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 4 }}>Saldo por medio de pago</div>
        <div style={{ fontSize: 12.5, color: '#8b93a5', marginBottom: 14 }}>Para el arqueo de caja: cuánto debería haber en efectivo vs. en cada cuenta, según todos los movimientos registrados.</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {saldos.map((s) => (
            <SaldoMedioCard key={s.medio} saldo={s} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a' }}>Movimientos</div>
        <button
          onClick={exportarMovimientos}
          style={{ height: 32, padding: '0 12px', fontSize: 12, border: '1px solid #d7dce6', borderRadius: 7, background: '#fff', color: '#16203a', fontWeight: 600, cursor: 'pointer' }}
        >
          Exportar Excel
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '16px 18px', marginBottom: 16, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={filtroLabelStyle}>Tipo</label>
          <select value={state.cajaFiltroTipo} onChange={(e) => actions.setCajaFiltroTipo(e.target.value as any)} style={filtroSelectStyle}>
            <option value="todos">Todos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={filtroLabelStyle}>Medio de pago</label>
          <select value={state.cajaFiltroMedio} onChange={(e) => actions.setCajaFiltroMedio(e.target.value as any)} style={filtroSelectStyle}>
            <option value="todos">Todos</option>
            {saldos.map((s) => (
              <option key={s.medio} value={s.medio}>{s.medio}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={filtroLabelStyle}>Fuente</label>
          <select value={state.cajaFiltroFuente} onChange={(e) => actions.setCajaFiltroFuente(e.target.value)} style={filtroSelectStyle}>
            <option value="todas">Todas</option>
            {fuentesPresentes.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {movimientosFiltrados.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #d7dce6', borderRadius: 14, padding: '40px 24px', textAlign: 'center', fontSize: 13.5, color: '#6b7488' }}>
          No hay movimientos para ese filtro.
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden' }}>
          {movimientosFiltrados.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f1f5', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                    fontWeight: 800,
                    background: m.tipo === 'ingreso' ? '#e5f6ea' : '#fbe6e9',
                    color: m.tipo === 'ingreso' ? '#1a7d43' : '#c1293c',
                  }}
                >
                  {m.tipo === 'ingreso' ? '+' : '−'}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a' }}>{m.fuente}</div>
                  <div style={{ fontSize: 12, color: '#8b93a5', marginTop: 2 }}>
                    {m.concepto} · {m.medioPago} · {formatFechaCorta(m.fecha)}{m.hora && m.hora !== '—' ? ' · ' + m.hora : ''}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: m.tipo === 'ingreso' ? '#1a7d43' : '#c1293c' }}>
                {m.tipo === 'ingreso' ? '+' : '-'}
                {formatMoney(m.monto)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const FUENTE_META: Record<string, FilaMeta> = {
  'Cuotas de socios': {
    color: '#172a54',
    bg: '#eef1f8',
    icon: <svg {...iconCommon}><circle cx="9" cy="8" r="3.2" /><circle cx="17" cy="9.5" r="2.4" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M15.5 14.2c2.6.3 4.5 2.4 4.5 5.1" /></svg>,
  },
  'Reserva de canchas': {
    color: '#2f6fb0',
    bg: '#eaf2fa',
    icon: <svg {...iconCommon}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M12 5v14M3 12h5M16 12h5" /><circle cx="12" cy="12" r="2.5" /></svg>,
  },
  'Ventas del shop': {
    color: '#6c4fa1',
    bg: '#f1ecf9',
    icon: <svg {...iconCommon}><path d="M4 8h16l-1 13H5L4 8Z" /><path d="M8 8a4 4 0 0 1 8 0" /></svg>,
  },
  'Ventas de buffet': {
    color: '#1a7d43',
    bg: '#e5f6ea',
    icon: <svg {...iconCommon}><path d="M7 3v7M4 3v4a3 3 0 0 0 6 0V3M7 10v11M16 3v18M16 3c3 2 4 5 4 8h-4" /></svg>,
  },
  'Inscripciones a torneos': {
    color: '#a15c00',
    bg: '#fdf0dc',
    icon: <svg {...iconCommon}><path d="M8 4h8v5a4 4 0 0 1-8 0V4z" /><path d="M8 5H5a3 3 0 0 0 3 5" /><path d="M16 5h3a3 3 0 0 1-3 5" /><line x1="12" y1="13" x2="12" y2="17" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="17" x2="12" y2="20" /></svg>,
  },
  Sponsors: {
    color: '#0f7d8b',
    bg: '#e3f3f5',
    icon: <svg {...iconCommon}><path d="M12 3 4 6.5v5c0 4.5 3.2 7.9 8 9 4.8-1.1 8-4.5 8-9v-5L12 3Z" /><path d="m9 12 2 2 4-4" /></svg>,
  },
};

function SaldoMedioCard({ saldo }: { saldo: SaldoPorMedio }) {
  const meta = MEDIO_META[saldo.medio];
  const total = saldo.ingresos + saldo.egresos || 1;
  const pctIngresos = Math.round((saldo.ingresos / total) * 100);
  return (
    <div style={{ flex: 1, minWidth: 200, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, height: 32 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          {saldo.medio === 'MercadoPago' ? (
            <img src={mercadoPagoIcon} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
          ) : (
            <span style={{ color: meta.color, display: 'flex' }}>{meta.icon}</span>
          )}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#16203a' }}>{saldo.medio}</div>
      </div>

      <div style={{ fontSize: 12, color: '#6b7488', display: 'flex', justifyContent: 'space-between' }}>
        <span>Ingresos</span>
        <span style={{ fontWeight: 700, color: '#1a7d43' }}>{formatMoney(saldo.ingresos)}</span>
      </div>
      <div style={{ fontSize: 12, color: '#6b7488', display: 'flex', justifyContent: 'space-between', marginTop: 3, marginBottom: 8 }}>
        <span>Egresos</span>
        <span style={{ fontWeight: 700, color: '#c1293c' }}>{formatMoney(saldo.egresos)}</span>
      </div>
      <div style={{ display: 'flex', height: 6, borderRadius: 6, overflow: 'hidden', background: '#eef0f5', marginBottom: 14 }}>
        {saldo.ingresos > 0 && <div style={{ width: `${pctIngresos}%`, background: '#1a7d43' }} />}
        {saldo.egresos > 0 && <div style={{ width: `${100 - pctIngresos}%`, background: '#c1293c' }} />}
      </div>

      <div style={{ borderTop: '1px solid #f0f1f5', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#6b7488' }}>Saldo</span>
        <span style={{ fontSize: 19, fontWeight: 800, color: saldo.saldo >= 0 ? '#1a7d43' : '#c1293c' }}>{formatMoney(saldo.saldo)}</span>
      </div>
    </div>
  );
}
