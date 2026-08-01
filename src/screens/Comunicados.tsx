import { useApp } from '../state/AppContext';

export default function Comunicados() {
  const { state, actions } = useApp();

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Comunicados</div>
        <div style={{ fontSize: 14, color: '#6b7488', marginTop: 2 }}>Avisos enviados a los socios</div>
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
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={state.nuevoDestinatario}
            onChange={(e) => actions.setNuevoDestinatario(e.target.value)}
            style={{ flex: 1, minWidth: 180, height: 46, border: '1px solid #e3e7ef', borderRadius: 9, padding: '0 12px', fontSize: 14, color: '#16203a', background: '#fff' }}
          >
            <option value="Todos los socios">Todos los socios</option>
            <option value="Socios al día">Socios al día</option>
            <option value="Socios por vencer">Socios por vencer</option>
            <option value="Socios morosos">Socios morosos</option>
          </select>
          <button
            onClick={actions.enviarComunicado}
            style={{ minWidth: 140, height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Enviar
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {state.comunicados.map((c) => (
          <div key={c.id} style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#16203a' }}>{c.titulo}</div>
              <div style={{ fontSize: 12, color: '#8b93a5', whiteSpace: 'nowrap' }}>{c.fecha}</div>
            </div>
            <div style={{ fontSize: 13.5, color: '#4b5468', marginTop: 6, lineHeight: 1.5 }}>{c.cuerpo}</div>
            <div style={{ fontSize: 12, color: '#1b3a8a', fontWeight: 600, marginTop: 10 }}>Enviado a: {c.destinatario}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
