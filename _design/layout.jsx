// ============================================================
// layout.jsx — Sidebar Navigation
// ============================================================

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',   Icon: () => <Icons.Dashboard /> },
  { id: 'absensi',     label: 'Absensi',      Icon: () => <Icons.Calendar /> },
  { id: 'uang-makan',  label: 'Uang Makan',   Icon: () => <Icons.Money /> },
  { id: 'karyawan',    label: 'Karyawan',     Icon: () => <Icons.Users /> },
  { id: 'pengaturan',  label: 'Pengaturan',   Icon: () => <Icons.Settings /> },
];

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside style={{
      width: 240, flexShrink: 0, height: '100vh',
      background: 'white', borderRight: '1px solid #E2E8F0',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: '18px 20px 16px', borderBottom: '1px solid #F1F5F9',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--color-primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0,
        }}>
          S&amp;P
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Simbolon &amp; Partners
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>HR Admin Tool</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 9, border: 'none',
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? 'white' : '#475569',
                cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 600 : 400,
                textAlign: 'left', width: '100%', transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F8FAFC'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ opacity: isActive ? 1 : 0.7, display: 'flex', alignItems: 'center' }}>
                <Icon />
              </span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div style={{
        padding: '14px 16px', borderTop: '1px solid #F1F5F9',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--color-primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>
          AD
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Admin</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>Administrator</div>
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { Sidebar });
