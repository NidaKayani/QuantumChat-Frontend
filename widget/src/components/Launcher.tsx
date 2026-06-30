import { useWidget } from '../context/WidgetContext';
import { Logo } from './ui/Logo';

const positionStyles: Record<string, React.CSSProperties> = {
  'bottom-right': { bottom: 28, right: 28 },
  'bottom-left': { bottom: 28, left: 28 },
  'top-right': { top: 28, right: 28 },
  'top-left': { top: 28, left: 28 },
};

export function Launcher() {
  const { state, dispatch } = useWidget();
  const position = state.branding.position || 'bottom-right';

  if (state.isOpen) return null;

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: 'SET_OPEN', payload: true })}
      aria-label="Open Quantum Chat"
      className="qc-launcher-btn"
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 22px',
        color: '#fff',
        border: 'none',
        borderRadius: 50,
        cursor: 'pointer',
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: '-0.01em',
      }}
    >
      <Logo size={26} logoUrl={state.branding.logoUrl} alt={state.websiteName} style={{ boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)' }} />
      Messages
      {state.unreadCount > 0 && (
        <span
          style={{
            background: '#EF4444',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 12,
            padding: '2px 8px',
            minWidth: 20,
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
          }}
        >
          {state.unreadCount > 9 ? '9+' : state.unreadCount}
        </span>
      )}
    </button>
  );
}
