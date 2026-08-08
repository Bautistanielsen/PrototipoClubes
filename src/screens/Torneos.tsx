import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { estadoTorneo, estadoTorneoMeta, HOY_ISO, tablaPosiciones } from '../lib/derive';
import { formatFechaCorta, formatMoney } from '../lib/format';

const inputStyle = { height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', background: '#fff' };

export default function Torneos() {
  const { state, actions } = useApp();

  const proximos = useMemo(
    () => state.torneos.filter((t) => estadoTorneo(t, HOY_ISO) === 'Próximo').length,
    [state.torneos]
  );
  const enCurso = useMemo(
    () => state.torneos.filter((t) => estadoTorneo(t, HOY_ISO) === 'En curso').length,
    [state.torneos]
  );

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Torneos</div>
        <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>Organizá torneos de distintos deportes y difundilos entre los socios</div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 180, background: '#172a54', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, color: '#aeb8d6', fontWeight: 600 }}>Torneos totales</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginTop: 6 }}>{state.torneos.length}</div>
        </div>
        <div style={{ flex: 1, minWidth: 180, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>Próximos</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{proximos}</div>
        </div>
        <div style={{ flex: 1, minWidth: 180, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, color: '#6b7488', fontWeight: 600 }}>En curso</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{enCurso}</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 14 }}>Nuevo torneo</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <input
            type="text"
            value={state.nuevoTorneoNombre}
            onChange={(e) => actions.setNuevoTorneoNombre(e.target.value)}
            placeholder="Nombre del torneo"
            style={{ ...inputStyle, flex: 2, minWidth: 220 }}
          />
          <input
            type="text"
            value={state.nuevoTorneoDeporte}
            onChange={(e) => actions.setNuevoTorneoDeporte(e.target.value)}
            placeholder="Deporte (ej. Fútbol 5, Pádel, Tenis)"
            style={{ ...inputStyle, flex: 1, minWidth: 200 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <input
            type="date"
            value={state.nuevoTorneoFechaInicio}
            onChange={(e) => actions.setNuevoTorneoFechaInicio(e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: 160 }}
          />
          <input
            type="date"
            value={state.nuevoTorneoFechaFin}
            onChange={(e) => actions.setNuevoTorneoFechaFin(e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: 160 }}
          />
          <input
            type="text"
            value={state.nuevoTorneoLugar}
            onChange={(e) => actions.setNuevoTorneoLugar(e.target.value)}
            placeholder="Lugar / cancha"
            style={{ ...inputStyle, flex: 1, minWidth: 160 }}
          />
          <input
            type="number"
            min={1}
            value={state.nuevoTorneoCupo}
            onChange={(e) => actions.setNuevoTorneoCupo(e.target.value)}
            placeholder="Cupo"
            style={{ ...inputStyle, flex: 1, minWidth: 120 }}
          />
          <input
            type="number"
            min={1}
            value={state.nuevoTorneoValorInscripcion}
            onChange={(e) => actions.setNuevoTorneoValorInscripcion(e.target.value)}
            placeholder="Valor de inscripción ($)"
            style={{ ...inputStyle, flex: 1, minWidth: 160 }}
          />
        </div>
        <textarea
          value={state.nuevoTorneoDescripcion}
          onChange={(e) => actions.setNuevoTorneoDescripcion(e.target.value)}
          placeholder="Descripción (categorías, formato...)"
          rows={2}
          style={{ width: '100%', border: '1px solid #e3e7ef', borderRadius: 9, padding: '10px 12px', fontSize: 14, color: '#16203a', marginBottom: 12, fontFamily: 'inherit', resize: 'vertical' }}
        />
        <input
          type="text"
          value={state.nuevoTorneoPremio}
          onChange={(e) => actions.setNuevoTorneoPremio(e.target.value)}
          placeholder="Premio (ej. Copa + $20.000)"
          style={{ ...inputStyle, width: '100%', marginBottom: 14 }}
        />
        <button
          onClick={actions.crearTorneo}
          style={{ minWidth: 160, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          Crear torneo
        </button>
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 10 }}>Torneos organizados</div>
      {state.torneos.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #d7dce6', borderRadius: 14, padding: '40px 24px', textAlign: 'center', fontSize: 13.5, color: '#6b7488' }}>
          Todavía no organizaste ningún torneo.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {state.torneos.map((t) => {
            const estado = estadoTorneo(t, HOY_ISO);
            const meta = estadoTorneoMeta[estado];
            return (
              <div key={t.id} style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#16203a' }}>{t.nombre}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: meta.bg, color: meta.color }}>{estado}</div>
                </div>
                <div style={{ fontSize: 13.5, color: '#6b7488', marginBottom: t.descripcion ? 6 : 0 }}>
                  {t.deporte} · {formatFechaCorta(t.fechaInicio)} al {formatFechaCorta(t.fechaFin)} · {t.lugar} · Cupo: {t.cupo} · Inscripción: {formatMoney(t.valorInscripcion)}
                </div>
                {t.descripcion && <div style={{ fontSize: 13, color: '#8b93a5', marginBottom: t.premio ? 6 : 12 }}>{t.descripcion}</div>}
                {t.premio && (
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#8a6d1a', background: '#fdf3d9', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, marginBottom: 12 }}>
                    🏆 {t.premio}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button
                    onClick={() => actions.openDifundirTorneo(t.id)}
                    style={{ height: 38, padding: '0 16px', borderRadius: 8, border: 'none', background: '#25D366', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Difundir
                  </button>
                  <button
                    onClick={() => actions.toggleTorneoFixture(t.id)}
                    style={{ height: 38, padding: '0 16px', borderRadius: 8, border: '1px solid #d7dce6', background: '#fff', color: '#16203a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    {state.torneoExpandidoId === t.id ? 'Ocultar fixture' : 'Ver fixture'}
                  </button>
                  <button
                    onClick={() => actions.quitarTorneo(t.id)}
                    style={{ height: 38, padding: '0 16px', borderRadius: 8, border: '1px solid #d7dce6', background: '#fff', color: '#c1293c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Eliminar
                  </button>
                </div>

                {state.torneoExpandidoId === t.id && (() => {
                  const equiposDelTorneo = state.equiposTorneo.filter((e) => e.torneoId === t.id);
                  const partidosDelTorneo = state.partidosTorneo.filter((p) => p.torneoId === t.id);
                  const tabla = tablaPosiciones(t.id, state.equiposTorneo, state.partidosTorneo);
                  return (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f1f5' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#16203a', marginBottom: 8 }}>Equipos</div>
                      {equiposDelTorneo.length === 0 ? (
                        <div style={{ fontSize: 13, color: '#6b7488' }}>Todavía no cargaste equipos.</div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {equiposDelTorneo.map((equipo) => (
                            <div
                              key={equipo.id}
                              style={{ background: '#eef1f7', color: '#16203a', fontSize: 12.5, fontWeight: 600, padding: '5px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              {equipo.nombre}
                              <span
                                onClick={() => actions.quitarEquipoTorneo(equipo.id)}
                                style={{ cursor: 'pointer', color: '#6b7488', fontWeight: 700 }}
                              >
                                ×
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <input
                          type="text"
                          value={state.nuevoEquipoNombre}
                          onChange={(e) => actions.setNuevoEquipoNombre(e.target.value)}
                          placeholder="Nombre del equipo"
                          style={{ height: 38, border: '1px solid #e3e7ef', borderRadius: 8, padding: '0 12px', fontSize: 13, color: '#16203a', flex: 1, minWidth: 160 }}
                        />
                        <button
                          onClick={() => actions.agregarEquipoTorneo(t.id)}
                          style={{ height: 38, padding: '0 14px', borderRadius: 8, border: 'none', background: '#172a54', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                        >
                          + Agregar equipo
                        </button>
                      </div>

                      <div style={{ fontSize: 14, fontWeight: 700, color: '#16203a', marginTop: 16, marginBottom: 8 }}>Partidos</div>
                      {partidosDelTorneo.length === 0 ? (
                        <div style={{ fontSize: 13, color: '#6b7488' }}>Todavía no cargaste partidos.</div>
                      ) : (
                        <div>
                          {partidosDelTorneo.map((p) => {
                            const equipoLocal = equiposDelTorneo.find((e) => e.id === p.equipoLocalId);
                            const equipoVisitante = equiposDelTorneo.find((e) => e.id === p.equipoVisitanteId);
                            return (
                              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f0f1f5', flexWrap: 'wrap' }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#16203a', minWidth: 90 }}>{equipoLocal?.nombre ?? '?'}</div>
                                <input
                                  type="number"
                                  value={p.golesLocal ?? ''}
                                  onChange={(e) => actions.setResultadoPartido(p.id, 'golesLocal', e.target.value)}
                                  style={{ width: 50, height: 32, border: '1px solid #e3e7ef', borderRadius: 6, padding: '0 8px', fontSize: 13, color: '#16203a', textAlign: 'center' }}
                                />
                                <div style={{ fontSize: 13, color: '#6b7488' }}>vs</div>
                                <input
                                  type="number"
                                  value={p.golesVisitante ?? ''}
                                  onChange={(e) => actions.setResultadoPartido(p.id, 'golesVisitante', e.target.value)}
                                  style={{ width: 50, height: 32, border: '1px solid #e3e7ef', borderRadius: 6, padding: '0 8px', fontSize: 13, color: '#16203a', textAlign: 'center' }}
                                />
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#16203a', minWidth: 90 }}>{equipoVisitante?.nombre ?? '?'}</div>
                                <button
                                  onClick={() => actions.quitarPartidoTorneo(p.id)}
                                  style={{ height: 30, padding: '0 12px', borderRadius: 7, border: '1px solid #d7dce6', background: '#fff', color: '#c1293c', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}
                                >
                                  Quitar
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {equiposDelTorneo.length >= 2 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                          <select
                            value={state.nuevoPartidoEquipoLocalId}
                            onChange={(e) => actions.setNuevoPartidoEquipoLocalId(e.target.value)}
                            style={{ height: 38, border: '1px solid #e3e7ef', borderRadius: 8, padding: '0 10px', fontSize: 13, color: '#16203a', flex: 1, minWidth: 150 }}
                          >
                            <option value="">Equipo local...</option>
                            {equiposDelTorneo.map((eq) => (
                              <option key={eq.id} value={eq.id}>
                                {eq.nombre}
                              </option>
                            ))}
                          </select>
                          <select
                            value={state.nuevoPartidoEquipoVisitanteId}
                            onChange={(e) => actions.setNuevoPartidoEquipoVisitanteId(e.target.value)}
                            style={{ height: 38, border: '1px solid #e3e7ef', borderRadius: 8, padding: '0 10px', fontSize: 13, color: '#16203a', flex: 1, minWidth: 150 }}
                          >
                            <option value="">Equipo visitante...</option>
                            {equiposDelTorneo.map((eq) => (
                              <option key={eq.id} value={eq.id}>
                                {eq.nombre}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => actions.agregarPartidoTorneo(t.id)}
                            style={{ height: 38, padding: '0 14px', borderRadius: 8, border: 'none', background: '#172a54', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                          >
                            + Agregar partido
                          </button>
                        </div>
                      )}

                      {tabla.length > 0 && (
                        <>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#16203a', marginTop: 16, marginBottom: 8 }}>Tabla de posiciones</div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: 'left', padding: '6px 8px', color: '#6b7488', fontWeight: 600, borderBottom: '1px solid #e3e7ef' }}>Equipo</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', color: '#6b7488', fontWeight: 600, borderBottom: '1px solid #e3e7ef' }}>PJ</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', color: '#6b7488', fontWeight: 600, borderBottom: '1px solid #e3e7ef' }}>G</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', color: '#6b7488', fontWeight: 600, borderBottom: '1px solid #e3e7ef' }}>E</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', color: '#6b7488', fontWeight: 600, borderBottom: '1px solid #e3e7ef' }}>P</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', color: '#6b7488', fontWeight: 600, borderBottom: '1px solid #e3e7ef' }}>GF</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', color: '#6b7488', fontWeight: 600, borderBottom: '1px solid #e3e7ef' }}>GC</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', color: '#6b7488', fontWeight: 600, borderBottom: '1px solid #e3e7ef' }}>DG</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px', color: '#6b7488', fontWeight: 600, borderBottom: '1px solid #e3e7ef' }}>Pts</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tabla.map((fila) => (
                                <tr key={fila.equipoId}>
                                  <td style={{ padding: '6px 8px', fontWeight: 600, color: '#16203a' }}>{fila.nombre}</td>
                                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{fila.pj}</td>
                                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{fila.g}</td>
                                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{fila.e}</td>
                                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{fila.p}</td>
                                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{fila.gf}</td>
                                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{fila.gc}</td>
                                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{fila.dg}</td>
                                  <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{fila.pts}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
