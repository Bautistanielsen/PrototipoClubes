import { useApp } from '../state/AppContext';

export default function Equipos() {
  const { state } = useApp();
  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 22 }}><div style={{ fontSize: 24, fontWeight: 800, color: '#16203a' }}>Equipos</div><div style={{ color: '#6b7488', fontSize: 14, marginTop: 3 }}>Categorías y valores de cuota deportiva.</div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        {state.categorias.map((categoria) => <div key={categoria.id} style={{ background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14, padding: 18 }}><div style={{ color: '#087f75', fontSize: 11, fontWeight: 800, letterSpacing: '.06em' }}>CATEGORÍA</div><div style={{ color: '#16203a', fontWeight: 800, fontSize: 17, marginTop: 8 }}>{categoria.nombre}</div><div style={{ color: '#6b7488', fontSize: 13, marginTop: 6 }}>Cuota mensual: ${categoria.monto.toLocaleString('es-AR')}</div></div>)}
      </div>
    </div>
  );
}
