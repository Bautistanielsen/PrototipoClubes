import { useApp } from '../state/AppContext';
import type { CSSProperties } from 'react';

type ExitInicioTone = 'ghost' | 'navy' | 'teal';

const TONE_STYLES: Record<ExitInicioTone, CSSProperties> = {
  ghost: { border: '1px solid rgba(255,255,255,.4)', background: 'rgba(255,255,255,.12)', color: '#fff' },
  navy: { border: '1px solid #172a54', background: '#172a54', color: '#fff' },
  teal: { border: '1px solid #087f75', background: '#087f75', color: '#fff' },
};

const TONE_FOCUS: Record<ExitInicioTone, string> = {
  ghost: 'rgba(255,255,255,.85)',
  navy: 'rgba(39,116,184,.55)',
  teal: 'rgba(8,127,117,.5)',
};

export default function ExitInicioButton({ tone = 'ghost', className = '' }: { tone?: ExitInicioTone; className?: string }) {
  const { actions } = useApp();
  const style: CSSProperties = {
    boxSizing: 'border-box',
    placeItems: 'center',
    width: 'auto',
    minWidth: 44,
    height: 44,
    flex: '0 0 auto',
    padding: '0 12px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1,
    cursor: 'pointer',
    ...TONE_STYLES[tone],
    '--exit-focus': TONE_FOCUS[tone],
  } as CSSProperties;
  return (
    <button
      type="button"
      className={`exit-inicio-btn ${className}`.trim()}
      style={style}
      title="Volver al inicio"
      aria-label="Volver al inicio"
      onClick={actions.showModuleSelector}
    >
      <span>Inicio</span>
    </button>
  );
}