import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { estadoMeta, cuotasResumen } from '../lib/derive';
import { formatMoney } from '../lib/format';
import { exportToCSV } from '../lib/export';
import { iconCommon } from '../lib/movimientoMeta';
import type { EstadoFilter } from '../types';

const filterBtnStyle = (active: boolean) => ({
  height: 46,
  padding: '0 16px',
  borderRadius: 9,
  border: `1px solid ${active ? '#172a54' : '#e3e7ef'}`,
  background: active ? '#172a54' : '#fff',
  color: active ? '#fff' : '#16203a',
  fontSize: 13.5,
  fontWeight: 600 as const,
  cursor: 'pointer',
});

const statCard = { flex: 1, minWidth: 150, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 };
const iconBadge = (meta: { color: string; bg: string }) => ({ width: 40, height: 40, borderRadius: 10, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 });

const socioIcon = <svg {...iconCommon}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /></svg>;
const estadoIcon: Record<string, React.ReactNode> = {
  al_dia: <svg {...iconCommon}><path d="M20 6 9 17l-5-5" /></svg>,
  por_vencer: <svg {...iconCommon}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>,
  moroso: <svg {...iconCommon}><path d="M12 9v4M12 17h.01" /><path d="m10.3 3.9-8 14A1.7 1.7 0 0 0 3.7 20.5h16.6a1.7 1.7 0 0 0 1.4-2.6l-8-14a1.7 1.7 0 0 0-2.9 0Z" /></svg>,
};
const pencilIcon = (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
const trashIcon = (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

export default function Socios() {
  const { state, actions } = useApp();

  const filteredSocios = useMemo(() => {
    const q = state.searchQuery.trim().toLowerCase();
    return state.socios
      .filter((x) => state.estadoFilter === 'todos' || x.estado === state.estadoFilter)
      .filter((x) => !q || (x.nombre + ' ' + x.apellido).toLowerCase().includes(q) || String(x.numero).includes(q));
  }, [state.socios, state.estadoFilter, state.searchQuery]);

  const resumen = useMemo(() => cuotasResumen(state.socios, state.categorias), [state.socios, state.categorias]);

  const filters: { key: EstadoFilter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'al_dia', label: 'Al día' },
    { key: 'por_vencer', label: 'Por vencer' },
    { key: 'moroso', label: 'Moroso' },
  ];

  const exportarPadron = () => {
    exportToCSV(
      'padron-socios.csv',
      ['Número', 'Nombre', 'Apellido', 'Teléfono', 'Estado', 'Deuda', 'Último pago'],
      filteredSocios.map((s) => [s.numero, s.nombre, s.apellido, s.telefono, estadoMeta[s.estado].label, s.deuda, s.ultimoPago])
    );
  };

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Padrón de socios</div>
          <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>
            {filteredSocios.length} de {state.socios.length} socios
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={actions.openImportarSocios}
            style={{ height: 42, padding: '0 18px', border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Importar Excel
          </button>
          <button
            onClick={exportarPadron}
            style={{ height: 42, padding: '0 18px', border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Exportar Excel
          </button>
        </div>
      </div>

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

      <button
        onClick={actions.openAgregarSocio}
        aria-label="Nuevo socio"
        style={{
          position: 'fixed',
          right: 28,
          bottom: state.isMobile ? 152 : 96,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          height: 54,
          padding: '0 24px',
          border: 'none',
          borderRadius: 27,
          background: '#172a54',
          color: '#fff',
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 20px rgba(23, 42, 84, 0.45)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Nuevo socio
      </button>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          value={state.searchQuery}
          onChange={(e) => actions.setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre o número de socio..."
          style={{ flex: 2, minWidth: 220, height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, outline: 'none', background: '#fff', color: '#16203a' }}
        />
        <div style={{ flex: 3, minWidth: 260, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <button key={f.key} onClick={() => actions.setFilter(f.key)} style={filterBtnStyle(state.estadoFilter === f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filteredSocios.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #d7dce6', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #cfd5e2', margin: '0 auto 14px' }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a' }}>No encontramos socios con ese criterio</div>
          <div style={{ fontSize: 13.5, color: '#6b7488', marginTop: 4 }}>Probá con otro nombre, número, o cambiá el filtro de estado.</div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden' }}>
          {filteredSocios.map((s) => {
            const meta = estadoMeta[s.estado];
            const esMoroso = s.estado === 'moroso';
            const rec = state.recordatorios[s.id] || 'pendiente';
            const esProtegido = state.socios[0]?.id === s.id;
            return (
              <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 20px', borderBottom: '1px solid #f0f1f5' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 200 }}>
                    <div style={{ fontSize: 12, color: '#9aa2b1', fontWeight: 600, width: 36 }}>#{s.numero}</div>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: '#16203a' }}>
                        {s.nombre} {s.apellido}
                      </div>
                      <div style={{ fontSize: 12, color: '#8b93a5', marginTop: 1 }}>Último pago: {s.ultimoPago} · {s.telefono}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {esMoroso && <div style={{ fontSize: 13.5, fontWeight: 700, color: '#c1293c' }}>{formatMoney(s.deuda)}</div>}
                    {s.debitoAutomatico && (
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: '#1b3a8a', background: '#eaeefb', padding: '5px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                        Tarjeta automática
                      </div>
                    )}
                    <div style={{ fontSize: 12.5, fontWeight: 700, padding: '6px 12px', borderRadius: 20, background: meta.bg, color: meta.color, whiteSpace: 'nowrap' }}>
                      {meta.label}
                    </div>
                    <button
                      onClick={() => actions.openEditarSocio(s.id)}
                      aria-label={`Editar ${s.nombre} ${s.apellido}`}
                      style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, border: '1px solid #d7dce6', background: '#fff', color: '#16203a', cursor: 'pointer', flexShrink: 0 }}
                    >
                      {pencilIcon}
                    </button>
                    <button
                      onClick={() => actions.eliminarSocio(s.id)}
                      disabled={esProtegido}
                      aria-label={esProtegido ? `${s.nombre} ${s.apellido} es la cuenta demo del Portal del Hincha y no se puede dar de baja` : `Dar de baja a ${s.nombre} ${s.apellido}`}
                      title={esProtegido ? 'Es la cuenta activa del Portal del Hincha en esta demo — no se puede dar de baja' : undefined}
                      style={{
                        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7,
                        border: `1px solid ${esProtegido ? '#e3e7ef' : '#f3d3d8'}`, background: '#fff',
                        color: esProtegido ? '#c3cbe4' : '#c1293c',
                        cursor: esProtegido ? 'not-allowed' : 'pointer', flexShrink: 0,
                      }}
                    >
                      {trashIcon}
                    </button>
                  </div>
                </div>
                {esMoroso && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: '#fbf7f2', borderRadius: 10, padding: '10px 14px' }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '5px 12px',
                        borderRadius: 20,
                        background: rec === 'enviado' ? '#e5f6ea' : '#fdf0dc',
                        color: rec === 'enviado' ? '#1a7d43' : '#a15c00',
                      }}
                    >
                      {rec === 'enviado' ? 'Recordatorio enviado' : 'Pendiente de envío'}
                    </div>
                    <button
                      onClick={() => actions.toggleRecordatorio(s.id)}
                      style={{ height: 36, padding: '0 14px', borderRadius: 8, border: '1px solid #d7dce6', background: '#fff', color: '#16203a', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                    >
                      {rec === 'enviado' ? 'Marcar pendiente' : 'Marcar enviado'}
                    </button>
                    <button
                      onClick={() => actions.enviarRecordatorioWhatsapp(s.id)}
                      style={{ height: 36, padding: '0 14px', borderRadius: 8, border: 'none', background: '#25D366', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Enviar por WhatsApp
                    </button>
                    <button
                      onClick={() => actions.cobrarMoroso(s.id)}
                      style={{ height: 36, padding: '0 14px', borderRadius: 8, border: 'none', background: '#172a54', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Registrar cobro
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
