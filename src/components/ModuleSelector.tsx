import { useState, type CSSProperties, type FormEvent, type MouseEvent } from 'react';
import { useApp } from '../state/AppContext';
import type { Modulo } from '../types';
import administrativoImage from '../../assets/demo_admin.png';
import deportivoImage from '../../assets/demo_deportiva.png';
import portalHinchaImage from '../../assets/demo_hincha.png';
import administrativoModuleImage from '../assets/modules/administrativo.jpg';
import deportivoModuleImage from '../assets/modules/deportivo.jpg';
import portalSocioModuleImage from '../assets/modules/portal-socio.jpg';
import alboShopScreenshot from '../../assets/alboshop-screenshot.png';

const WHATSAPP_NUMBER = '5492235341822';

type LandingStyle = CSSProperties & Record<'--module-color', string>;

const whatsappUrl = (message: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const modules: Array<{ id: Modulo; title: string; description: string; features: string[]; color: string; image: string }> = [
  {
    id: 'administrativo',
    title: 'Panel Administrativo',
    description: 'Socios, cuotas, ingresos y operación general del club.',
    features: ['Padrón y cuotas', 'Finanzas y ventas', 'Reservas y comunicaciones'],
    color: '#172a54',
    image: administrativoModuleImage,
  },
  {
    id: 'deportivo',
    title: 'Gestión Deportiva',
    description: 'Equipos, categorías, entrenamientos y partidos.',
    features: ['Inicio deportivo', 'Equipos y categorías', 'Agenda deportiva'],
    color: '#087f75',
    image: deportivoModuleImage,
  },
  {
    id: 'socio',
    title: 'Portal del Hincha',
    description: 'Novedades, reservas y el camino para hacerse socio del club.',
    features: ['Hacete socio', 'Reservas', 'Novedades del club'],
    color: '#2774b8',
    image: portalSocioModuleImage,
  },
];

const heroPreviewTitle = (id: Modulo): string => modules.find((module) => module.id === id)?.title ?? '';

const plans = [
  {
    name: 'Administrativo',
    audience: 'Para la comisión directiva',
    price: '$49.900',
    tone: 'admin',
    cta: 'Consultar por este plan',
    features: [
      'Socios, cuotas y cobranzas',
      'Finanzas y egresos unificados',
      'Ventas: buffet y tienda del club',
      'Reservas de canchas y espacios',
      'Comunicados a socios',
      'Asistente de IA administrativo',
    ],
  },
  {
    name: 'Deportivo',
    audience: 'Para el cuerpo técnico',
    price: '$39.900',
    tone: 'deportivo',
    cta: 'Consultar por este plan',
    features: [
      'Multi-plantel: todas las categorías',
      'Fichas de jugadores y estado físico',
      'Formaciones tácticas visuales',
      'Partidos, calendario y resultados',
      'Estadísticas y rendimiento',
      'Asistente de IA deportivo',
    ],
  },
  {
    name: 'Portal del Hincha',
    audience: 'La cara pública del club',
    price: '$19.900',
    tone: 'portal',
    cta: 'Consultar por este plan',
    requirement: 'Requiere plan Administrativo',
    features: [
      'App/portal para socios e hinchas',
      'Carnet digital con código QR',
      'Reservas y estado de cuota online',
      'Alta de nuevos socios',
      'Tienda y pedidos de buffet',
      'Asistente de IA para hinchas',
    ],
  },
  {
    name: 'Full Club',
    audience: 'Los 3 módulos, un solo club',
    price: '$89.900',
    priceNote: 'Ahorrás ~18% vs. la suma individual',
    tone: 'full',
    cta: 'Consultar por este plan',
    featured: true,
    features: [
      'Administrativo + Deportivo + Portal del Hincha completos',
      'Dashboard Ejecutivo 360° — exclusivo',
      'Todo el club en un solo lugar, un solo login',
      'Un solo equipo de soporte para los 3 módulos',
      'Precio cerrado, sin sumar módulos por separado',
    ],
  },
];

export default function ModuleSelector() {
  const { actions } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault();
    closeMenu();
    const section = document.getElementById(sectionId);
    if (!section) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sectionBounds = section.getBoundingClientRect();
    const sectionTop = window.scrollY + sectionBounds.top;
    const safeViewportHeight = window.innerHeight - 192;
    const targetTop = sectionBounds.height > safeViewportHeight
      ? sectionTop - 12
      : sectionTop - ((window.innerHeight - sectionBounds.height) / 2) + 24;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: reducedMotion ? 'auto' : 'smooth' });
    window.history.replaceState(null, '', `#${sectionId}`);
  };

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nombre = String(formData.get('nombre') ?? '').trim();
    const club = String(formData.get('club') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const telefono = String(formData.get('telefono') ?? '').trim();
    const consulta = String(formData.get('consulta') ?? '').trim();
    const message = [
      'Hola, quiero postular mi club al piloto de ClubDesk (30 días sin costo).',
      `Nombre: ${nombre}`,
      `Club: ${club}`,
      `Email: ${email}`,
      ...(telefono ? [`Teléfono: ${telefono}`] : []),
      `Consulta: ${consulta}`,
    ].join('\n');

    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-shell landing-nav">
          <a className="landing-logo" href="#inicio" onClick={(event) => scrollToSection(event, 'inicio')}>
            <img src="/brand/clubdesk/export/clubdesk-logo-horizontal-transparent.png?v=brand-green-2026-08" alt="ClubDesk" />
          </a>
          <button
            className="landing-menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="landing-navigation"
            aria-label={menuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
          <nav className={`landing-navlinks${menuOpen ? ' landing-navlinks--open' : ''}`} id="landing-navigation" aria-label="Navegación principal">
            <a href="#piloto" onClick={(event) => scrollToSection(event, 'piloto')}>Piloto</a>
            <a href="#demos" onClick={(event) => scrollToSection(event, 'demos')}>Demos</a>
            <a href="#planes" onClick={(event) => scrollToSection(event, 'planes')}>Planes</a>
            <a href="#ecommerce" onClick={(event) => scrollToSection(event, 'ecommerce')}>Caso real</a>
            <a href="#contacto" onClick={(event) => scrollToSection(event, 'contacto')}>Contacto</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="landing-hero" id="inicio" aria-labelledby="landing-title">
          <div className="landing-shell landing-hero-layout">
            <div className="landing-hero-content">
              <p className="landing-eyebrow landing-hero-eyebrow">Programa Clubes Fundadores</p>
              <h1 id="landing-title">Probá una nueva forma de gestionar tu club.</h1>
              <p className="landing-hero-copy">ClubDesk reúne la gestión administrativa, deportiva y el vínculo con socios en una única plataforma. Probala durante 30 días sin costo y empezá a ordenar la gestión de tu club desde el primer día.</p>
              <div className="landing-hero-actions">
                <a className="landing-button landing-button--primary" href="#piloto" onClick={(event) => scrollToSection(event, 'piloto')}>Postular mi club</a>
                <a className="landing-button landing-button--secondary" href="#demos" onClick={(event) => scrollToSection(event, 'demos')}>Ver las demos</a>
              </div>
            </div>
            <div className="landing-hero-art" aria-hidden="true">
              <div className="landing-hero-preview landing-hero-preview--sports">
                <div className="landing-browser-chrome">
                  <span className="landing-browser-dots"><i /><i /><i /></span>
                  <span className="landing-browser-address" />
                </div>
                <img src={deportivoImage} alt="" decoding="async" />
                <span className="landing-preview-label">{heroPreviewTitle('deportivo')}</span>
              </div>
              <div className="landing-hero-preview landing-hero-preview--admin">
                <div className="landing-browser-chrome">
                  <span className="landing-browser-dots"><i /><i /><i /></span>
                  <span className="landing-browser-address" />
                </div>
                <img src={administrativoImage} alt="" decoding="async" />
                <span className="landing-preview-label">{heroPreviewTitle('administrativo')}</span>
              </div>
              <div className="landing-hero-preview landing-hero-preview--portal">
                <span className="landing-phone-island" />
                <img src={portalHinchaImage} alt="" decoding="async" />
                <span className="landing-preview-label">{heroPreviewTitle('socio')}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-pilot landing-shell" id="piloto" aria-labelledby="pilot-title">
          <div className="landing-pilot-copy">
            <p className="landing-eyebrow">Cupos limitados</p>
            <h2 id="pilot-title">ClubDesk busca sus primeros clubes fundadores.</h2>
            <p>Estamos incorporando clubes para probar la plataforma en situaciones reales durante 30 días sin costo, con acompañamiento directo de nuestro equipo.</p>
          </div>
          <div className="landing-pilot-details">
            <ul>
              <li>Configuración inicial acompañada.</li>
              <li>Acceso a los módulos que el club necesita probar.</li>
              <li>Soporte directo y seguimiento durante el piloto.</li>
              <li>Feedback real para definir las próximas mejoras.</li>
            </ul>
            <p className="landing-pilot-note"><strong>Sin compromiso de contratación.</strong> Al finalizar, el club puede continuar con cualquiera de los planes publicados.</p>
            <a className="landing-button landing-button--pilot" href="#contacto" onClick={(event) => scrollToSection(event, 'contacto')}>Postular mi club al piloto</a>
          </div>
        </section>

        <section className="landing-section landing-shell" id="demos" aria-labelledby="demos-title">
          <div className="landing-section-heading">
            <p className="landing-eyebrow">Conocé la plataforma</p>
            <h2 id="demos-title">Explorá cada módulo en acción</h2>
            <p>Ingresá a las demos con datos de ejemplo y recorré cómo ClubDesk acompaña cada área de la institución durante la prueba de 30 días.</p>
          </div>
          <div className="landing-demo-grid">
            {modules.map((module, index) => (
              <article className="landing-demo-card" key={module.id} style={{ '--module-color': module.color } as LandingStyle}>
                <img src={module.image} alt="" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
                <div className="landing-demo-content">
                  <span className="landing-demo-mark" aria-hidden="true" />
                  <span className="landing-demo-chip">{module.id === 'administrativo' ? 'Comisión directiva' : module.id === 'deportivo' ? 'Cuerpo técnico' : 'Socios e hinchas'}</span>
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                  <ul>
                    {module.features.map((feature) => <li key={feature}>{feature}</li>)}
                  </ul>
                  <button type="button" onClick={() => actions.selectModule(module.id)}>Ingresar a la demo</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-shell landing-plans-section" id="planes" aria-labelledby="plans-title">
          <div className="landing-section-heading">
            <p className="landing-eyebrow">Precios post-piloto</p>
            <h2 id="plans-title">Elegí la solución para tu club</h2>
            <p>La prueba de 30 días es sin costo y sin compromiso. Estos precios muestran la continuidad del club después del piloto.</p>
          </div>
          <div className="landing-plans-grid">
            {plans.map((plan) => (
              <article className={`landing-plan landing-plan--${plan.tone}${plan.featured ? ' landing-plan--featured' : ''}`} key={plan.name}>
                {plan.featured && <span className="landing-plan-featured">Más elegido</span>}
                <div className="landing-plan-top">
                  <h3>{plan.name}</h3>
                  <p>{plan.audience}</p>
                  {plan.requirement && <span className="landing-plan-requirement">{plan.requirement}</span>}
                  <div className="landing-price-row"><strong>{plan.price}</strong><span>por mes</span></div>
                  <span className="landing-plan-postpiloto">Precio post-piloto</span>
                  {plan.priceNote && <p className="landing-price-note">{plan.priceNote}</p>}
                </div>
                <ul className="landing-plan-features">
                  {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
                <a className="landing-plan-cta" href={whatsappUrl(`Hola, quiero consultar por el plan ${plan.name} de ClubDesk para continuar después del piloto de 30 días.`)} target="_blank" rel="noreferrer">{plan.cta}</a>
              </article>
            ))}
          </div>
          <aside className="landing-institutional-badge" aria-label="Beneficio incluido">
            <span aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12v10H4V12" />
                <path d="M2 7h20v5H2z" />
                <path d="M12 22V7" />
                <path d="M12 7H7.5a2.5 2.5 0 1 1 2.45-3c.45 1.7 2.05 3 2.05 3Z" />
                <path d="M12 7h4.5a2.5 2.5 0 1 0-2.45-3C13.6 5.7 12 7 12 7Z" />
              </svg>
            </span>
            <p><strong>Con cualquier plan, te regalamos una web institucional.</strong></p>
          </aside>
        </section>

        <section className="landing-section landing-shell landing-case-study-section" id="ecommerce" aria-labelledby="ecommerce-title">
          <div className="landing-case-study-copy">
            <p className="landing-eyebrow landing-eyebrow--case-study">En producción · Caso real</p>
            <h2 id="ecommerce-title">E-commerce en producción.</h2>
            <p>Albo Shop demuestra cómo una tienda online propia puede ordenar el catálogo, presentar cada categoría y convertir la identidad del club en una experiencia de compra profesional.</p>
            <div className="landing-case-study-actions">
              <a className="landing-button landing-button--primary" href="https://alboshop.com.ar" target="_blank" rel="noreferrer">Ver sitio en vivo</a>
              <a className="landing-button landing-button--case" href={whatsappUrl('Hola, quiero consultar por un e-commerce como Albo Shop para mi club.')} target="_blank" rel="noreferrer">Quiero una tienda así</a>
            </div>
          </div>
          <figure className="landing-case-browser">
            <div className="landing-case-browser-frame">
              <div className="landing-case-browser-chrome" aria-hidden="true">
                <span className="landing-case-browser-dots"><i /><i /><i /></span>
                <span className="landing-case-browser-address">alboshop.com.ar</span>
              </div>
              <img src={alboShopScreenshot} alt="Página inicial de Albo Shop, la tienda online de Club Atlético Alvarado" loading="lazy" decoding="async" />
            </div>
          </figure>
          <aside className="landing-institutional-badge landing-ecommerce-badge" aria-label="Servicio adicional: el e-commerce se cotiza por separado y no está incluido en el piloto ni en los planes de gestión">
            <span aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </span>
            <p><strong>Servicio adicional: el e-commerce se cotiza por separado y no está incluido en el piloto ni en los planes de gestión.</strong></p>
          </aside>
        </section>

        <section className="landing-contact landing-shell" id="contacto" aria-labelledby="contact-title">
          <div className="landing-contact-intro">
            <p className="landing-eyebrow">Contacto</p>
            <h2 id="contact-title">Empezá con 30 días sin costo</h2>
            <p>Contanos qué necesita tu club: coordinamos el piloto de 30 días sin costo y, al terminar, el plan post-piloto que mejor se adapte. Te respondemos por WhatsApp.</p>
          </div>
          <form className="landing-contact-form" onSubmit={handleContactSubmit}>
            <p className="landing-contact-required"><span aria-hidden="true">*</span> Campos obligatorios</p>
            <div className="landing-contact-form-grid">
              <div className="landing-contact-field">
                <label htmlFor="contact-name">Nombre y apellido <span aria-hidden="true">*</span></label>
                <input id="contact-name" name="nombre" type="text" autoComplete="name" required />
              </div>
              <div className="landing-contact-field">
                <label htmlFor="contact-club">Club <span aria-hidden="true">*</span></label>
                <input id="contact-club" name="club" type="text" autoComplete="organization" required />
              </div>
              <div className="landing-contact-field">
                <label htmlFor="contact-email">Email <span aria-hidden="true">*</span></label>
                <input id="contact-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="landing-contact-field">
                <label htmlFor="contact-phone">Teléfono <span className="landing-contact-optional">Opcional</span></label>
                <input id="contact-phone" name="telefono" type="tel" autoComplete="tel" inputMode="tel" />
              </div>
            </div>
            <div className="landing-contact-field">
              <label htmlFor="contact-message">Consulta <span aria-hidden="true">*</span></label>
              <textarea id="contact-message" name="consulta" rows={5} autoComplete="off" aria-describedby="contact-message-help" required />
              <span className="landing-contact-help" id="contact-message-help">Contanos brevemente qué necesita tu club durante el piloto.</span>
            </div>
            <button className="landing-button landing-button--contact landing-contact-submit" type="submit">Enviar consulta por WhatsApp</button>
          </form>
        </section>
      </main>
    </div>
  );
}
