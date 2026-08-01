export default function MobileTopBar() {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: '#172a54',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Club Atlético Modelo</div>
      <div
        style={{
          color: '#aeb8d6',
          fontSize: 11,
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 20,
          padding: '4px 10px',
        }}
      >
        Demo pública
      </div>
    </div>
  );
}
