import type { CSSProperties } from 'react';
import { useApp } from '../state/AppContext';
import { MODULE_LABELS, OTHER_MODULES } from '../lib/modulos';
import type { Modulo } from '../types';

export default function ModuleQuickNav({
  current,
  direction = 'column',
  gap = 8,
  buttonStyle,
  homeStyle,
  buttonClassName,
  homeClassName,
  wrapperStyle,
  wrapperClassName,
}: {
  current: Modulo;
  direction?: 'row' | 'column';
  gap?: number;
  buttonStyle?: CSSProperties;
  homeStyle?: CSSProperties;
  buttonClassName?: string;
  homeClassName?: string;
  wrapperStyle?: CSSProperties;
  wrapperClassName?: string;
}) {
  const { actions } = useApp();
  return (
    <div
      className={wrapperClassName}
      style={{ display: 'flex', flexDirection: direction, gap, flexWrap: direction === 'row' ? 'wrap' : 'nowrap', ...wrapperStyle }}
    >
      {OTHER_MODULES[current].map((id) => (
        <button
          key={id}
          type="button"
          className={buttonClassName}
          style={direction === 'row' ? { ...buttonStyle, flex: '1 1 calc(50% - 4px)', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip', textAlign: 'center' } : buttonStyle}
          onClick={() => actions.selectModule(id)}
        >
          Ver {MODULE_LABELS[id]}
        </button>
      ))}
      <button
        type="button"
        className={homeClassName ?? buttonClassName}
        style={direction === 'row' ? { ...(homeStyle ?? buttonStyle), flex: '1 1 100%', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip', textAlign: 'center' } : (homeStyle ?? buttonStyle)}
        onClick={actions.showModuleSelector}
      >
        Volver al inicio
      </button>
    </div>
  );
}
