import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { buildCalendarCells, crestForRival, tipoPartidoMeta, MESES, CALENDAR_WEEK_DAYS, TIPO_LEGEND } from '../lib/derive';

export default function Calendario() {
  const { state, actions } = useApp();

  const cells = useMemo(() => buildCalendarCells(state.calendarYear, state.calendarMonth, state.partidos), [state.calendarYear, state.calendarMonth, state.partidos]);
  const label = `${MESES[state.calendarMonth]} ${state.calendarYear}`;

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Calendario deportivo</div>
          <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>Próximos partidos del club</div>
        </div>
        <button
          onClick={() => actions.openAgregarPartido()}
          style={{ height: 44, padding: '0 18px', border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          + Agregar partido
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <button
            onClick={actions.prevMonth}
            style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid #e3e7ef', background: '#fff', color: '#16203a', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
          >
            ‹
          </button>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#16203a' }}>{label}</div>
          <button
            onClick={actions.nextMonth}
            style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid #e3e7ef', background: '#fff', color: '#16203a', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
          >
            ›
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10, marginBottom: 10 }}>
          {CALENDAR_WEEK_DAYS.map((wd, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 700, color: '#8b93a5', padding: '4px 0' }}>
              {wd}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10, marginBottom: 22 }}>
          {cells.map((cell, i) => {
            if (cell.blank) return <div key={i} style={{ aspectRatio: '1' }} />;
            const meta = cell.match ? tipoPartidoMeta[cell.match.tipo] : null;
            const crest = cell.match ? crestForRival(cell.match.rival) : null;
            return (
              <div
                key={i}
                onClick={() => (cell.match ? actions.openVerPartido(cell.match.id) : actions.openAgregarPartido(cell.iso))}
                style={{
                  aspectRatio: '1',
                  borderRadius: 10,
                  border: `1.5px solid ${cell.isToday ? '#172a54' : '#eef0f5'}`,
                  background: cell.match ? meta!.bg : '#f9fafc',
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
                  <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', color: cell.match ? meta!.color : '#16203a' }}>
                    {cell.day}
                  </div>
                  {cell.match && crest && (
                    <div style={{ position: 'relative', width: 30, height: 33, flexShrink: 0 }}>
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: `linear-gradient(135deg,${crest.from},${crest.to})`,
                          clipPath: 'polygon(0 0,100% 0,100% 55%,50% 100%,0 55%)',
                        }}
                      />
                      {!crest.diamond && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '20%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 15,
                            height: 15,
                            borderRadius: '50%',
                            background: crest.emblem,
                          }}
                        />
                      )}
                      {crest.diamond && (
                        <>
                          <div
                            style={{
                              position: 'absolute',
                              top: '14%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              background: 'rgba(255,255,255,0.85)',
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: '36%',
                              left: '50%',
                              transform: 'translateX(-50%) rotate(45deg)',
                              width: 9,
                              height: 9,
                              background: crest.emblem,
                            }}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>
                {cell.match && (
                  <div style={{ marginTop: 'auto', fontSize: 12.5, fontWeight: 800, color: meta!.color, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cell.match.condicion === 'Visitante' ? 'VISIT.' : 'LOCAL'} · {cell.match.tipo.toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid #f0f1f5' }}>
          {TIPO_LEGEND.map((l) => (
            <div key={l.tipo} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: '#16203a', fontWeight: 600 }}>{l.tipo}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
