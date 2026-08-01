import { useApp } from '../state/AppContext';

export default function Login() {
  const { state, actions } = useApp();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(180deg,#101d3f 0%,#101d3f 42%,#f5f7fb 42%)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em' }}>Club Atlético Modelo</div>
          <div style={{ color: '#aeb8d6', fontSize: 14, marginTop: 4 }}>Panel de administración</div>
        </div>
        <form
          onSubmit={actions.onLogin}
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '28px 24px',
            boxShadow: '0 20px 40px rgba(16,24,40,0.18)',
            animation: 'fadeIn .4s ease',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 18, color: '#16203a', marginBottom: 2 }}>Ingresar</div>
          <div style={{ fontSize: 13, color: '#6b7488', marginBottom: 20 }}>Demo pública — no hace falta que sea exacto</div>

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#16203a', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={state.loginEmail}
            onChange={(e) => actions.setLoginEmail(e.target.value)}
            placeholder="tesorero@clubmodelo.ar"
            style={{
              width: '100%',
              height: 46,
              border: '1px solid #e3e7ef',
              borderRadius: 9,
              padding: '0 14px',
              fontSize: 15,
              marginBottom: 14,
              outline: 'none',
              color: '#16203a',
            }}
          />

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#16203a', marginBottom: 6 }}>Contraseña</label>
          <input
            type="password"
            value={state.loginPass}
            onChange={(e) => actions.setLoginPass(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%',
              height: 46,
              border: '1px solid #e3e7ef',
              borderRadius: 9,
              padding: '0 14px',
              fontSize: 15,
              marginBottom: 20,
              outline: 'none',
              color: '#16203a',
            }}
          />

          <button
            type="submit"
            style={{
              width: '100%',
              height: 48,
              background: '#172a54',
              color: '#fff',
              border: 'none',
              borderRadius: 9,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#22386b')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#172a54')}
          >
            Ingresar a la demo
          </button>
          <div style={{ textAlign: 'center', fontSize: 12, color: '#9aa2b1', marginTop: 16, lineHeight: 1.5 }}>
            Cualquier email y contraseña te dejan entrar.
            <br />
            Club, socios y montos son ficticios.
          </div>
        </form>
      </div>
    </div>
  );
}
