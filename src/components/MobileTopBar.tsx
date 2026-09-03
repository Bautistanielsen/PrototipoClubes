import ClubEscudo from './ClubEscudo';
import ExitInicioButton from './ExitInicioButton';

export default function MobileTopBar() {
  return (
    <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#172a54', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 9 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <ClubEscudo size={30} />
        <div>
          <div style={{ color: '#8fa0cc', fontWeight: 800, fontSize: 9.5, letterSpacing: '.06em' }}>CLUBDESK</div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Club Atlético Modelo</div>
        </div>
      </div>
      <ExitInicioButton />
    </div>
  );
}
