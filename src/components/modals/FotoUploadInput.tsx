import { useState, type ChangeEvent, type DragEvent } from 'react';

const iconCommon = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function CameraIcon() {
  return (
    <svg {...iconCommon}>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

function leerComoDataUrl(file: File, onLoaded: (dataUrl: string) => void) {
  if (!file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') onLoaded(reader.result);
  };
  reader.readAsDataURL(file);
}

export default function FotoUploadInput({
  foto,
  onFotoChange,
  onQuitar,
  label = 'foto',
}: {
  foto: string;
  onFotoChange: (dataUrl: string) => void;
  onQuitar: () => void;
  label?: string;
}) {
  const [arrastrando, setArrastrando] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) leerComoDataUrl(file, onFotoChange);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files?.[0];
    if (file) leerComoDataUrl(file, onFotoChange);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        data-testid="foto-dropzone"
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={handleDrop}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12, border: `1.5px dashed ${arrastrando ? '#172a54' : 'transparent'}`, background: arrastrando ? '#eef1f7' : 'transparent', transition: 'background .15s, border-color .15s' }}
      >
        <div style={{ width: 56, height: 56, borderRadius: 10, background: '#f5f7fb', border: '1px solid #e3e7ef', display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {foto ? <img src={foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <CameraIcon />}
        </div>
        <div>
          <div style={{ display: 'flex', gap: 8 }}>
            <label
              style={{ height: 34, padding: '0 14px', display: 'flex', alignItems: 'center', borderRadius: 8, border: '1px solid #d7dce6', background: '#fff', color: '#16203a', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
            >
              {foto ? `Cambiar ${label}` : `Subir ${label}`}
              <input type="file" accept="image/*" onChange={handleInputChange} style={{ display: 'none' }} />
            </label>
            {foto && (
              <button
                onClick={onQuitar}
                style={{ height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid #f3d3d8', background: '#fff', color: '#c1293c', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
              >
                Quitar
              </button>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: '#8b93a5', marginTop: 6 }}>{arrastrando ? `Soltá la ${label} acá` : `O arrastrá una imagen a esta zona`}</div>
        </div>
      </div>
    </div>
  );
}
