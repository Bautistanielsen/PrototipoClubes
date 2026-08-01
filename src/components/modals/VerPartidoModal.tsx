import { useApp } from '../../state/AppContext';
import { tipoPartidoMeta } from '../../lib/derive';
import { formatFechaLarga } from '../../lib/format';
import ModalOverlay from './ModalOverlay';

export default function VerPartidoModal() {
  const { state, actions } = useApp();
  if (!state.showVerPartido) return null;

  const partido = state.partidos.find((p) => p.id === state.verPartidoId);
  if (!partido) return null;

  const meta = tipoPartidoMeta[partido.tipo];

  return (
    <ModalOverlay onClose={actions.closeVerPartido} maxWidth={400}>
      <div
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          padding: '5px 12px',
          borderRadius: 20,
          background: meta.bg,
          color: meta.color,
          display: 'inline-block',
          marginBottom: 14,
        }}
      >
        {partido.tipo}
      </div>
      <div style={{ fontSize: 19, fontWeight: 800, color: '#16203a', marginBottom: 4 }}>vs {partido.rival}</div>
      <div style={{ fontSize: 13.5, color: '#6b7488', marginBottom: 20 }}>
        {formatFechaLarga(partido.fecha)} · {partido.hora} hs · {partido.condicion}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={actions.closeVerPartido}
          style={{ flex: 1, height: 46, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          Cerrar
        </button>
        <button
          onClick={actions.quitarVerPartido}
          style={{ flex: 1, height: 46, border: 'none', borderRadius: 9, background: '#c1293c', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          Quitar partido
        </button>
      </div>
    </ModalOverlay>
  );
}
