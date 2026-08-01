import { useApp } from '../../state/AppContext';
import ModalOverlay from './ModalOverlay';

export default function MediosPagoModal() {
  const { state, actions } = useApp();
  if (!state.showMediosPago) return null;

  return (
    <ModalOverlay onClose={actions.closeMediosPago} maxWidth={480} cardStyle={{ maxHeight: '90vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: '#16203a' }}>Cómo pueden pagar los socios</div>
        <div onClick={actions.closeMediosPago} style={{ cursor: 'pointer', color: '#9aa2b1', fontSize: 20, lineHeight: 1, padding: 4 }}>
          ×
        </div>
      </div>
      <div style={{ fontSize: 13.5, color: '#6b7488', marginBottom: 18, lineHeight: 1.5 }}>
        El club puede aceptar la cuota por distintos medios. La tarjeta de crédito es la opción que más simplifica la cobranza.
      </div>

      <div style={{ border: '2px solid #172a54', background: '#f5f7fb', borderRadius: 12, padding: '16px 18px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a' }}>Tarjeta de crédito — débito automático</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#172a54', padding: '4px 10px', borderRadius: 20 }}>Recomendado</div>
        </div>
        <div style={{ fontSize: 13, color: '#4b5468', lineHeight: 1.5 }}>
          El socio carga su tarjeta una sola vez y la cuota se descuenta sola cada mes en la fecha de vencimiento. Menos
          morosidad, menos llamados, menos planillas.
        </div>
      </div>

      <div style={{ border: '1px solid #e3e7ef', borderRadius: 12, padding: '16px 18px', marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 6 }}>Transferencia bancaria</div>
        <div style={{ fontSize: 13, color: '#4b5468', lineHeight: 1.5 }}>
          El socio transfiere manualmente y la secretaría concilia el pago contra el padrón.
        </div>
      </div>

      <div style={{ border: '1px solid #e3e7ef', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16203a', marginBottom: 6 }}>Efectivo en secretaría</div>
        <div style={{ fontSize: 13, color: '#4b5468', lineHeight: 1.5 }}>
          El socio se acerca a pagar en persona y se registra al momento en Cobranza.
        </div>
      </div>

      <button
        onClick={actions.closeMediosPago}
        style={{ width: '100%', height: 46, border: 'none', borderRadius: 9, background: '#172a54', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
      >
        Entendido
      </button>
    </ModalOverlay>
  );
}
