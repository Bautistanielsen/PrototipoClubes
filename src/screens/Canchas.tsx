import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { HOY_ISO, TURNO_HORAS } from '../lib/derive';
import { formatFechaLarga } from '../lib/format';

export default function Canchas() {
  const { state, actions } = useApp();

  const turnos = useMemo(() => {
    return TURNO_HORAS.map((h) => {
      const r = state.reservas.find((x) => x.canchaId === state.selectedCanchaId && x.dia === state.selectedDia && x.hora === h);
      return { hora: h, reserva: r || null };
    });
  }, [state.reservas, state.selectedCanchaId, state.selectedDia]);

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Reserva de canchas</div>
          <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>Turnos disponibles para los socios</div>
        </div>
        <button
          onClick={actions.openInfoCanchas}
          style={{ height: 44, padding: '0 16px', borderRadius: 9, border: '1px solid #d7dce6', background: '#fff', color: '#16203a', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          ¿Los socios pueden reservar solos?
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {state.canchas.map((c) => {
          const active = state.selectedCanchaId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => actions.selectCancha(c.id)}
              style={{
                height: 44,
                padding: '0 16px',
                borderRadius: 9,
                border: `1px solid ${active ? '#172a54' : '#e3e7ef'}`,
                background: active ? '#172a54' : '#fff',
                color: active ? '#fff' : '#16203a',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {c.nombre}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <input
          type="date"
          value={state.selectedDia}
          min={HOY_ISO}
          onChange={(e) => actions.onDiaChange(e.target.value)}
          style={{ height: 44, padding: '0 12px', border: '1px solid #e3e7ef', borderRadius: 9, fontSize: 14, color: '#16203a', background: '#fff' }}
        />
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#16203a' }}>{formatFechaLarga(state.selectedDia)}</div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, overflow: 'hidden' }}>
        {turnos.map((t) => (
          <div key={t.hora} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 20px', borderBottom: '1px solid #f0f1f5', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#16203a', width: 56 }}>{t.hora}</div>
              {t.reserva ? (
                <div style={{ fontSize: 13, color: '#6b7488' }}>
                  Reservado por <span style={{ fontWeight: 600, color: '#16203a' }}>{t.reserva.nombre}</span>
                </div>
              ) : (
                <div style={{ fontSize: 12.5, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: '#e5f6ea', color: '#1a7d43' }}>Libre</div>
              )}
            </div>
            {t.reserva ? (
              <button
                onClick={() => actions.liberarReserva(t.reserva!.id)}
                style={{ height: 38, padding: '0 16px', borderRadius: 8, border: '1px solid #d7dce6', background: '#fff', color: '#16203a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Liberar
              </button>
            ) : (
              <button
                onClick={() => actions.openReservar(t.hora)}
                style={{ height: 38, padding: '0 16px', borderRadius: 8, border: 'none', background: '#172a54', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Reservar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
