import ClubEscudo from './ClubEscudo';
import ModuleQuickNav from './ModuleQuickNav';

export default function MobileTopBar() {
  return (
    <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#172a54', padding: '14px 16px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <ClubEscudo size={30} />
        <div>
          <div style={{ color: '#8fa0cc', fontWeight: 800, fontSize: 9.5, letterSpacing: '.06em' }}>CLUBDESK</div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Club Atlético Modelo</div>
        </div>
      </div>
      <ModuleQuickNav
        current="administrativo"
        direction="row"
        gap={7}
        wrapperStyle={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.16)' }}
        buttonStyle={{ color: '#fff', fontSize: 10, border: '1px solid rgba(255,255,255,.4)', borderRadius: 14, padding: '7px 8px', background: 'rgba(255,255,255,.1)', cursor: 'pointer', fontWeight: 700 }}
        homeStyle={{ color: '#172a54', fontSize: 10, border: '1px solid #fff', borderRadius: 14, padding: '7px 8px', background: '#fff', cursor: 'pointer', fontWeight: 800 }}
      />
    </div>
  );
}
