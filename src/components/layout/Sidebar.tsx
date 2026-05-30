'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Calendar, DollarSign, Users, Settings, LogOut } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',   href: '/',              Icon: LayoutDashboard },
  { id: 'absensi',     label: 'Absensi',     href: '/absensi',       Icon: Calendar },
  { id: 'uang-makan',  label: 'Uang Makan',  href: '/uang-makan',    Icon: DollarSign },
  { id: 'karyawan',    label: 'Karyawan',    href: '/karyawan',      Icon: Users },
  { id: 'pengaturan',  label: 'Pengaturan',  href: '/pengaturan',    Icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    router.push('/login');
  };

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        height: '100vh',
        background: 'white',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '18px 20px 16px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#4F46E5',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            flexShrink: 0,
          }}
        >
          HR
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#0F172A',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            HR Admin Tool
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>Manajemen Absensi</div>
        </div>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: '10px 12px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {NAV_ITEMS.map(({ id, label, href, Icon }) => {
          const active = isActive(href);
          return (
            <button
              key={id}
              onClick={() => router.push(href)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 9,
                border: 'none',
                background: active ? '#4F46E5' : 'transparent',
                color: active ? 'white' : '#475569',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ opacity: active ? 1 : 0.7, display: 'flex', alignItems: 'center' }}>
                <Icon size={18} />
              </span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* User + logout */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#4F46E5',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          AD
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Admin</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>Administrator</div>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            padding: 4,
            borderRadius: 6,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
