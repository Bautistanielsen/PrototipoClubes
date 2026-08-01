import type { CSSProperties, ReactNode, MouseEvent } from 'react';

interface ModalOverlayProps {
  onClose: () => void;
  maxWidth: number;
  children: ReactNode;
  cardStyle?: CSSProperties;
}

export default function ModalOverlay({ onClose, maxWidth, children, cardStyle }: ModalOverlayProps) {
  const stop = (e: MouseEvent) => e.stopPropagation();
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(16,20,35,0.45)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={stop}
        style={{
          width: '100%',
          maxWidth,
          background: '#fff',
          borderRadius: 16,
          padding: '26px 24px',
          animation: 'fadeIn .2s ease',
          ...cardStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
}
