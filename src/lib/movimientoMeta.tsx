import type { ReactNode } from 'react';

export interface FilaMeta {
  color: string;
  bg: string;
  icon: ReactNode;
}

export const iconCommon = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const CATEGORIA_META: Record<string, FilaMeta> = {
  'Cuerpo técnico': {
    color: '#c1293c',
    bg: '#fbe6e9',
    icon: <svg {...iconCommon}><rect x="6" y="4" width="12" height="16" rx="2" /><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" /><path d="M9 10h6M9 14h6" /></svg>,
  },
  Jugadores: {
    color: '#2f6fb0',
    bg: '#eaf2fa',
    icon: <svg {...iconCommon}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /></svg>,
  },
  'Mantenimiento de predio': {
    color: '#a15c00',
    bg: '#fdf0dc',
    icon: <svg {...iconCommon}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8Z" /></svg>,
  },
  'Servicios (luz, agua, gas)': {
    color: '#0f7d8b',
    bg: '#e3f3f5',
    icon: <svg {...iconCommon}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>,
  },
  'Insumos y equipamiento': {
    color: '#6c4fa1',
    bg: '#f1ecf9',
    icon: <svg {...iconCommon}><path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>,
  },
  Otros: {
    color: '#6b7280',
    bg: '#f1f2f4',
    icon: <svg {...iconCommon}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></svg>,
  },
};

export const MEDIO_META: Record<string, FilaMeta> = {
  Efectivo: {
    color: '#1a7d43',
    bg: '#e5f6ea',
    icon: <svg {...iconCommon}><rect x="2" y="6" width="20" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.8" /><path d="M6 9v.01M18 15v.01" /></svg>,
  },
  Transferencia: {
    color: '#2f6fb0',
    bg: '#eaf2fa',
    icon: <svg {...iconCommon}><path d="m12 3 9 5H3l9-5Z" /><path d="M5 10v8M10 10v8M14 10v8M19 10v8" /><path d="M3 21h18" /></svg>,
  },
  MercadoPago: {
    color: '#0f7d8b',
    bg: '#e3f3f5',
    icon: <svg {...iconCommon}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><circle cx="16" cy="14" r="1.3" fill="currentColor" stroke="none" /></svg>,
  },
  Tarjeta: {
    color: '#6c4fa1',
    bg: '#f1ecf9',
    icon: <svg {...iconCommon}><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /><path d="M6 15h4" /></svg>,
  },
};
