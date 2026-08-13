import { describe, expect, it } from 'vitest';
import { interpretarCSVSocios, parseCSV } from './importSocios';
import type { Categoria } from '../types';

const categorias: Categoria[] = [
  { id: 1, nombre: 'General', monto: 12000 },
  { id: 2, nombre: 'Jubilados', monto: 6000 },
];

describe('parseCSV', () => {
  it('parsea filas separadas por punto y coma', () => {
    const filas = parseCSV('Nombre;Apellido\nJuan;Pérez\nAna;Gómez');
    expect(filas).toEqual([['Nombre', 'Apellido'], ['Juan', 'Pérez'], ['Ana', 'Gómez']]);
  });

  it('parsea filas separadas por coma cuando no hay punto y coma', () => {
    const filas = parseCSV('Nombre,Apellido\nJuan,Pérez');
    expect(filas).toEqual([['Nombre', 'Apellido'], ['Juan', 'Pérez']]);
  });

  it('respeta campos entre comillas con separadores y comillas escapadas', () => {
    const filas = parseCSV('Nombre;Apodo\n"Juan";"El ""Colo"", Pérez"');
    expect(filas).toEqual([['Nombre', 'Apodo'], ['Juan', 'El "Colo", Pérez']]);
  });

  it('ignora el BOM inicial', () => {
    const filas = parseCSV('﻿Nombre;Apellido\nJuan;Pérez');
    expect(filas[0]).toEqual(['Nombre', 'Apellido']);
  });
});

describe('interpretarCSVSocios', () => {
  it('mapea columnas Nombre/Apellido/Telefono con valores por defecto', () => {
    const resultado = interpretarCSVSocios('Nombre;Apellido;Telefono\nJuan;Pérez;1122334455', categorias);
    expect(resultado.errores).toEqual([]);
    expect(resultado.filas).toEqual([
      { nombre: 'Juan', apellido: 'Pérez', telefono: '1122334455', dni: undefined, domicilio: undefined, email: undefined, categoriaId: 1 },
    ]);
  });

  it('reconoce encabezados con acentos, mayúsculas y alias', () => {
    const resultado = interpretarCSVSocios('NOMBRE;APELLIDO;CELULAR;CATEGORÍA\nAna;Gómez;1155667788;Jubilados', categorias);
    expect(resultado.filas).toEqual([
      { nombre: 'Ana', apellido: 'Gómez', telefono: '1155667788', dni: undefined, domicilio: undefined, email: undefined, categoriaId: 2 },
    ]);
  });

  it('omite filas sin nombre o apellido y reporta el error', () => {
    const resultado = interpretarCSVSocios('Nombre;Apellido\nJuan;\n;Pérez\nAna;Gómez', categorias);
    expect(resultado.filas).toHaveLength(1);
    expect(resultado.filas[0].nombre).toBe('Ana');
    expect(resultado.errores).toHaveLength(2);
  });

  it('devuelve error si faltan las columnas obligatorias', () => {
    const resultado = interpretarCSVSocios('Telefono\n1122334455', categorias);
    expect(resultado.filas).toEqual([]);
    expect(resultado.errores[0]).toMatch(/Nombre.*Apellido/);
  });

  it('usa la primera categoría como default cuando no hay columna de categoría', () => {
    const resultado = interpretarCSVSocios('Nombre;Apellido\nJuan;Pérez', categorias);
    expect(resultado.filas[0].categoriaId).toBe(1);
  });

  it('devuelve el archivo vacío como error', () => {
    const resultado = interpretarCSVSocios('', categorias);
    expect(resultado.filas).toEqual([]);
    expect(resultado.errores).toEqual(['El archivo está vacío.']);
  });
});
