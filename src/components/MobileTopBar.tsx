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
        gap={8}
        wrapperStyle={{ marginTop: 10 }}
        buttonStyle={{ color: '#fff', fontSize: 11, border: '1px solid rgba(255,255,255,.25)', borderRadius: 20, padding: '5px 10px', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}
        homeStyle={{ color: '#172a54', fontSize: 11, border: '1px solid rgba(255,255,255,.6)', borderRadius: 20, padding: '5px 10px', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
      />
    </div>
  );
}
