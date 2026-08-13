import { useState } from 'react';
import ModalOverlay from './modals/ModalOverlay';

interface Paso {
  titulo: string;
  cuerpo: string[];
}

const PASOS: Paso[] = [
  {
    titulo: 'Apertura',
    cuerpo: [
      'Esto que van a ver es ClubDesk: un sistema para que el club deje de manejar socios, cuotas y reservas por Excel y WhatsApp, y tenga todo en un solo lugar.',
      'Lo que están viendo es un prototipo funcional con datos de ejemplo — la idea es mostrar el flujo completo, no una maqueta estática.',
    ],
  },
  {
    titulo: '1. Selector de módulos',
    cuerpo: [
      'ClubDesk tiene tres frentes: el panel administrativo para la comisión directiva, gestión deportiva para el cuerpo técnico, y el portal para socios e hinchas.',
      'Arrancá siempre por acá y entrá al Panel Administrativo.',
    ],
  },
  {
    titulo: '2. Panel Administrativo — Inicio',
    cuerpo: [
      'Mostrá el dashboard: socios totales, al día / por vencer / morosos, ingresos vs egresos del mes.',
      'Frase clave: "Esto que ven acá, hoy alguien se lo arma a mano en una planilla cada fin de mes. Acá se actualiza solo."',
    ],
  },
  {
    titulo: '3. Padrón y Cuotas',
    cuerpo: [
      'Abrí un socio, mostrá el estado de cuenta, medios de pago, débito automático.',
      'Gancho: "¿Cuántos de los morosos de hoy en su club son porque nadie se dio cuenta a tiempo?"',
    ],
  },
  {
    titulo: '4. Finanzas — Ingresos, Egresos, Buffet, Tienda',
    cuerpo: [
      'Mostrá que todo entra al mismo balance: cuotas, buffet, tienda, sponsors.',
      'Frase clave: "No importa de dónde entra la plata, todo termina en un solo número: el balance del mes."',
    ],
  },
  {
    titulo: '5. Reservas de canchas',
    cuerpo: [
      'Mostrá la agenda y un turno reservado.',
      'Conectá con el portal: "Esto mismo lo puede reservar el socio desde el celular, sin que nadie atienda el teléfono."',
    ],
  },
  {
    titulo: '6. Gestión Deportiva',
    cuerpo: [
      'Plantel, formaciones, próximo partido, jugadores lesionados.',
      'Gancho para clubes con fútbol infantil/juvenil: "El técnico entra acá, no les llama a ustedes para saber quién está lesionado."',
    ],
  },
  {
    titulo: '7. Portal del Socio',
    cuerpo: [
      'Login → Inicio del portal → Mis reservas (mostrando el historial ya cargado) → Carnet digital con QR.',
      'Frase clave: "Esto es lo que ve el socio en su teléfono. Reserva, paga, se entera de las novedades y entra a la cancha con un QR. Cero llamados a la secretaría."',
    ],
  },
  {
    titulo: 'Cierre',
    cuerpo: [
      '"Esto que vieron es el prototipo — el siguiente paso es cargarlo con los datos reales de ustedes y probarlo dos semanas con su comisión directiva, sin costo. Si les sirve, seguimos. ¿Les parece que arranquemos con eso?"',
    ],
  },
];

export default function DemoGuia() {
  const [activa, setActiva] = useState(false);
  const [paso, setPaso] = useState(0);

  const iniciar = () => { setPaso(0); setActiva(true); };
  const detener = () => setActiva(false);
  const siguiente = () => {
    if (paso >= PASOS.length - 1) { setActiva(false); return; }
    setPaso((p) => p + 1);
  };

  return (
    <>
      <button
        onClick={activa ? detener : iniciar}
        className="no-print"
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 60,
          padding: '10px 16px', borderRadius: 24, border: 'none', cursor: 'pointer',
          background: activa ? '#c0362c' : '#172a54', color: '#fff', fontWeight: 700, fontSize: 13,
          boxShadow: '0 8px 20px rgba(0,0,0,.25)',
        }}
      >
        {activa ? 'Desactivar guía' : 'Guía de demo'}
      </button>

      {activa && (
        <ModalOverlay onClose={detener} maxWidth={420} ariaLabel="Guía de demo">
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', color: '#8b93a5', marginBottom: 6 }}>
            PASO {paso + 1} DE {PASOS.length}
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: '#16203a', margin: '0 0 12px' }}>{PASOS[paso].titulo}</h2>
          {PASOS[paso].cuerpo.map((linea, i) => (
            <p key={i} style={{ fontSize: 14, color: '#3c4457', lineHeight: 1.55, margin: '0 0 10px' }}>{linea}</p>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              onClick={detener}
              style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: '1px solid #dde1ea', background: '#fff', color: '#6b7488', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}
            >
              Cerrar
            </button>
            <button
              onClick={siguiente}
              style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}
            >
              {paso >= PASOS.length - 1 ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </ModalOverlay>
      )}
    </>
  );
}
