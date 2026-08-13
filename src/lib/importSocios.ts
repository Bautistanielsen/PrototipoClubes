import type { Categoria } from '../types';

export interface FilaImportacionSocio {
  nombre: string;
  apellido: string;
  telefono: string;
  dni?: string;
  domicilio?: string;
  email?: string;
  categoriaId: number;
}

export interface ResultadoImportacionSocios {
  filas: FilaImportacionSocio[];
  errores: string[];
}

function normalizarTexto(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function detectarSeparador(primeraLinea: string): string {
  const puntoYComa = (primeraLinea.match(/;/g) || []).length;
  const coma = (primeraLinea.match(/,/g) || []).length;
  return puntoYComa >= coma ? ';' : ',';
}

/** Parser CSV simple con soporte de campos entre comillas (incluye comillas escapadas ""). */
export function parseCSV(texto: string): string[][] {
  const limpio = texto.replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const primeraLinea = limpio.split('\n')[0] || '';
  const separador = detectarSeparador(primeraLinea);
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = '';
  let entreComillas = false;

  for (let i = 0; i < limpio.length; i++) {
    const c = limpio[i];
    if (entreComillas) {
      if (c === '"') {
        if (limpio[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          entreComillas = false;
        }
      } else {
        campo += c;
      }
    } else if (c === '"') {
      entreComillas = true;
    } else if (c === separador) {
      fila.push(campo);
      campo = '';
    } else if (c === '\n') {
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = '';
    } else {
      campo += c;
    }
  }
  if (campo.length > 0 || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas.filter((f) => f.some((v) => v.trim() !== ''));
}

const ALIAS_COLUMNAS = {
  nombre: ['nombre'],
  apellido: ['apellido'],
  telefono: ['telefono', 'tel', 'celular', 'whatsapp'],
  dni: ['dni', 'documento'],
  domicilio: ['domicilio', 'direccion'],
  email: ['email', 'correo', 'mail'],
  categoria: ['categoria', 'categoria de cuota'],
} as const;

function indiceColumna(headers: string[], claves: readonly string[]): number {
  return headers.findIndex((h) => claves.includes(normalizarTexto(h)));
}

/**
 * Interpreta un CSV de socios con encabezados flexibles (case/acentos-insensitive).
 * Requiere columnas "Nombre" y "Apellido"; el resto es opcional con valores por defecto.
 */
export function interpretarCSVSocios(texto: string, categorias: Categoria[]): ResultadoImportacionSocios {
  const filas = parseCSV(texto);
  if (filas.length === 0) return { filas: [], errores: ['El archivo está vacío.'] };

  const headers = filas[0].map(normalizarTexto);
  const iNombre = indiceColumna(headers, ALIAS_COLUMNAS.nombre);
  const iApellido = indiceColumna(headers, ALIAS_COLUMNAS.apellido);
  const iTelefono = indiceColumna(headers, ALIAS_COLUMNAS.telefono);
  const iDni = indiceColumna(headers, ALIAS_COLUMNAS.dni);
  const iDomicilio = indiceColumna(headers, ALIAS_COLUMNAS.domicilio);
  const iEmail = indiceColumna(headers, ALIAS_COLUMNAS.email);
  const iCategoria = indiceColumna(headers, ALIAS_COLUMNAS.categoria);

  if (iNombre === -1 || iApellido === -1) {
    return { filas: [], errores: ['El archivo necesita al menos las columnas "Nombre" y "Apellido".'] };
  }

  const categoriaDefaultId = categorias[0]?.id ?? 0;
  const filasValidas: FilaImportacionSocio[] = [];
  const errores: string[] = [];

  for (let i = 1; i < filas.length; i++) {
    const fila = filas[i];
    const nombre = (fila[iNombre] || '').trim();
    const apellido = (fila[iApellido] || '').trim();
    if (!nombre || !apellido) {
      errores.push(`Fila ${i + 1}: falta nombre o apellido, se omitió.`);
      continue;
    }
    const nombreCategoria = iCategoria !== -1 ? (fila[iCategoria] || '').trim() : '';
    const categoriaId = nombreCategoria
      ? categorias.find((c) => normalizarTexto(c.nombre) === normalizarTexto(nombreCategoria))?.id ?? categoriaDefaultId
      : categoriaDefaultId;

    filasValidas.push({
      nombre,
      apellido,
      telefono: iTelefono !== -1 ? (fila[iTelefono] || '').trim() : '',
      dni: iDni !== -1 ? (fila[iDni] || '').trim() || undefined : undefined,
      domicilio: iDomicilio !== -1 ? (fila[iDomicilio] || '').trim() || undefined : undefined,
      email: iEmail !== -1 ? (fila[iEmail] || '').trim() || undefined : undefined,
      categoriaId,
    });
  }

  return { filas: filasValidas, errores };
}
