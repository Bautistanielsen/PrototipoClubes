import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { formatMoney, formatFechaCorta } from '../lib/format';
import { estadoSponsor, estadoSponsorMeta, ingresoMensualSponsors } from '../lib/derive';
import { HOY_ISO } from '../data/seed';

const iconCommon = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const iconBtnStyle = { width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, border: '1px solid #d7dce6', background: '#fff', cursor: 'pointer', flexShrink: 0 };
const statCard = { flex: 1, minWidth: 170, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '18px 20px' };

function PencilIcon() {
  return (
    <svg {...iconCommon}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg {...iconCommon}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export default function Sponsors() {
  const { state, actions } = useApp();

  const conEstado = useMemo(
    () => state.sponsors.map((s) => ({ ...s, estado: estadoSponsor(s, HOY_ISO) })),
    [state.sponsors]
  );
  const activos = useMemo(() => conEstado.filter((s) => s.estado !== 'Vencido'), [conEstado]);
  const porVencer = useMemo(() => conEstado.filter((s) => s.estado === 'Por vencer'), [conEstado]);
  const ingresoMensual = useMemo(() => ingresoMensualSponsors(state.sponsors, HOY_ISO), [state.sponsors]);

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Sponsors</div>
          <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>Marcas que patrocinan al club: cancha, camiseta, portal y buffet</div>
        </div>
        <button
          onClick={actions.openNuevoSponsor}
          style={{ height: 42, padding: '0 18px', border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          + Nuevo sponsor
        </button>
      </div>

      {porVencer.length > 0 && (
        <div style={{ background: '#fdf0dc', border: '1px solid #f3ddb3', borderRadius: 14, padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#a15c00', marginBottom: 4 }}>Contratos por vencer</div>
          <div style={{ fontSize: 13, color: '#6b7488' }}>{porVencer.map((s) => `${s.nombre} (vence ${formatFechaCorta(s.fechaFin)})`).join(', ')}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ ...statCard, background: '#172a54', border: 'none' }}>
          <div style={{ fontSize: 13, color: '#aeb8d6', fontWeight: 600 }}>Ingreso mensual comprometido</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginTop: 6 }}>{formatMoney(ingresoMensual)}</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Sponsors vigentes</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{activos.length}</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Por vencer (30 días)</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{porVencer.length}</div>
        </div>
      </div>

      {conEstado.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #d7dce6', borderRadius: 14, padding: '40px 24px', textAlign: 'center', fontSize: 13.5, color: '#6b7488' }}>
          Todavía no cargaste sponsors del club.
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden' }}>
          {conEstado.map((s) => {
            const meta = estadoSponsorMeta[s.estado];
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f1f5', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 9, background: '#f5f7fb', border: '1px solid #e3e7ef', overflow: 'hidden', flexShrink: 0 }}>
                    {s.logo && <img src={s.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#16203a' }}>{s.nombre}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: meta.bg, color: meta.color, whiteSpace: 'nowrap' }}>{s.estado}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#8b93a5', marginTop: 2 }}>
                      {s.rubro} · {s.ubicacion} · vigencia {formatFechaCorta(s.fechaInicio)} a {formatFechaCorta(s.fechaFin)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a' }}>{formatMoney(s.monto)}/mes</div>
                  <button
                    onClick={() => actions.openEditarSponsor(s.id)}
                    aria-label={`Modificar ${s.nombre}`}
                    style={{ ...iconBtnStyle, color: '#16203a' }}
                  >
                    <PencilIcon />
                  </button>
                  <button
                    onClick={() => actions.eliminarSponsor(s.id)}
                    aria-label={`Eliminar ${s.nombre}`}
                    style={{ ...iconBtnStyle, border: '1px solid #f3d3d8', color: '#c1293c' }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
