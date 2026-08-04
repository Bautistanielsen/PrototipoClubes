import { useApp } from '../state/AppContext';
import type { Modulo } from '../types';
import administrativoImage from '../assets/modules/administrativo.jpg';
import deportivoImage from '../assets/modules/deportivo.jpg';
import portalSocioImage from '../assets/modules/portal-socio.jpg';
import stadiumBackground from '../assets/fondo-estadio.jpg';

const modules: Array<{ id: Modulo; title: string; description: string; features: string[]; color: string; image: string }> = [
  {
    id: 'administrativo',
    title: 'Panel Administrativo',
    description: 'Socios, cuotas, ingresos y operación general del club.',
    features: ['Padrón y cuotas', 'Finanzas y ventas', 'Reservas y comunicaciones'],
    color: '#172a54',
    image: administrativoImage,
  },
  {
    id: 'deportivo',
    title: 'Gestión Deportiva',
    description: 'Equipos, categorías, entrenamientos y partidos.',
    features: ['Inicio deportivo', 'Equipos y categorías', 'Agenda deportiva'],
    color: '#087f75',
    image: deportivoImage,
  },
  {
    id: 'socio',
    title: 'Portal del Socio',
    description: 'Cuotas, reservas, novedades y perfil personal.',
    features: ['Estado de cuota', 'Reservas', 'Novedades del club'],
    color: '#2774b8',
    image: portalSocioImage,
  },
];

export default function ModuleSelector() {
  const { actions } = useApp();

  return (
    <main style={{ minHeight: '100vh', padding: '32px 24px', backgroundImage: `linear-gradient(rgba(255,255,255,.12), rgba(255,255,255,.12)), url(${stadiumBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', display: 'grid', placeItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 1080 }}>
        <div style={{ textAlign: 'center', color: '#172a54', marginBottom: 36 }}>
          <h1 style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', margin: 0 }}>Gestión integral del club</h1>
          <div style={{ color: '#65708a', fontSize: 15, marginTop: 7 }}>Elegí el módulo que querés recorrer</div>
        </div>
        <div className="module-grid">
          {modules.map((module, index) => (
            <section key={module.id} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 16px 36px rgba(14, 26, 58, 0.16)', borderTop: `5px solid ${module.color}`, display: 'flex', flexDirection: 'column' }}>
              <img src={module.image} alt="" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" style={{ width: '100%', aspectRatio: '3 / 2', objectFit: 'cover', display: 'block', borderBottom: '1px solid #eef0f5' }} />
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ width: 36, height: 5, borderRadius: 5, background: module.color, marginBottom: 14 }} />
              <h2 style={{ fontSize: 21, color: '#16203a', margin: '0 0 7px', letterSpacing: '-0.02em' }}>{module.title}</h2>
              <p style={{ margin: 0, color: '#6b7488', fontSize: 14, lineHeight: 1.5, minHeight: 64 }}>{module.description}</p>
              <ul style={{ margin: '20px 0 24px', padding: 0, listStyle: 'none', display: 'grid', gap: 9, color: '#4b5468', fontSize: 13.5 }}>
                {module.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
              </ul>
              <button onClick={() => actions.selectModule(module.id)} style={{ marginTop: 'auto', height: 46, border: 'none', borderRadius: 9, background: module.color, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Ingresar al módulo
              </button>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
