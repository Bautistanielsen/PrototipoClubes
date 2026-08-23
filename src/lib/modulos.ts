import type { Modulo } from '../types';

export const MODULE_LABELS: Record<Modulo, string> = {
  administrativo: 'Panel Administrativo',
  deportivo: 'Gestión Deportiva',
  socio: 'Portal del Hincha',
};

export const OTHER_MODULES: Record<Modulo, Modulo[]> = {
  administrativo: ['deportivo', 'socio'],
  deportivo: ['administrativo', 'socio'],
  socio: ['administrativo', 'deportivo'],
};
