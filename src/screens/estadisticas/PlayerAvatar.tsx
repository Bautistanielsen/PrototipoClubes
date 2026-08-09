import { useState } from 'react';
import { initials } from './types';

export default function PlayerAvatar({ name, photo }: { name: string; photo?: string }) {
  const [failed, setFailed] = useState(false);
  if (!photo || failed) return <span className="statistics-avatar statistics-avatar-fallback" aria-label={`Iniciales de ${name}`}>{initials(name)}</span>;
  return <img className="statistics-avatar" src={photo} alt={`Foto de ${name}`} onError={() => setFailed(true)} />;
}
