import { useState } from 'react';
import type { ReactNode, CSSProperties, MouseEvent } from 'react';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: (e: MouseEvent) => void;
  sub?: boolean;
  trailing?: ReactNode;
}

export default function SidebarItem({ icon, label, active, onClick, sub, trailing }: SidebarItemProps) {
  const [hover, setHover] = useState(false);

  const style: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: sub ? 10 : 12,
    padding: sub ? '9px 12px 9px 30px' : '12px 12px',
    borderRadius: 9,
    cursor: 'pointer',
    background: hover ? '#223868' : active ? '#22386b' : 'transparent',
    color: active ? '#fff' : '#c3cbe4',
  };

  return (
    <div style={style} onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {icon}
      <span style={{ fontSize: sub ? 13 : 14, fontWeight: 600, flex: trailing ? 1 : undefined }}>{label}</span>
      {trailing}
    </div>
  );
}
