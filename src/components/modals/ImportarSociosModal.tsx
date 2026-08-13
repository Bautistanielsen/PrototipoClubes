import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useApp } from '../../state/AppContext';
import ModalOverlay from './ModalOverlay';

export default function ImportarSociosModal() {
  const { state, actions } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  if (!state.showImportarSociosModal) return null;

  const resultado = state.importarSociosResultado;

  const elegirArchivo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => actions.procesarArchivoSocios(String(reader.result || ''), file.name);
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  return (
    <ModalOverlay onClose={actions.closeImportarSociosModal} maxWidth={520} ariaLabel="Importar socios desde archivo">
      <div style={{ fontSize: 19, fontWeight: 800, color: '#16203a', marginBottom: 5 }}>Importar socios</div>
      <p style={{ color: '#6b7488', fontSize: 13, lineHeight: 1.45, margin: '0 0 16px' }}>
        Subí un archivo CSV con el padrón del club. Necesita al menos las columnas <strong>Nombre</strong> y <strong>Apellido</strong>; opcionalmente
        Teléfono, DNI, Domicilio, Email y Categoría. Si tenés el archivo en Excel, abrilo y guardalo como "CSV (delimitado por comas)" antes de subirlo.
      </p>

      <button
        onClick={() => inputRef.current?.click()}
        style={{ width: '100%', height: 46, border: '1px dashed #b9c2d6', borderRadius: 9, background: '#f7f8fb', color: '#16203a', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', marginBottom: 14 }}
      >
        {state.importarSociosNombreArchivo ? `Archivo: ${state.importarSociosNombreArchivo}` : 'Elegir archivo CSV...'}
      </button>
      <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={elegirArchivo} style={{ display: 'none' }} aria-label="Archivo CSV de socios" />

      {resultado && (
        <div style={{ marginBottom: 18 }}>
          {resultado.filas.length > 0 && (
            <div style={{ background: '#e5f6ea', color: '#1a7d43', borderRadius: 9, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
              {resultado.filas.length} socio{resultado.filas.length === 1 ? '' : 's'} listo{resultado.filas.length === 1 ? '' : 's'} para importar.
            </div>
          )}
          {resultado.errores.length > 0 && (
            <div style={{ background: '#fdf0dc', color: '#a15c00', borderRadius: 9, padding: '10px 14px', fontSize: 12.5, maxHeight: 140, overflowY: 'auto' }}>
              {resultado.errores.map((err, i) => <div key={i}>{err}</div>)}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={actions.closeImportarSociosModal} style={secondaryButton}>Cancelar</button>
        <button
          onClick={actions.confirmarImportacionSocios}
          disabled={!resultado || resultado.filas.length === 0}
          style={{ ...primaryButton, opacity: !resultado || resultado.filas.length === 0 ? 0.5 : 1, cursor: !resultado || resultado.filas.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          {resultado && resultado.filas.length > 0 ? `Importar ${resultado.filas.length} socio${resultado.filas.length === 1 ? '' : 's'}` : 'Importar'}
        </button>
      </div>
    </ModalOverlay>
  );
}

const secondaryButton = { flex: 1, height: 44, border: '1px solid #d7dce6', borderRadius: 9, background: '#fff', color: '#16203a', fontWeight: 700, cursor: 'pointer' };
const primaryButton = { flex: 1, height: 44, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, cursor: 'pointer' };
