// ============================================================
// components.jsx — Shared UI Components
// ============================================================

// ── Icons ────────────────────────────────────────────────────
const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Money: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="13" rx="2"/>
      <circle cx="12" cy="12" r="3"/>
      <path d="M17 6V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  TrendUp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
};

// ── StatusBadge ───────────────────────────────────────────────
function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      borderRadius: 6,
      fontSize: size === 'sm' ? 12 : 13,
      fontWeight: cfg.bold ? 700 : 500,
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.color}30`,
      whiteSpace: 'nowrap', lineHeight: 1.5,
      letterSpacing: '-0.01em',
    }}>
      {cfg.label}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────
function Avatar({ name, size = 36, id = 1 }) {
  const color = getAvatarColor(id);
  const initials = getInitials(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '18', color,
      fontWeight: 700, fontSize: Math.floor(size * 0.36),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, border: `2px solid ${color}30`,
      letterSpacing: '0.02em',
    }}>
      {initials}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, type === 'success' ? 3000 : 5000);
    return () => clearTimeout(t);
  }, []);
  const bg = type === 'success' ? '#10B981' : '#EF4444';
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: bg, color: 'white',
      padding: '12px 16px', borderRadius: 10,
      boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 14, fontWeight: 500, maxWidth: 340,
      animation: 'slideUp 0.2s ease',
    }}>
      {type === 'success' ? <Icons.Check /> : <Icons.AlertCircle />}
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'rgba(255,255,255,0.25)', border: 'none', color: 'white',
        cursor: 'pointer', borderRadius: 6, padding: '3px 6px', display: 'flex', alignItems: 'center',
      }}>
        <Icons.X />
      </button>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children, footer, width = 480 }) {
  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      animation: 'fadeIn 0.15s ease',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'white', borderRadius: 16, width: '100%', maxWidth: width,
        boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.2s ease',
      }}>
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #E2E8F0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#0F172A' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: '#F1F5F9', border: 'none', borderRadius: 8,
            padding: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748B',
          }}>
            <Icons.X />
          </button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ConfirmDialog ─────────────────────────────────────────────
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Hapus', isDanger = true }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width={380}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={sharedStyles.btnSecondary}>Batal</button>
          <button onClick={() => { onConfirm(); onClose(); }}
            style={{ ...sharedStyles.btnPrimary, background: isDanger ? '#EF4444' : 'var(--color-primary)' }}>
            {confirmLabel}
          </button>
        </div>
      }>
      <p style={{ margin: 0, color: '#475569', lineHeight: 1.65, fontSize: 14 }}>{message}</p>
    </Modal>
  );
}

// ── FormInput ─────────────────────────────────────────────────
function FormInput({ label, error, ...props }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={sharedStyles.label}>{label}</label>}
      <input
        {...props}
        style={{
          ...sharedStyles.input,
          borderColor: error ? '#EF4444' : focused ? 'var(--color-primary)' : '#E2E8F0',
          boxShadow: focused ? '0 0 0 3px var(--color-primary-light)' : 'none',
          background: error ? '#FEF2F2' : 'white',
          transition: 'all 0.15s',
        }}
        onFocus={e => { setFocused(true); props.onFocus && props.onFocus(e); }}
        onBlur={e => { setFocused(false); props.onBlur && props.onBlur(e); }}
      />
      {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#EF4444' }}>{error}</p>}
    </div>
  );
}

// ── FormSelect ────────────────────────────────────────────────
function FormSelect({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={sharedStyles.label}>{label}</label>}
      <select {...props} style={{ ...sharedStyles.input, cursor: 'pointer', appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
        paddingRight: 32,
      }}>
        {children}
      </select>
    </div>
  );
}

// ── PageHeader ────────────────────────────────────────────────
function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{
      padding: '20px 28px', background: 'white',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0, gap: 16,
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>{title}</h1>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

// ── MonthNav ──────────────────────────────────────────────────
function MonthNav({ label }) {
  const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2,
      background: '#F8FAFC', border: '1px solid #E2E8F0',
      borderRadius: 8, padding: '0 4px',
    }}>
      <button style={sharedStyles.iconBtn} title="Bulan sebelumnya"><Icons.ChevronLeft /></button>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', padding: '6px 8px', minWidth: 120, textAlign: 'center' }}>
        {label || 'Mei 2026'}
      </span>
      <button style={{ ...sharedStyles.iconBtn, opacity: 0.35, cursor: 'not-allowed' }} title="Bulan ini sudah terbaru"><Icons.ChevronRight /></button>
    </div>
  );
}

// ── SummaryCard ───────────────────────────────────────────────
function SummaryCard({ label, value, sub, icon, color }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '20px 22px',
      border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: color + '15', color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ margin: '4px 0 2px', fontSize: 26, fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{value}</p>
        {sub && <p style={{ margin: 0, fontSize: 12, color: '#94A3B8' }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Shared Styles ─────────────────────────────────────────────
const sharedStyles = {
  btnPrimary: {
    background: 'var(--color-primary)', color: 'white', border: 'none',
    padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
    fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'opacity 0.15s',
  },
  btnSecondary: {
    background: 'white', color: '#475569', border: '1px solid #E2E8F0',
    padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
    fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'background 0.15s',
  },
  input: {
    width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0',
    borderRadius: 6, fontSize: 14, color: '#0F172A', background: 'white',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  },
  label: {
    display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 5,
  },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '6px', borderRadius: 6, display: 'flex', alignItems: 'center',
    color: '#64748B', transition: 'background 0.1s',
  },
};

Object.assign(window, {
  Icons, StatusBadge, Avatar, Toast, Modal, ConfirmDialog,
  FormInput, FormSelect, PageHeader, MonthNav, SummaryCard, sharedStyles,
});
