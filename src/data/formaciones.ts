import type { Formacion } from '../types';

export const PRIMERA_433_FORMATION_ID = 9001;
export const PRIMERA_442_FORMATION_ID = 9002;
export const CANONICAL_DEMO_FORMATIONS_SEED_VERSION = 1;

export const canonicalPrimeraFormations: Formacion[] = [
  {
    id: PRIMERA_433_FORMATION_ID,
    equipoId: 1,
    nombre: 'Primera 4-3-3',
    sistema: '4-3-3',
    jugadores: [
      { jugadorId: 1, zona: 'titular', x: 50, y: 88, dorsal: '1' }, { jugadorId: 4, zona: 'titular', x: 18, y: 68, dorsal: '3' },
      { jugadorId: 5, zona: 'titular', x: 39, y: 70, dorsal: '2' }, { jugadorId: 6, zona: 'titular', x: 61, y: 70, dorsal: '6' },
      { jugadorId: 10, zona: 'titular', x: 82, y: 68, dorsal: '4' }, { jugadorId: 11, zona: 'titular', x: 27, y: 47, dorsal: '8' },
      { jugadorId: 12, zona: 'titular', x: 50, y: 43, dorsal: '5' }, { jugadorId: 13, zona: 'titular', x: 73, y: 47, dorsal: '10' },
      { jugadorId: 2, zona: 'titular', x: 20, y: 24, dorsal: '11' }, { jugadorId: 7, zona: 'titular', x: 50, y: 18, dorsal: '9' },
      { jugadorId: 15, zona: 'titular', x: 80, y: 24, dorsal: '7' }, { jugadorId: 14, zona: 'suplente', x: 0, y: 0, dorsal: '16' },
      { jugadorId: 16, zona: 'suplente', x: 0, y: 0, dorsal: '17' },
    ],
    roles: { capitan: 12 },
    camiseta: { estilo: 'lisa', principal: '#087f75', secundaria: '#ffffff', texto: '#ffffff' },
  },
  {
    id: PRIMERA_442_FORMATION_ID,
    equipoId: 1,
    nombre: 'Primera 4-4-2',
    sistema: '4-4-2',
    jugadores: [
      { jugadorId: 1, zona: 'titular', x: 50, y: 88, dorsal: '1' }, { jugadorId: 4, zona: 'titular', x: 18, y: 68, dorsal: '3' },
      { jugadorId: 5, zona: 'titular', x: 39, y: 70, dorsal: '2' }, { jugadorId: 6, zona: 'titular', x: 61, y: 70, dorsal: '6' },
      { jugadorId: 10, zona: 'titular', x: 82, y: 68, dorsal: '4' }, { jugadorId: 11, zona: 'titular', x: 18, y: 43, dorsal: '8' },
      { jugadorId: 12, zona: 'titular', x: 39, y: 45, dorsal: '5' }, { jugadorId: 13, zona: 'titular', x: 61, y: 45, dorsal: '10' },
      { jugadorId: 16, zona: 'titular', x: 82, y: 43, dorsal: '17' }, { jugadorId: 2, zona: 'titular', x: 35, y: 22, dorsal: '11' },
      { jugadorId: 7, zona: 'titular', x: 65, y: 22, dorsal: '9' }, { jugadorId: 14, zona: 'suplente', x: 0, y: 0, dorsal: '16' },
      { jugadorId: 15, zona: 'suplente', x: 0, y: 0, dorsal: '7' },
    ],
    roles: { capitan: 12 },
    camiseta: { estilo: 'lisa', principal: '#087f75', secundaria: '#ffffff', texto: '#ffffff' },
  },
];

export function cloneFormacion(formacion: Formacion): Formacion {
  return {
    ...formacion,
    jugadores: formacion.jugadores.map((jugador) => ({ ...jugador })),
    roles: { ...formacion.roles },
    camiseta: { ...formacion.camiseta },
  };
}

export function cloneCanonicalPrimeraFormations() {
  return canonicalPrimeraFormations.map(cloneFormacion);
}

export function migrateCanonicalPrimeraFormations(formaciones: Formacion[], seedVersion: unknown) {
  if (seedVersion === CANONICAL_DEMO_FORMATIONS_SEED_VERSION) {
    return { formaciones, seeded: false };
  }

  const existingIds = new Set(formaciones.map((formacion) => formacion.id));
  const missingCanonicalFormations = cloneCanonicalPrimeraFormations().filter((formacion) => !existingIds.has(formacion.id));

  return {
    formaciones: [...formaciones, ...missingCanonicalFormations],
    seeded: missingCanonicalFormations.length > 0,
  };
}
