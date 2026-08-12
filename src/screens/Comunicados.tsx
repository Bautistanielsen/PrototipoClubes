import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { estadoMeta } from '../lib/derive';
import type { CanalEnvio } from '../types';

const statCard = { flex: 1, minWidth: 170, background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '18px 20px' };

const DESTINATARIO_META: Record<string, { bg: string; color: string }> = {
  'Todos los socios': { bg: '#eaeefb', color: '#1b3a8a' },
  'Socios al día': { bg: estadoMeta.al_dia.bg, color: estadoMeta.al_dia.color },
  'Socios por vencer': { bg: estadoMeta.por_vencer.bg, color: estadoMeta.por_vencer.color },
  'Socios morosos': { bg: estadoMeta.moroso.bg, color: estadoMeta.moroso.color },
};

const CANAL_OPCIONES: { value: CanalEnvio; label: string }[] = [
  { value: 'app', label: 'Solo la app' },
  { value: 'whatsapp', label: 'Solo WhatsApp' },
  { value: 'ambos', label: 'App y WhatsApp' },
];

const CANAL_META: Record<CanalEnvio, { label: string; bg: string; color: string }> = {
  app: { label: 'App', bg: '#eaeefb', color: '#1b3a8a' },
  whatsapp: { label: 'WhatsApp', bg: '#e3f9ec', color: '#1a9e56' },
  ambos: { label: 'App y WhatsApp', bg: '#f1ecf9', color: '#6c4fa1' },
};

const canalChipStyle = (active: boolean) => ({
  flex: 1,
  minWidth: 130,
  height: 46,
  padding: '0 12px',
  borderRadius: 9,
  border: `1px solid ${active ? '#172a54' : '#e3e7ef'}`,
  background: active ? '#172a54' : '#fff',
  color: active ? '#fff' : '#16203a',
  fontSize: 13.5,
  fontWeight: 600 as const,
  cursor: 'pointer',
});

export default function Comunicados() {
  const { state, actions } = useApp();

  const comunicadosApp = useMemo(() => state.comunicados.filter((c) => c.canal !== 'whatsapp'), [state.comunicados]);
  const leidos = useMemo(
    () => comunicadosApp.filter((c) => state.comunicadosLeidos.includes(c.id)).length,
    [comunicadosApp, state.comunicadosLeidos]
  );
  const sinLeer = comunicadosApp.length - leidos;

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Comunicados</div>
        <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>Avisos enviados a los socios</div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ ...statCard, background: '#172a54', border: 'none' }}>
          <div style={{ fontSize: 13, color: '#aeb8d6', fontWeight: 600 }}>Comunicados enviados</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginTop: 6 }}>{state.comunicados.length}</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 13, color: '#1a7d43', fontWeight: 600 }}>Leídos en la app</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{leidos}</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 13, color: '#a15c00', fontWeight: 600 }}>Sin leer en la app</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a', marginTop: 6 }}>{sinLeer}</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 14 }}>Nuevo comunicado</div>
        <input
          value={state.nuevoTitulo}
          onChange={(e) => actions.setNuevoTitulo(e.target.value)}
          placeholder="Título del comunicado"
          style={{ width: '100%', height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 14px', fontSize: 14, marginBottom: 10, color: '#16203a' }}
        />
        <textarea
          value={state.nuevoCuerpo}
          onChange={(e) => actions.setNuevoCuerpo(e.target.value)}
          placeholder="Mensaje para los socios..."
          style={{ width: '100%', minHeight: 90, border: '1px solid #e3e7ef', borderRadius: 9, padding: '12px 14px', fontSize: 14, marginBottom: 10, resize: 'vertical', color: '#16203a' }}
        />

        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#8b93a5', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 8 }}>
          Medio de envío
        </label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          {CANAL_OPCIONES.map((op) => (
            <button key={op.value} onClick={() => actions.setNuevoCanalEnvio(op.value)} style={canalChipStyle(state.nuevoCanalEnvio === op.value)}>
              {op.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={state.nuevoDestinatario}
            onChange={(e) => actions.setNuevoDestinatario(e.target.value)}
            disabled={state.nuevoCanalEnvio === 'whatsapp'}
            style={{ flex: 1, minWidth: 180, height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', background: state.nuevoCanalEnvio === 'whatsapp' ? '#f5f7fb' : '#fff' }}
          >
            <option value="Todos los socios">Todos los socios</option>
            <option value="Socios al día">Socios al día</option>
            <option value="Socios por vencer">Socios por vencer</option>
            <option value="Socios morosos">Socios morosos</option>
          </select>
          <button
            onClick={actions.enviarComunicado}
            style={{
              minWidth: 140,
              height: 46,
              border: 'none',
              borderRadius: 9,
              background: state.nuevoCanalEnvio === 'app' ? '#172a54' : '#25D366',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {state.nuevoCanalEnvio === 'app' ? 'Enviar' : state.nuevoCanalEnvio === 'whatsapp' ? 'Enviar por WhatsApp' : 'Enviar por ambos'}
          </button>
        </div>
        {state.nuevoCanalEnvio === 'whatsapp' && (
          <div style={{ fontSize: 11.5, color: '#8b93a5', marginTop: 8 }}>
            Se abre WhatsApp con el mensaje listo — el destinatario no aplica porque no se publica en la app.
          </div>
        )}
      </div>

      {state.comunicados.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #d7dce6', borderRadius: 14, padding: '40px 24px', textAlign: 'center', fontSize: 13.5, color: '#6b7488' }}>
          Todavía no enviaste ningún comunicado.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {state.comunicados.map((c) => {
            const destinatarioMeta = DESTINATARIO_META[c.destinatario] ?? DESTINATARIO_META['Todos los socios'];
            const canalMeta = CANAL_META[c.canal ?? 'app'];
            const enviaPorApp = c.canal !== 'whatsapp';
            const leido = state.comunicadosLeidos.includes(c.id);
            return (
              <div key={c.id} style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#16203a' }}>{c.titulo}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 12, color: '#8b93a5', whiteSpace: 'nowrap' }}>{c.fecha}</div>
                    <button
                      onClick={() => actions.eliminarComunicado(c.id)}
                      style={{ height: 30, padding: '0 12px', borderRadius: 7, border: '1px solid #d7dce6', background: '#fff', color: '#c1293c', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                {c.imagen && <img src={c.imagen} alt={c.titulo} style={{ maxWidth: 160, borderRadius: 8, margin: '8px 0', display: 'block' }} />}
                <div style={{ fontSize: 13.5, color: '#4b5468', marginTop: 6, lineHeight: 1.5 }}>{c.cuerpo}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: canalMeta.bg, color: canalMeta.color }}>
                    {canalMeta.label}
                  </div>
                  {enviaPorApp && (
                    <div style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: destinatarioMeta.bg, color: destinatarioMeta.color }}>
                      {c.destinatario}
                    </div>
                  )}
                  {enviaPorApp && (
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 20,
                        background: leido ? '#e5f6ea' : '#eef0f5',
                        color: leido ? '#1a7d43' : '#6b7488',
                      }}
                    >
                      {leido ? 'Leído' : 'Sin leer'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
